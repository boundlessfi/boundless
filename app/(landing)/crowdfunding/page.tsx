'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCampaigns } from '@/features/crowdfunding';
import type { CrowdfundingCampaign } from '@/features/crowdfunding';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Rocket, Target } from 'lucide-react';

function CampaignCard({ c }: { c: CrowdfundingCampaign }) {
  const raised = c.fundingRaised ?? 0;
  const goal = c.fundingGoal ?? 0;
  const progress = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const project = c.project;

  return (
    <Link
      href={`/crowdfunding/${c.slug}`}
      className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/70'
    >
      <div className='relative h-40 w-full overflow-hidden bg-zinc-800'>
        {project.banner ? (
          <Image
            src={project.banner}
            alt={project.title}
            fill
            className='object-cover transition group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Rocket className='h-10 w-10 text-zinc-700' />
          </div>
        )}
      </div>
      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-3 flex items-start justify-between gap-2'>
          <div className='flex items-center gap-3'>
            {project.logo && (
              <div className='relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800'>
                <Image
                  src={project.logo}
                  alt={project.title}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div>
              <h3 className='line-clamp-1 text-sm font-semibold text-white'>
                {project.title}
              </h3>
              {project.category && (
                <p className='text-xs text-zinc-600'>{project.category}</p>
              )}
            </div>
          </div>
          {c.v2Status === 'FUNDING' && (
            <Badge className='flex-shrink-0 border-0 bg-emerald-900/50 text-xs text-emerald-400'>
              Live
            </Badge>
          )}
        </div>

        {project.tagline && (
          <p className='mb-4 line-clamp-2 text-xs text-zinc-500'>
            {project.tagline}
          </p>
        )}

        <div className='mt-auto'>
          <div className='mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-800'>
            <div
              className='bg-primary h-full rounded-full'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='flex items-center justify-between text-xs text-zinc-600'>
            <span className='flex items-center gap-1'>
              <Target className='h-3 w-3' />${raised.toLocaleString()} raised
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CrowdfundingListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useCampaigns(1, 24, { status: 'FUNDING' });

  const campaigns = data?.data ?? [];
  const filtered = campaigns.filter(
    c =>
      !search ||
      c.project.title.toLowerCase().includes(search.toLowerCase()) ||
      c.project.tagline?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='min-h-screen bg-zinc-950 py-12'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='mb-10 text-center'>
          <h1 className='text-4xl font-bold text-white'>Campaigns</h1>
          <p className='mt-3 text-zinc-500'>
            Back community-driven projects built by the Boundless ecosystem.
          </p>
        </div>

        <div className='mx-auto mb-8 max-w-md'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
            <Input
              placeholder='Search campaigns...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='border-zinc-800 bg-zinc-900 pl-9 text-white placeholder:text-zinc-600'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='h-72 animate-pulse rounded-2xl bg-zinc-900'
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-24 text-center'>
            <Rocket className='mx-auto mb-4 h-12 w-12 text-zinc-700' />
            <p className='text-zinc-500'>
              {search
                ? 'No campaigns match your search.'
                : 'No live campaigns yet.'}
            </p>
          </div>
        ) : (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map(c => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
