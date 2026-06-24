'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Github,
  Globe,
  Video,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  LogIn,
} from 'lucide-react';

import { useCampaign } from '@/features/crowdfunding';
import type { CrowdfundingContributor } from '@/features/crowdfunding';
import {
  ContributeSheet,
  MIN_CONTRIBUTION,
} from '@/components/crowdfunding/ContributeSheet';
import { VotePanel } from '@/components/crowdfunding/VotePanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  campaignStatus,
  milestoneState,
  TONE_PILL,
} from '@/lib/crowdfunding/status';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';
import { useAuthStatus } from '@/hooks/use-auth';
import { useMarkdown } from '@/hooks/use-markdown';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function daysLeft(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function pct(raised: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function SupporterRow({ c }: { c: CrowdfundingContributor }) {
  const isAnon = !c.username && !c.name;
  const dateLabel = new Date(c.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return (
    <div className='flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3'>
      <div className='relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800'>
        {c.image ? (
          <Image
            src={c.image}
            alt={c.name || 'Supporter'}
            fill
            className='object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500'>
            {isAnon
              ? '?'
              : (c.name || c.username || 'S').charAt(0).toUpperCase()}
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
        {c.transactionHash ? (
          <a
            href={getTransactionExplorerUrl(c.transactionHash)}
            target='_blank'
            rel='noopener noreferrer'
            title='View transaction on Stellar Expert'
            className='hover:text-primary inline-flex items-center gap-1 text-xs text-zinc-600 transition'
          >
            {dateLabel}
            <ExternalLink className='h-3 w-3' />
          </a>
        ) : (
          <p className='text-xs text-zinc-600'>{dateLabel}</p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className='mb-4 text-lg font-semibold text-white'>{title}</h2>
      {children}
    </section>
  );
}

export default function PublicCampaignPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading } = useCampaign(slug);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStatus();
  const { styledContent: descriptionContent } = useMarkdown(
    campaign?.project?.details ?? campaign?.project?.description ?? ''
  );

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
  const closeDate = formatDate(campaign.fundingEndDate);
  const supporters = campaign.contributors ?? [];

  const isFunding = campaign.v2Status === 'FUNDING';
  const isVoting = campaign.v2Status === 'VOTING';
  const isComplete = campaign.v2Status === 'COMPLETED';
  const showFundingStats = isFunding || isComplete;
  // Funded once less than the contract minimum remains (the last sliver can't
  // be filled per the on-chain floor), so we stop offering "Back this project".
  const isFullyFunded =
    isFunding && goal > 0 && goal - raised < MIN_CONTRIBUTION;

  const completedMilestones = campaign.milestones.filter(m =>
    Boolean(m.claimedAt)
  ).length;

  const baseStatus = campaignStatus(campaign.v2Status);
  const status = isFullyFunded
    ? {
        label: 'Fully Funded',
        tone: 'success' as const,
        description: baseStatus.description,
      }
    : baseStatus;

  const isOwnerOrTeam =
    !!user?.id &&
    (user.id === project.creatorId ||
      campaign.team.some(m => m.id === user.id));
  // Statuses the public is allowed to observe. All others are pre-launch or
  // terminal-negative and should not expose internal status copy to strangers.
  const isPublicStatus =
    campaign.v2Status === 'VOTING' ||
    campaign.v2Status === 'FUNDING' ||
    campaign.v2Status === 'PAUSED' ||
    campaign.v2Status === 'COMPLETED';

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
      <div className='relative h-56 w-full overflow-hidden sm:h-72'>
        {project.banner ? (
          <Image
            src={project.banner}
            alt={project.title}
            fill
            className='object-cover'
            priority
          />
        ) : (
          <svg
            viewBox='0 0 1200 400'
            xmlns='http://www.w3.org/2000/svg'
            className='absolute inset-0 h-full w-full'
            preserveAspectRatio='xMidYMid slice'
          >
            <defs>
              <radialGradient id='bg-glow' cx='75%' cy='35%' r='55%'>
                <stop offset='0%' stopColor='#2EEDAA' stopOpacity='0.07' />
                <stop offset='100%' stopColor='#09090b' stopOpacity='0' />
              </radialGradient>
              <pattern
                id='dot-grid'
                x='0'
                y='0'
                width='32'
                height='32'
                patternUnits='userSpaceOnUse'
              >
                <circle cx='16' cy='16' r='1' fill='#3f3f46' opacity='0.6' />
              </pattern>
            </defs>
            {/* Base background */}
            <rect width='1200' height='400' fill='#09090b' />
            {/* Dot grid */}
            <rect width='1200' height='400' fill='url(#dot-grid)' />
            {/* Glow */}
            <rect width='1200' height='400' fill='url(#bg-glow)' />
            {/* Concentric arcs from bottom-left — Boundless brand identity */}
            {[180, 320, 460, 600, 740, 880, 1020, 1180].map((r, i) => (
              <path
                key={r}
                d={`M ${r},400 A ${r},${r} 0 0,0 0,${400 - r}`}
                stroke='#2EEDAA'
                strokeWidth='1'
                fill='none'
                opacity={Math.max(0.04, 0.22 - i * 0.025)}
              />
            ))}
            {/* Boundless wordmark — very faint watermark */}
            <text
              x='600'
              y='230'
              textAnchor='middle'
              dominantBaseline='middle'
              fontFamily='system-ui, -apple-system, sans-serif'
              fontWeight='700'
              fontSize='140'
              letterSpacing='-4'
              fill='#2EEDAA'
              opacity='0.03'
            >
              Boundless
            </text>
          </svg>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent' />
      </div>

      <div className='container mx-auto max-w-5xl px-4 pb-20'>
        {/* Title row */}
        <div className='-mt-8 mb-10 flex items-end gap-4'>
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
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-bold text-white sm:text-3xl'>
                {project.title}
              </h1>
              <Badge
                variant='outline'
                className={cn('text-xs', TONE_PILL[status.tone])}
              >
                {status.label}
              </Badge>
            </div>
            {project.tagline && (
              <p className='mt-1 text-base text-zinc-400'>{project.tagline}</p>
            )}
          </div>
        </div>

        <div className='grid gap-10 lg:grid-cols-3'>
          {/* Main content — single scroll */}
          <div className='space-y-12 lg:col-span-2'>
            {/* Story */}
            <Section title='About this campaign'>
              <div className='text-zinc-300'>
                {(project.details ?? project.description) ? (
                  descriptionContent
                ) : (
                  <span className='text-zinc-600 italic'>
                    No description provided.
                  </span>
                )}
              </div>
              {(project.githubUrl ||
                project.projectWebsite ||
                project.demoVideo) && (
                <div className='mt-6 flex flex-wrap gap-3'>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white'
                    >
                      <Github className='h-4 w-4' />
                      Code
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
            </Section>

            {/* Milestones */}
            <Section
              title={
                showFundingStats && campaign.milestones.length > 0
                  ? `Milestones (${completedMilestones} / ${campaign.milestones.length} delivered)`
                  : 'Milestones'
              }
            >
              <p className='mb-5 text-sm text-zinc-500'>
                The plan is delivered in stages. Funds are released to the team
                one stage at a time, as each is delivered and approved by a
                reviewer.
              </p>
              {campaign.milestones.length === 0 ? (
                <p className='text-zinc-600 italic'>No milestones listed.</p>
              ) : (
                <div className='space-y-4'>
                  {campaign.milestones.map((m, idx) => {
                    const st = milestoneState(m.reviewStatus, m.claimedAt);
                    const planned = formatDate(m.endDate);
                    const inner = (
                      <>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='text-sm font-semibold text-white'>
                              {idx + 1}. {m.title || m.name}
                            </p>
                            {m.description && (
                              <p className='mt-1 text-sm text-zinc-500'>
                                {m.description}
                              </p>
                            )}
                          </div>
                          <div className='flex flex-shrink-0 flex-col items-end gap-1'>
                            {showFundingStats && m.amount != null && (
                              <span className='text-sm font-semibold text-white'>
                                ${m.amount.toLocaleString()}
                              </span>
                            )}
                            <Badge
                              variant='outline'
                              className={cn('text-xs', TONE_PILL[st.tone])}
                            >
                              {st.label}
                            </Badge>
                          </div>
                        </div>
                        {planned && (
                          <p className='mt-2 flex items-center gap-1.5 text-xs text-zinc-600'>
                            <CalendarDays className='h-3 w-3' />
                            Planned for {planned}
                          </p>
                        )}
                      </>
                    );
                    return m.id ? (
                      <Link
                        key={m.id}
                        href={`/crowdfunding/${slug}/milestones/${m.id}`}
                        className='block rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/60'
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className='rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5'
                      >
                        {inner}
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Team */}
            {campaign.team.length > 0 && (
              <Section title='Team'>
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
              </Section>
            )}

            {/* Supporters */}
            <Section
              title={`Supporters${supporters.length ? ` (${supporters.length})` : ''}`}
            >
              {supporters.length === 0 ? (
                <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 py-10 text-center'>
                  <Users className='h-8 w-8 text-zinc-700' />
                  <p className='text-sm text-zinc-600'>
                    No supporters yet.
                    {isFunding ? ' Be the first to back this.' : ''}
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {supporters.map((c, i) => (
                    <SupporterRow key={i} c={c} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Sticky sidebar — funding + action */}
          <div className='lg:col-span-1'>
            <div className='space-y-5 lg:sticky lg:top-6'>
              <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5'>
                {showFundingStats ? (
                  <>
                    <div className='mb-4'>
                      <div className='h-2 overflow-hidden rounded-full bg-zinc-800'>
                        <div
                          className='bg-primary h-full rounded-full transition-all'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className='mt-2 flex items-center justify-between text-xs text-zinc-500'>
                        <span>{progress}% funded</span>
                        {isFunding && days !== null && (
                          <span>
                            {days} {days === 1 ? 'day' : 'days'} left
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='mb-1'>
                      <p className='text-2xl font-bold text-white'>
                        ${raised.toLocaleString()}
                      </p>
                      <p className='text-sm text-zinc-500'>
                        raised of ${goal.toLocaleString()} goal
                      </p>
                    </div>
                    <p className='mb-4 text-sm text-zinc-500'>
                      {supporters.length}{' '}
                      {supporters.length === 1 ? 'supporter' : 'supporters'}
                      {isFunding && closeDate ? ` · closes ${closeDate}` : ''}
                    </p>
                  </>
                ) : (
                  <div className='mb-4 space-y-2'>
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        ${goal.toLocaleString()}{' '}
                        <span className='text-sm font-normal text-zinc-500'>
                          {campaign.fundingCurrency ?? 'USDC'}
                        </span>
                      </p>
                      <p className='text-sm text-zinc-500'>funding goal</p>
                    </div>
                    {campaign.milestones.length > 0 && (
                      <p className='text-sm text-zinc-500'>
                        {campaign.milestones.length}{' '}
                        {campaign.milestones.length === 1
                          ? 'milestone'
                          : 'milestones'}{' '}
                        planned
                      </p>
                    )}
                  </div>
                )}

                {/* Primary action by state */}
                {isOwnerOrTeam ? (
                  // Owner/team: show their private status info; no voting or funding actions.
                  <div
                    className={cn(
                      'rounded-lg border px-4 py-3 text-center',
                      TONE_PILL[status.tone]
                    )}
                  >
                    <p className='text-sm font-semibold'>{status.label}</p>
                    <p className='mt-1 text-xs opacity-80'>
                      {status.description}
                    </p>
                  </div>
                ) : isFunding && !isFullyFunded ? (
                  isAuthenticated ? (
                    <>
                      <Button
                        onClick={() => setSheetOpen(true)}
                        className='bg-primary hover:bg-primary/90 w-full'
                        size='lg'
                      >
                        Back this project
                      </Button>
                      <p className='mt-3 flex items-start gap-2 text-xs text-zinc-500'>
                        <ShieldCheck className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-600' />
                        Your support is held safely and released to the team as
                        each milestone is delivered and approved.
                      </p>
                    </>
                  ) : (
                    <Link href='/auth' className='block'>
                      <Button
                        variant='outline'
                        className='w-full gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        size='lg'
                      >
                        <LogIn className='h-4 w-4' />
                        Sign in to back this project
                      </Button>
                    </Link>
                  )
                ) : isFullyFunded ? (
                  <div className='border-primary/30 bg-primary/10 rounded-lg border px-4 py-3 text-center'>
                    <p className='text-primary text-sm font-semibold'>
                      Fully funded
                    </p>
                    <p className='mt-1 text-xs text-zinc-400'>
                      This campaign reached its goal. Thanks to all{' '}
                      {supporters.length}{' '}
                      {supporters.length === 1 ? 'supporter' : 'supporters'}.
                    </p>
                  </div>
                ) : isVoting ? (
                  <VotePanel campaign={campaign} />
                ) : isPublicStatus ? (
                  <div
                    className={cn(
                      'rounded-lg border px-4 py-3 text-center',
                      TONE_PILL[status.tone]
                    )}
                  >
                    <p className='text-sm font-semibold'>{status.label}</p>
                    <p className='mt-1 text-xs opacity-80'>
                      {status.description}
                    </p>
                  </div>
                ) : (
                  // Pre-launch or terminal state accessed via direct URL; not in public listing.
                  <div className='rounded-lg border border-zinc-800 px-4 py-3 text-center'>
                    <p className='text-sm font-semibold text-zinc-400'>
                      Not yet open
                    </p>
                    <p className='mt-1 text-xs text-zinc-600'>
                      This campaign is not yet available to the public.
                    </p>
                  </div>
                )}
              </div>

              {/* Creator */}
              {project.creator && (
                <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5'>
                  <p className='mb-3 text-xs font-semibold tracking-wider text-zinc-600 uppercase'>
                    Creator
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
                          {(project.creator.name || 'C')
                            .charAt(0)
                            .toUpperCase()}
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
      </div>

      {!isOwnerOrTeam && (
        <ContributeSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          campaignId={campaign.id}
          campaignTitle={project.title}
          fundingGoal={goal}
          raisedAmount={raised}
        />
      )}
    </div>
  );
}
