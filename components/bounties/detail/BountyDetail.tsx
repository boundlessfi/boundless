'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Award, Calendar, Info, Loader2, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EmptyState from '@/components/EmptyState';
import {
  computeBountyModeLabel,
  computeBountyModeDescription,
} from '@/components/organization/bounties/new/tabs/schemas/modeSchema';
import {
  CATEGORY_LABELS,
  type BountyCategory,
} from '@/components/organization/bounties/new/tabs/schemas/scopeSchema';
import {
  useBounty,
  useMyBountyApplication,
  useMyBountySubmission,
} from '@/features/bounties';
import { ordinal } from '@/lib/utils';
import { BountyEntryCta } from './BountyEntryCta';
import BountySubmitPanel from './submit/BountySubmitPanel';
import { DueCountdown } from '../DueCountdown';

// Markdown renderer (matches the wizard's editor package).
const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
  { ssr: false }
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BountyDetail({ id }: { id: string }) {
  const { data: bounty, isLoading, error } = useBounty(id);
  const { data: myApplication } = useMyBountyApplication(id);
  const { data: mySubmission } = useMyBountySubmission(id);
  // An anchored (non-withdrawn) submission must be withdrawn before the
  // application/claim can be withdrawn (the contract enforces this order).
  const hasActiveSubmission = mySubmission?.escrowAnchorStatus === 'active';

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error || !bounty) {
    return (
      <div className='py-20'>
        <EmptyState
          title='Bounty not found'
          description='This bounty may have been removed or is not public.'
          type='compact'
        />
        <div className='mt-4 text-center'>
          <Link
            href='/bounties'
            className='text-primary text-sm hover:underline'
          >
            Back to bounties
          </Link>
        </div>
      </div>
    );
  }

  const modeLabel =
    bounty.entryType && bounty.claimType
      ? computeBountyModeLabel(bounty.entryType, bounty.claimType)
      : 'Bounty';
  const modeDescription =
    bounty.entryType && bounty.claimType
      ? computeBountyModeDescription(bounty.entryType, bounty.claimType)
      : null;
  const currency = bounty.rewardCurrency;
  const isUsdc = currency?.toUpperCase() === 'USDC';
  const categoryLabel = bounty.category
    ? (CATEGORY_LABELS[bounty.category as BountyCategory] ?? bounty.category)
    : null;

  return (
    <div>
      <Link
        href='/bounties'
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to bounties
      </Link>

      <div className='grid gap-8 lg:grid-cols-[1fr_360px]'>
        {/* Main */}
        <div className='min-w-0'>
          <div className='mb-4 flex flex-wrap items-center gap-2'>
            {modeDescription ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant='outline'
                    className='flex cursor-help items-center gap-1 rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-200'
                  >
                    {modeLabel}
                    <Info className='h-3 w-3 text-zinc-400' />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs text-xs leading-relaxed'>
                  {modeDescription}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Badge
                variant='outline'
                className='rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-200'
              >
                {modeLabel}
              </Badge>
            )}
            <Badge
              variant='outline'
              className='rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-300 capitalize'
            >
              {bounty.status.replace(/_/g, ' ')}
            </Badge>
            {categoryLabel && (
              <Badge
                variant='outline'
                className='rounded-full border-zinc-700 bg-zinc-800/40 px-3 py-1 text-xs font-medium text-zinc-300'
              >
                {categoryLabel}
              </Badge>
            )}
          </div>

          <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
            {bounty.title}
          </h1>
          <div className='mt-2 flex items-center gap-2 text-sm text-zinc-400'>
            <span>by</span>
            <Avatar className='h-5 w-5'>
              <AvatarImage
                src={bounty.organization.logo ?? undefined}
                alt={bounty.organization.name}
              />
              <AvatarFallback className='text-[10px]'>
                {bounty.organization.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className='text-zinc-200'>{bounty.organization.name}</span>
          </div>

          {/* Description (markdown) */}
          <div className='boundless-markdown mt-8' data-color-mode='dark'>
            <Markdown
              source={bounty.description}
              style={{ background: 'transparent', color: '#e4e4e7' }}
            />
          </div>

          {/* Prize tiers */}
          {bounty.prizeTiers.length > 0 && (
            <div className='mt-10'>
              <h2 className='mb-3 flex items-center gap-2 text-lg font-semibold text-white'>
                <Award className='text-primary h-5 w-5' />
                Prize tiers
              </h2>
              <div className='space-y-2'>
                {bounty.prizeTiers
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map(tier => (
                    <div
                      key={tier.position}
                      className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3'
                    >
                      <span className='text-sm font-medium text-zinc-300'>
                        {ordinal(tier.position)} place
                      </span>
                      <span className='text-primary text-sm font-semibold'>
                        {Number(tier.amount).toLocaleString()} {currency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className='space-y-4 lg:sticky lg:top-6 lg:self-start'>
          {/* Reward */}
          <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5'>
            <div className='flex items-center gap-3'>
              {isUsdc ? (
                <Image
                  src='/assets/usdc.svg'
                  alt='USDC'
                  width={44}
                  height={44}
                  unoptimized
                  className='h-11 w-11'
                />
              ) : (
                <div className='bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl'>
                  <Award className='text-primary h-5 w-5' />
                </div>
              )}
              <div>
                <p className='text-primary text-xl font-bold'>
                  {bounty.rewardAmount > 0
                    ? `${bounty.rewardAmount.toLocaleString()} ${currency}`
                    : 'No reward set'}
                </p>
                <p className='text-xs text-zinc-500'>total reward pool</p>
              </div>
            </div>

            {/* Eligibility / mode facts */}
            <dl className='mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm'>
              {bounty.submissionDeadline && (
                <div className='flex items-center justify-between gap-3'>
                  <dt className='text-zinc-400'>Deadline</dt>
                  <dd className='text-right'>
                    <DueCountdown
                      deadline={bounty.submissionDeadline}
                      className='flex items-center gap-1.5 text-xs font-medium text-zinc-200'
                    />
                  </dd>
                </div>
              )}
              {bounty.entryType === 'OPEN' &&
                bounty.claimType === 'SINGLE_CLAIM' &&
                bounty.reputationMinimum != null && (
                  <Row
                    label='Minimum reputation'
                    value={String(bounty.reputationMinimum)}
                  />
                )}
              {bounty.applicationWindowCloseAt && (
                <Row
                  icon={<Calendar className='h-3.5 w-3.5' />}
                  label='Applications close'
                  value={formatDate(bounty.applicationWindowCloseAt)}
                />
              )}
              {bounty.maxApplicants != null && (
                <Row
                  icon={<Users className='h-3.5 w-3.5' />}
                  label='Max applicants'
                  value={String(bounty.maxApplicants)}
                />
              )}
              {bounty.shortlistSize != null && (
                <Row
                  label='Shortlist size'
                  value={String(bounty.shortlistSize)}
                />
              )}
            </dl>
          </div>

          {/* Mode-aware CTA + caller status */}
          <BountyEntryCta
            bounty={bounty}
            myApplication={myApplication ?? null}
            hasActiveSubmission={hasActiveSubmission}
          />

          {/* Submit work (shown when the builder is eligible) */}
          <BountySubmitPanel
            bounty={bounty}
            myApplication={myApplication ?? null}
            hasActiveSubmission={hasActiveSubmission}
          />
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='flex items-center gap-1.5 text-zinc-400'>
        {icon}
        {label}
      </dt>
      <dd className='text-right font-medium text-white'>{value}</dd>
    </div>
  );
}
