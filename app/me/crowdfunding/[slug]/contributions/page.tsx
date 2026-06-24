'use client';

import { use, useEffect, useState } from 'react';
import { getCrowdfundingProject } from '@/features/projects/api';
import type { Crowdfunding } from '@/features/projects/types';
import { ContributionsDataTable } from './contributions-data-table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ContributionsMetrics } from '@/components/crowdfunding/contributions-metrics';

interface ContributionsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ContributionsPage({ params }: ContributionsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [project, setProject] = useState<Crowdfunding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getCrowdfundingProject(slug);
        setProject(data);
      } catch {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return (
    <div className='flex min-h-screen flex-col px-5 py-8'>
      {/* Header */}
      <div className='mb-8 space-y-4'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/me/crowdfunding/${slug}`)}
          className='-ml-2 text-[#B5B5B5] hover:bg-[#1A1A1A] hover:text-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Campaign
        </Button>

        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-white'>Contributions</h1>
          {project && (
            <div className='flex items-center gap-3'>
              <p className='text-[#B5B5B5]'>
                Project:{' '}
                <span className='font-medium text-white'>
                  {project.project.title}
                </span>
              </p>
              <span className='text-[#484848]'>•</span>
              <p className='text-[#B5B5B5]'>
                {project.contributors.length}{' '}
                {project.contributors.length === 1
                  ? 'Contributor'
                  : 'Contributors'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='flex-1'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          </div>
        ) : project ? (
          <div>
            <ContributionsMetrics
              contributors={project.contributors}
              currencySymbol={'USDC'}
            />
            <ContributionsDataTable
              data={project.contributors}
              loading={false}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center py-20'>
            <p className='text-[#919191]'>Failed to load contributions</p>
          </div>
        )}
      </div>
    </div>
  );
}
