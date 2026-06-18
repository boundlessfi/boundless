'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCampaign } from '@/features/crowdfunding';
import type { CrowdfundingContributor } from '@/features/crowdfunding';
import { ContributeSheet } from '@/components/crowdfunding/ContributeSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Target,
  Clock,
  Users,
  Github,
  Globe,
  Video,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function daysLeft(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function pct(raised: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function BackerRow({ c }: { c: CrowdfundingContributor }) {
  const isAnon = !c.username && !c.name;
  return (
    <div className='flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3'>
      <div className='relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800'>
        {c.image ? (
          <Image
            src={c.image}
            alt={c.name || 'Backer'}
            fill
            className='object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500'>
            {isAnon
              ? '?'
              : (c.name || c.username || 'B').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-zinc-200'>
          {isAnon ? 'Anonymous supporter' : c.name || c.username}
        </p>
        {c.message && (
          <p className='truncate text-xs text-zinc-500'>{c.message}</p>
        )}
      </div>
      <div className='flex-shrink-0 text-right'>
        <p className='text-sm font-semibold text-white'>
          ${c.amount.toLocaleString()}
        </p>
        <p className='text-xs text-zinc-600'>
          {new Date(c.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

export default function PublicCampaignPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading } = useCampaign(slug);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-5xl px-4 py-20 text-center text-zinc-500'>
        Loading...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='container mx-auto max-w-5xl px-4 py-20 text-center text-zinc-500'>
        Campaign not found.
      </div>
    );
  }

  const project = campaign.project;
  const raised = campaign.fundingRaised ?? 0;
  const goal = campaign.fundingGoal ?? 0;
  const progress = pct(raised, goal);
  const days = daysLeft(campaign.fundingEndDate);
  const isLive = campaign.v2Status === 'FUNDING';
  const backers = campaign.contributors ?? [];

  const statusLabel: Record<string, string> = {
    FUNDING: 'Live',
    COMPLETED: 'Completed',
    VOTING: 'Community Vote',
    DRAFT: 'Draft',
    SUBMITTED_FOR_REVIEW: 'Under Review',
  };

  return (
    <div className='min-h-screen bg-zinc-950'>
      {/* Back link */}
      <div className='border-b border-zinc-900'>
        <div className='container mx-auto max-w-5xl px-4 py-3'>
          <Link
            href='/crowdfunding'
            className='inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300'
          >
            <ArrowLeft className='h-4 w-4' />
            All campaigns
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className='relative'>
        {project.banner ? (
          <div className='relative h-64 w-full overflow-hidden sm:h-80'>
            <Image
              src={project.banner}
              alt={project.title}
              fill
              className='object-cover'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent' />
          </div>
        ) : (
          <div className='h-32 w-full bg-gradient-to-br from-zinc-900 to-zinc-800' />
        )}
      </div>

      <div className='container mx-auto max-w-5xl px-4 pb-20'>
        {/* Title row */}
        <div className='-mt-8 mb-8 flex items-end justify-between gap-4'>
          <div className='flex items-end gap-4'>
            {project.logo && (
              <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900 shadow-lg'>
                <Image
                  src={project.logo}
                  alt={project.title}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div>
              <h1 className='text-2xl font-bold text-white sm:text-3xl'>
                {project.title}
              </h1>
              {project.tagline && (
                <p className='mt-1 text-base text-zinc-400'>
                  {project.tagline}
                </p>
              )}
            </div>
          </div>
          {campaign.v2Status && (
            <Badge
              className={cn(
                'flex-shrink-0 border-0 text-xs',
                isLive
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              )}
            >
              {statusLabel[campaign.v2Status] ?? campaign.v2Status}
            </Badge>
          )}
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Main content */}
          <div className='lg:col-span-2'>
            <Tabs defaultValue='about'>
              <TabsList className='mb-6 border-b border-zinc-800 bg-transparent'>
                {(['about', 'milestones', 'team', 'backers'] as const).map(
                  t => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent pb-3 text-sm text-zinc-500 capitalize data-[state=active]:bg-transparent data-[state=active]:text-white'
                    >
                      {t}
                      {t === 'backers' && backers.length > 0 && (
                        <span className='ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400'>
                          {backers.length}
                        </span>
                      )}
                    </TabsTrigger>
                  )
                )}
              </TabsList>

              <TabsContent value='about' className='mt-0'>
                <div className='prose prose-invert prose-zinc max-w-none leading-relaxed text-zinc-300'>
                  {project.vision || project.description || (
                    <p className='text-zinc-600 italic'>
                      No description provided.
                    </p>
                  )}
                </div>
                {(project.githubUrl ||
                  project.projectWebsite ||
                  project.demoVideo) && (
                  <div className='mt-8 flex flex-wrap gap-3'>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white'
                      >
                        <Github className='h-4 w-4' />
                        GitHub
                        <ExternalLink className='h-3 w-3 text-zinc-600' />
                      </a>
                    )}
                    {project.projectWebsite && (
                      <a
                        href={project.projectWebsite}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white'
                      >
                        <Globe className='h-4 w-4' />
                        Website
                        <ExternalLink className='h-3 w-3 text-zinc-600' />
                      </a>
                    )}
                    {project.demoVideo && (
                      <a
                        href={project.demoVideo}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white'
                      >
                        <Video className='h-4 w-4' />
                        Demo
                        <ExternalLink className='h-3 w-3 text-zinc-600' />
                      </a>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='milestones' className='mt-0'>
                {campaign.milestones.length === 0 ? (
                  <p className='text-zinc-600 italic'>No milestones listed.</p>
                ) : (
                  <div className='space-y-4'>
                    {campaign.milestones.map((m, idx) => {
                      const statusColors: Record<string, string> = {
                        completed:
                          'text-emerald-400 bg-emerald-900/30 border-emerald-800/30',
                        approved:
                          'text-emerald-400 bg-emerald-900/30 border-emerald-800/30',
                        in_review:
                          'text-amber-400 bg-amber-900/30 border-amber-800/30',
                        submitted:
                          'text-amber-400 bg-amber-900/30 border-amber-800/30',
                        pending:
                          'text-zinc-400 bg-zinc-900/30 border-zinc-800/30',
                      };
                      const sc =
                        statusColors[m.reviewStatus?.toLowerCase()] ??
                        statusColors.pending;
                      return (
                        <div
                          key={idx}
                          className='rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div>
                              <p className='text-sm font-semibold text-white'>
                                {idx + 1}. {m.name}
                              </p>
                              {m.description && (
                                <p className='mt-1 text-sm text-zinc-500'>
                                  {m.description}
                                </p>
                              )}
                            </div>
                            <div className='flex flex-shrink-0 flex-col items-end gap-1'>
                              {isLive && m.amount != null && (
                                <span className='text-sm font-semibold text-white'>
                                  ${m.amount.toLocaleString()}
                                </span>
                              )}
                              {m.reviewStatus && (
                                <Badge
                                  className={cn(
                                    'border text-xs capitalize',
                                    sc
                                  )}
                                >
                                  {m.reviewStatus.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {m.endDate && (
                            <p className='mt-2 flex items-center gap-1.5 text-xs text-zinc-600'>
                              <Clock className='h-3 w-3' />
                              Due{' '}
                              {new Date(m.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='team' className='mt-0'>
                {campaign.team.length === 0 ? (
                  <p className='text-zinc-600 italic'>
                    No team members listed.
                  </p>
                ) : (
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {campaign.team.map((m, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4'
                      >
                        <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800'>
                          {m.image ? (
                            <Image
                              src={m.image}
                              alt={m.name}
                              fill
                              className='object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500'>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium text-white'>
                            {m.name}
                          </p>
                          <p className='text-xs text-zinc-500'>{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='backers' className='mt-0'>
                {backers.length === 0 ? (
                  <div className='flex flex-col items-center gap-2 py-10 text-center'>
                    <Users className='h-8 w-8 text-zinc-700' />
                    <p className='text-sm text-zinc-600'>
                      No backers yet. Be the first!
                    </p>
                    {isLive && (
                      <Button
                        onClick={() => setSheetOpen(true)}
                        className='bg-primary hover:bg-primary/90 mt-2'
                        size='sm'
                      >
                        Back this project
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {backers.map((c, i) => (
                      <BackerRow key={i} c={c} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className='space-y-5'>
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5'>
              <div className='mb-4'>
                <div className='h-2 overflow-hidden rounded-full bg-zinc-800'>
                  <div
                    className='bg-primary h-full rounded-full transition-all'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className='mt-2 flex items-center justify-between text-xs text-zinc-500'>
                  <span>{progress}% funded</span>
                  {days !== null && <span>{days} days left</span>}
                </div>
              </div>

              <div className='mb-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <Target className='h-4 w-4 text-zinc-600' />
                  <div>
                    <p className='text-xl font-bold text-white'>
                      ${raised.toLocaleString()}
                    </p>
                    <p className='text-xs text-zinc-500'>
                      raised of ${goal.toLocaleString()} goal
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-zinc-600' />
                  <div>
                    <p className='text-base font-semibold text-white'>
                      {backers.length}
                    </p>
                    <p className='text-xs text-zinc-500'>backers</p>
                  </div>
                </div>
              </div>

              {isLive ? (
                <Button
                  onClick={() => setSheetOpen(true)}
                  className='bg-primary hover:bg-primary/90 w-full'
                  size='lg'
                >
                  Back this project
                </Button>
              ) : (
                <div className='rounded-lg bg-zinc-800/50 px-4 py-3 text-center text-sm text-zinc-500'>
                  {campaign.v2Status === 'COMPLETED'
                    ? 'This campaign has closed.'
                    : 'Contributions open when the campaign goes live.'}
                </div>
              )}
            </div>

            {project.creator && (
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5'>
                <p className='mb-3 text-xs font-semibold tracking-wider text-zinc-600 uppercase'>
                  Builder
                </p>
                <div className='flex items-center gap-3'>
                  <div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800'>
                    {project.creator.image ? (
                      <Image
                        src={project.creator.image}
                        alt={project.creator.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500'>
                        {(project.creator.name || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      {project.creator.name}
                    </p>
                    {project.creator.username && (
                      <p className='text-xs text-zinc-500'>
                        @{project.creator.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ContributeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campaignId={campaign.id}
        campaignTitle={project.title}
        fundingGoal={goal}
        raisedAmount={raised}
      />
    </div>
  );
}
