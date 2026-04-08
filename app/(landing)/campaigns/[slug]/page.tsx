'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { reportError } from '@/lib/error-reporting';
import { getCrowdfundingProject } from '@/features/projects/api';
import {
  getSubmissionDetails,
  getHackathon,
  type ParticipantSubmission,
} from '@/lib/api/hackathons';
import type { Hackathon } from '@/lib/api/hackathons';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import {
  buildFromCrowdfunding,
  buildFromSubmission,
} from '@/features/projects/lib/build-view-model';

import { HeroSection } from '../../projects/[slug]/components/hero-section';
import {
  ProjectTabs,
  buildProjectTabs,
  type ProjectTabValue,
} from '../../projects/[slug]/components/project-tabs';
import { DetailsTab } from '../../projects/[slug]/components/details-tab';
import { TeamTab } from '../../projects/[slug]/components/team-tab';
import { MilestonesTab } from '../../projects/[slug]/components/milestones-tab';
import { VotersTab } from '../../projects/[slug]/components/voters-tab';
import { BackersTab } from '../../projects/[slug]/components/backers-tab';
import { ProjectComments } from '@/components/project-details/comment-section/project-comments';
import {
  HeroSectionSkeleton,
  ProjectTabsSkeleton,
  DetailsTabSkeleton,
} from '../../projects/[slug]/components/skeletons';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Content component ───────────────────────────────────────────────────────

function ProjectContent({
  id,
  isSubmission,
}: {
  id: string;
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
          const result = await fetchAsSubmission(id);
          if (!cancelled) setVm(result);
          return;
        }

        // ── Primary path for the campaigns route: try crowdfunding first ──
        try {
          const projectData = await getCrowdfundingProject(id);
          if (!cancelled && projectData) {
            setVm(buildFromCrowdfunding(projectData));
            return;
          }
        } catch {
          // Not a crowdfunding campaign — fall through to submission
        }

        // ── Fallback: hackathon submission ──
        try {
          const result = await fetchAsSubmission(id);
          if (!cancelled) setVm(result);
          return;
        } catch {
          // Nothing found at all
        }

        if (!cancelled) setError('Project not found');
      } catch (err) {
        reportError(err, { context: 'campaigns-fetch', id });
        if (!cancelled) setError('Failed to fetch project data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, isSubmission]);

  // Silent background re-fetch after pledge/cancellation — keeps current vm
  // on failure so the UI never flashes empty.
  const refreshData = async () => {
    try {
      if (isSubmission) {
        const result = await fetchAsSubmission(id);
        setVm(result);
        return;
      }
      try {
        const projectData = await getCrowdfundingProject(id);
        if (projectData) setVm(buildFromCrowdfunding(projectData));
      } catch {
        /* fail silently — existing vm stays */
      }
    } catch {
      /* fail silently */
    }
  };

  if (loading) {
    return <ProjectPageSkeleton />;
  }

  if (error || !vm) {
    notFound();
  }

  return (
    <ProjectPageContent
      vm={vm}
      isSubmission={isSubmission}
      onRefresh={refreshData}
    />
  );
}

function ProjectPageContent({
  vm,
  isSubmission,
  onRefresh,
}: {
  vm: ProjectViewModel;
  isSubmission: boolean;
  onRefresh: () => Promise<void>;
}) {
  const tabs = useMemo(() => buildProjectTabs(vm), [vm]);
  const [activeTab, setActiveTab] = useState<ProjectTabValue>(
    tabs[0]?.value ?? 'details'
  );

  return (
    <main className='bg-background-main-bg min-h-screen'>
      <div className='mx-auto max-w-[1440px] space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8 md:px-[50px] lg:px-[80px] xl:px-[100px] 2xl:max-w-[1800px] 2xl:px-[120px]'>
        <HeroSection
          vm={vm}
          isSubmission={isSubmission}
          onRefresh={onRefresh}
        />

        <div className='space-y-8'>
          <ProjectTabs
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
          />

          {activeTab === 'details' && <DetailsTab vm={vm} />}
          {activeTab === 'team' && <TeamTab vm={vm} />}
          {activeTab === 'milestones' && <MilestonesTab vm={vm} />}
          {activeTab === 'voters' && <VotersTab vm={vm} />}
          {activeTab === 'backers' && <BackersTab vm={vm} />}
          {activeTab === 'comments' && <ProjectComments projectId={vm.id} />}
        </div>
      </div>
    </main>
  );
}

// ─── Initial-load skeleton ───────────────────────────────────────────────────

function ProjectPageSkeleton() {
  return (
    <main className='bg-background-main-bg min-h-screen'>
      <div className='mx-auto max-w-[1440px] space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8 md:px-[50px] lg:px-[80px] xl:px-[100px] 2xl:max-w-[1800px] 2xl:px-[120px]'>
        <HeroSectionSkeleton />
        <div className='space-y-8'>
          <ProjectTabsSkeleton />
          <DetailsTabSkeleton />
        </div>
      </div>
    </main>
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
        context: 'campaigns-fetchHackathonDetails',
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

export default function CampaignPage({ params }: ProjectPageProps) {
  const [id, setId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  useEffect(() => {
    params.then(resolved => setId(resolved.slug));
  }, [params]);

  if (!id) {
    return <ProjectPageSkeleton />;
  }

  return <ProjectContent id={id} isSubmission={isSubmission} />;
}
