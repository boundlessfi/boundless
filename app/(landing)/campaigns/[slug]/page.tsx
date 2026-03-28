'use client';

import { ProjectLayout } from '@/components/project-details/project-layout';
import { reportError } from '@/lib/error-reporting';
import { ProjectLoading } from '@/components/project-details/project-loading';
import { getCrowdfundingProject } from '@/features/projects/api';
import { useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
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

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ProjectContent({
  id,
  isSubmission = false,
}: {
  id: string;
  isSubmission?: boolean;
}) {
  const [vm, setVm] = useState<ProjectViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSubmission = async (
      submissionId: string
    ): Promise<ProjectViewModel> => {
      const submissionRes = await getSubmissionDetails(submissionId);
      if (!submissionRes?.data) throw new Error('Submission not found');

      const submission = submissionRes.data;
      const subData = submission as unknown as Record<string, unknown>;

      let hackathon: Hackathon | null = null;
      if (subData.hackathonId) {
        try {
          const hackathonRes = await getHackathon(
            subData.hackathonId as string
          );
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
    };

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isSubmission) {
          const result = await fetchSubmission(id);
          if (!cancelled) setVm(result);
          return;
        }

        try {
          const projectData = await getCrowdfundingProject(id);
          if (!cancelled && projectData) {
            setVm(buildFromCrowdfunding(projectData));
            return;
          }
        } catch {
          const result = await fetchSubmission(id);
          if (!cancelled) setVm(result);
        }
      } catch (err) {
        reportError(err, { context: 'project-fetch', id });
        if (!cancelled) setError('Failed to fetch project data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjectData();
    return () => {
      cancelled = true;
    };
  }, [id, isSubmission]);

  if (loading) {
    return <ProjectLoading />;
  }

  if (error || !vm) {
    notFound();
  }

  return (
    <div className='mx-auto flex min-h-screen max-w-[1440px] flex-col space-y-10 px-4 py-4 sm:space-y-[60px] sm:px-6 sm:py-5 md:space-y-20 md:px-[50px] lg:px-[80px] xl:px-[100px] 2xl:max-w-[1800px] 2xl:px-[120px]'>
      <div className='flex-1'>
        <ProjectLayout vm={vm} />
      </div>
    </div>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [id, setId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  useEffect(() => {
    params.then(resolved => setId(resolved.slug));
  }, [params]);

  if (!id) {
    return <ProjectLoading />;
  }

  return <ProjectContent id={id} isSubmission={isSubmission} />;
}
