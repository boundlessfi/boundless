'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { ProjectLayout } from '@/components/project-details/project-layout';
import { ProjectLoading } from '@/components/project-details/project-loading';
import { reportError } from '@/lib/error-reporting';
import {
  getProjectDetailBySlug,
  getCrowdfundingProject,
} from '@/features/projects/api';
import {
  getSubmissionDetails,
  getHackathon,
  type ParticipantSubmission,
} from '@/lib/api/hackathons';
import type { Hackathon } from '@/lib/api/hackathons';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import {
  buildFromProjectDetail,
  buildFromCrowdfunding,
  buildFromSubmission,
} from '@/features/projects/lib/build-view-model';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Content component ───────────────────────────────────────────────────────

function ProjectContent({
  slug,
  isSubmission,
}: {
  slug: string;
  isSubmission: boolean;
}) {
  const [vm, setVm] = useState<ProjectViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── Hackathon submission path ──
        if (isSubmission) {
          const result = await fetchAsSubmission(slug);
          if (!cancelled) setVm(result);
          return;
        }

        // ── Primary path: fetch from /api/projects/{slug} ──
        try {
          const projectDetail = await getProjectDetailBySlug(slug);
          if (!cancelled) setVm(buildFromProjectDetail(projectDetail));
          return;
        } catch {
          // Project slug not found — try crowdfunding
        }

        // ── Fallback: try /api/crowdfunding/{slug} directly ──
        try {
          const crowdfundData = await getCrowdfundingProject(slug);
          if (!cancelled && crowdfundData) {
            setVm(buildFromCrowdfunding(crowdfundData));
            return;
          }
        } catch {
          // Not a crowdfunding campaign either
        }

        // ── Last resort: try as hackathon submission ──
        try {
          const result = await fetchAsSubmission(slug);
          if (!cancelled) setVm(result);
          return;
        } catch {
          // Nothing found at all
        }

        if (!cancelled) setError('Project not found');
      } catch (err) {
        reportError(err, { context: 'project-fetch', slug });
        if (!cancelled) setError('Failed to fetch project data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug, isSubmission]);

  // Silent background re-fetch after pledge or cancellation — no loading flash,
  // keeps existing vm if the request fails.
  const refreshData = async () => {
    try {
      if (isSubmission) {
        const result = await fetchAsSubmission(slug);
        setVm(result);
        return;
      }
      try {
        const projectDetail = await getProjectDetailBySlug(slug);
        setVm(buildFromProjectDetail(projectDetail));
        return;
      } catch {
        /* try next */
      }
      try {
        const crowdfundData = await getCrowdfundingProject(slug);
        if (crowdfundData) setVm(buildFromCrowdfunding(crowdfundData));
      } catch {
        /* fail silently — existing vm stays */
      }
    } catch {
      /* fail silently */
    }
  };

  if (loading) {
    return <ProjectLoading />;
  }

  if (error || !vm) {
    notFound();
  }

  return (
    <div className='mx-auto flex min-h-screen max-w-[1440px] flex-col space-y-10 px-4 py-4 sm:space-y-[60px] sm:px-6 sm:py-5 md:space-y-20 md:px-[50px] lg:px-[80px] xl:px-[100px] 2xl:max-w-[1800px] 2xl:px-[120px]'>
      <div className='flex-1'>
        <ProjectLayout vm={vm} onRefresh={refreshData} />
      </div>
    </div>
  );
}

// ─── Hackathon submission helper ─────────────────────────────────────────────

async function fetchAsSubmission(id: string): Promise<ProjectViewModel> {
  const submissionRes = await getSubmissionDetails(id);
  if (!submissionRes?.data) throw new Error('Submission not found');

  const submission = submissionRes.data;
  const subData = submission as unknown as Record<string, unknown>;

  let hackathon: Hackathon | null = null;
  if (subData.hackathonId) {
    try {
      const hackathonRes = await getHackathon(subData.hackathonId as string);
      hackathon = hackathonRes.data;
    } catch (err) {
      reportError(err, {
        context: 'project-fetchHackathonDetails',
        submissionId: id,
      });
    }
  }

  if (!hackathon) throw new Error('Hackathon details not found');

  return buildFromSubmission(
    submission as ParticipantSubmission & { members?: unknown[] },
    hackathon
  );
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function ProjectPage({ params }: ProjectPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  useEffect(() => {
    params.then(resolved => setSlug(resolved.slug));
  }, [params]);

  if (!slug) {
    return <ProjectLoading />;
  }

  return <ProjectContent slug={slug} isSubmission={isSubmission} />;
}
