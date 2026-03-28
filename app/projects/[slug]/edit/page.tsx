'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useMyProject } from '@/features/projects/hooks/use-project-queries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useMyProject(slug);

  useEffect(() => {
    if (!project) return;

    const isCampaign = project.draftData?.isCampaign ?? false;
    const query = new URLSearchParams({ id: project.id });
    if (isCampaign) query.set('mode', 'campaign');

    router.replace(`/projects/create?${query.toString()}`);
  }, [project, router]);

  if (error) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center gap-3 bg-[#0a0a0a] text-white'>
        <p className='text-sm text-red-400'>Failed to load project</p>
        <button
          onClick={() => router.push('/me/projects')}
          className='text-primary text-sm underline'
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className='flex h-screen w-full items-center justify-center bg-[#0a0a0a]'>
      <div className='flex flex-col items-center gap-3'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
        <p className='text-sm text-white/40'>Loading project...</p>
      </div>
    </div>
  );
}
