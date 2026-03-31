'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Loader2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useMyProject } from '@/features/projects/hooks/use-project-queries';
import { getCrowdfundingProject } from '@/features/projects/api';
import { ProjectEditForm } from './components/ProjectEditForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Statuses that are never editable. */
const NON_EDITABLE_STATUSES = ['COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED'];

export default function EditProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useMyProject(id);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    if (!project) return;

    const status = project.status;

    // IDEA → redirect to creation flow (draft editing)
    if (status === 'IDEA') {
      const isCampaign = project.draftData?.isCampaign ?? false;
      const query = new URLSearchParams({ id: project.id });
      if (isCampaign) query.set('mode', 'campaign');
      router.replace(`/projects/create?${query.toString()}`);
      return;
    }

    // Crowdfunding project → redirect to campaign edit page
    if (
      project.originType === 'CROWDFUNDING' &&
      project._count?.crowdfundingCampaigns > 0
    ) {
      // Resolve the campaign slug/id for the redirect
      const redirectToCampaignEdit = async () => {
        try {
          const campaign = await getCrowdfundingProject(project.id);
          router.replace(
            `/me/crowdfunding/${campaign.slug || campaign.id}/edit`
          );
        } catch {
          // Fallback: use originReferenceId if available
          if (project.originReferenceId) {
            router.replace(
              `/me/crowdfunding/${project.originReferenceId}/edit`
            );
          } else {
            toast.error('Could not find the campaign for this project');
            router.push('/me/projects');
          }
        }
      };
      redirectToCampaignEdit();
      return;
    }

    // Non-editable statuses → show message (handled in render)
    // LIVE or REVIEWING → show edit form (handled in render)
    setResolving(false);
  }, [project, router]);

  if (isLoading || resolving) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-[#0a0a0a]'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-sm text-white/40'>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center gap-3 bg-[#0a0a0a] text-white'>
        <p className='text-sm text-red-400'>Failed to load project</p>
        <Button variant='ghost' asChild>
          <Link href='/me/projects'>Back to My Projects</Link>
        </Button>
      </div>
    );
  }

  // Non-editable statuses
  if (NON_EDITABLE_STATUSES.includes(project.status)) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white'>
        <AlertTriangle className='h-12 w-12 text-yellow-400' />
        <h2 className='text-xl font-semibold'>Project cannot be edited</h2>
        <p className='max-w-md text-center text-sm text-white/60'>
          Projects with status &quot;{project.status}&quot; cannot be edited.
          {project.status === 'REJECTED' &&
            ' Please create a new project or contact support.'}
        </p>
        <Button variant='ghost' asChild>
          <Link href='/me/projects'>Back to My Projects</Link>
        </Button>
      </div>
    );
  }

  // REVIEWING status
  if (project.status === 'REVIEWING') {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white'>
        <AlertTriangle className='h-12 w-12 text-yellow-400' />
        <h2 className='text-xl font-semibold'>Project is under review</h2>
        <p className='max-w-md text-center text-sm text-white/60'>
          This project is currently being reviewed. You can edit it once the
          review is complete.
        </p>
        <Button variant='ghost' asChild>
          <Link href='/me/projects'>Back to My Projects</Link>
        </Button>
      </div>
    );
  }

  // LIVE or other editable status → show the edit form
  return <ProjectEditForm project={project} />;
}
