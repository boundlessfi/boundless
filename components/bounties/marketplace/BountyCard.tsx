'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Target } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { computeBountyModeLabel } from '@/components/organization/bounties/new/tabs/schemas/modeSchema';
import {
  CATEGORY_LABELS,
  type BountyCategory,
} from '@/components/organization/bounties/new/tabs/schemas/scopeSchema';
import type { BountyPublic } from '@/features/bounties';
import { DueCountdown } from '../DueCountdown';
import { bountyStatusClass } from '../statusClass';

/** Plain-language mode label (single claim / competition / application). */
function modeLabel(b: BountyPublic): string {
  if (b.entryType && b.claimType) {
    return computeBountyModeLabel(b.entryType, b.claimType);
  }
  return 'Bounty';
}

export function BountyCard({ bounty }: { bounty: BountyPublic }) {
  const reward = bounty.rewardAmount > 0;
  const isUsdc = bounty.rewardCurrency?.toUpperCase() === 'USDC';
  const categoryLabel = bounty.category
    ? (CATEGORY_LABELS[bounty.category as BountyCategory] ?? bounty.category)
    : null;
  const statusClass = bountyStatusClass(bounty.status);

  return (
    <Link
      href={`/bounties/${bounty.id}`}
      className='group hover:border-primary/40 flex w-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:bg-zinc-900/70'
      aria-label={`View bounty ${bounty.title}`}
    >
      <div className='mb-3 flex items-center justify-between gap-2'>
        <Badge
          variant='outline'
          className='rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-200'
        >
          {modeLabel(bounty)}
        </Badge>
        <Badge
          variant='outline'
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass}`}
        >
          {bounty.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <h3 className='group-hover:text-primary line-clamp-2 min-h-12 text-lg font-bold text-white transition-colors'>
        {bounty.title}
      </h3>

      <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
        {categoryLabel && (
          <Badge
            variant='outline'
            className='rounded-full border-zinc-700 bg-zinc-800/40 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300'
          >
            {categoryLabel}
          </Badge>
        )}
        {bounty.submissionDeadline && (
          <DueCountdown deadline={bounty.submissionDeadline} />
        )}
      </div>

      <div className='mt-4 flex items-center justify-between gap-2 border-t border-zinc-800 pt-4'>
        <div className='flex items-center gap-2'>
          {isUsdc ? (
            <Image
              src='/assets/usdc.svg'
              alt='USDC'
              width={28}
              height={28}
              unoptimized
              className='h-7 w-7'
            />
          ) : (
            <div className='bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg'>
              <Target className='text-primary h-4 w-4' />
            </div>
          )}
          <div>
            <p className='text-primary text-base leading-tight font-bold'>
              {reward
                ? `${bounty.rewardAmount.toLocaleString()} ${bounty.rewardCurrency}`
                : 'No reward set'}
            </p>
            <p className='text-[11px] text-zinc-500'>reward</p>
          </div>
        </div>

        <div className='flex max-w-[45%] items-center gap-2'>
          <Avatar className='h-6 w-6'>
            <AvatarImage
              src={bounty.organization.logo ?? undefined}
              alt={bounty.organization.name}
            />
            <AvatarFallback className='text-[10px]'>
              {bounty.organization.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className='truncate text-xs text-zinc-400'>
            {bounty.organization.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
