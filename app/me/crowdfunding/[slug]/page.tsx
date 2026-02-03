'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { getCrowdfundingProject } from '@/features/projects/api';
import { Crowdfunding } from '@/features/projects/types';

import {
  CampaignBanner,
  ProjectDetails,
  CampaignTabs,
  FundingProgress,
  ProjectLinks,
  TagsSection,
} from './components';
import { CampaignStats } from '@/components/crowdfunding/campaign-stats';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CampaignViewPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<Crowdfunding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { slug } = await params;
        const data = await getCrowdfundingProject(slug);
        setCampaign(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params]);

  if (loading) {
    return (
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        <div className='text-muted-foreground text-center'>Loading...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className='container mx-auto max-w-7xl px-4 py-12'>
        <div className='text-muted-foreground text-center'>
          Campaign not found
        </div>
      </div>
    );
  }

  const project = campaign.project;

  return (
    <div className='container mx-auto max-w-7xl space-y-8 px-4 py-8'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-4 flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild className='h-8 w-8 p-0'>
              <Link href='/me/crowdfunding'>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                {project.title}
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                {project.vision ? project.vision.slice(0, 80) : 'Campaign'}
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/me/crowdfunding/${campaign.slug}/contributions`}>
              Contributions
            </Link>
          </Button>
          <Button size='sm' asChild>
            <Link href={`/me/crowdfunding/${campaign.slug}/edit`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <CampaignStats campaign={campaign} />

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* Left Column - Main Content */}
        <div className='space-y-6 lg:col-span-3'>
          <CampaignBanner project={project} />
          <ProjectDetails campaign={campaign} project={project} />
          <CampaignTabs campaign={campaign} />
        </div>

        {/* Right Sidebar */}
        <div className='space-y-6'>
          <FundingProgress campaign={campaign} />
          <ProjectLinks project={project} />
          <TagsSection project={project} />
        </div>
      </div>
    </div>
  );
}
