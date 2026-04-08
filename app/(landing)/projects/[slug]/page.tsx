'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { HeroSection } from './components/hero-section';
import {
  ProjectTabs,
  buildProjectTabs,
  type ProjectTabValue,
} from './components/project-tabs';
import { isApiNotFound } from './components/utils';
import { DetailsTab } from './components/details-tab';
import { TeamTab } from './components/team-tab';
import { MilestonesTab } from './components/milestones-tab';
import { VotersTab } from './components/voters-tab';
import { BackersTab } from './components/backers-tab';
import { ProjectComments } from '@/components/project-details/comment-section/project-comments';
import {
  HeroSectionSkeleton,
  ProjectTabsSkeleton,
  DetailsTabSkeleton,
} from './components/skeletons';
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
        // Only fall through on a real 404. Other errors (network, 5xx, rate
        // limit, etc.) are surfaced so we don't mask backend incidents as
        // "Project not found".
        try {
          const projectDetail = await getProjectDetailBySlug(slug);
          if (!cancelled) setVm(buildFromProjectDetail(projectDetail));
          return;
        } catch (err) {
          if (!isApiNotFound(err)) throw err;
        }

        // ── Fallback: try /api/crowdfunding/{slug} directly ──
        try {
          const crowdfundData = await getCrowdfundingProject(slug);
          if (!cancelled && crowdfundData) {
            setVm(buildFromCrowdfunding(crowdfundData));
            return;
          }
        } catch (err) {
          if (!isApiNotFound(err)) throw err;
        }

        // ── Last resort: try as hackathon submission ──
        try {
          const result = await fetchAsSubmission(slug);
          if (!cancelled) setVm(result);
          return;
        } catch (err) {
          if (!isApiNotFound(err)) throw err;
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

  // Reset the active tab whenever the tab set changes (e.g. the project type
  // morphs after a refresh) so the selection never points at a tab that no
  // longer exists.
  useEffect(() => {
    if (!tabs.some(t => t.value === activeTab)) {
      setActiveTab(tabs[0]?.value ?? 'details');
    }
  }, [tabs, activeTab]);

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

          {/* Tab content panels — built one tab at a time */}
          {activeTab === 'details' && (
            <DetailsTab
              vm={vm}
              isSubmission={isSubmission}
              onRefresh={onRefresh}
            />
          )}
          {activeTab === 'team' && <TeamTab vm={vm} />}
          {activeTab === 'milestones' && <MilestonesTab vm={vm} />}
          {activeTab === 'voters' && <VotersTab vm={vm} />}
          {activeTab === 'backers' && <BackersTab vm={vm} />}
          {activeTab === 'comments' && <ProjectComments projectId={vm.id} />}
          {activeTab !== 'details' &&
            activeTab !== 'team' &&
            activeTab !== 'milestones' &&
            activeTab !== 'voters' &&
            activeTab !== 'backers' &&
            activeTab !== 'comments' && (
              <div className='border-stepper-border bg-background-card flex min-h-[200px] items-center justify-center rounded-2xl border p-8 text-sm text-gray-500'>
                {tabs.find(t => t.value === activeTab)?.label} content coming
                soon
              </div>
            )}
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
  const [paramsError, setParamsError] = useState(false);
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  useEffect(() => {
    params
      .then(resolved => setSlug(resolved.slug))
      .catch(err => {
        reportError(err, { context: 'project-page-params' });
        setParamsError(true);
      });
  }, [params]);

  if (paramsError) {
    notFound();
  }

  if (!slug) {
    return <ProjectPageSkeleton />;
  }

  return <ProjectContent slug={slug} isSubmission={isSubmission} />;
}
