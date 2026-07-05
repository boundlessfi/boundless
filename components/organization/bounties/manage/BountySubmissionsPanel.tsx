'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Github,
  Loader2,
  PlaySquare,
  Star,
  Trophy,
  Twitter,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BoundlessButton } from '@/components/buttons';
import EmptyState from '@/components/EmptyState';
import { submissionStatusClass } from '@/components/bounties/statusClass';
import {
  useBountySubmissions,
  type OrganizerBountySubmission,
} from '@/features/bounties';
import { ordinal } from '@/lib/utils';

/** Matches the backend's default page size (organizer submissions endpoint). */
const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Token amounts arrive as decimal strings; show full Stellar precision. */
function formatTierAmount(amount: string): string {
  const n = Number(amount);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 7 })
    : amount;
}

export default function BountySubmissionsPanel({
  organizationId,
  bountyId,
  rewardCurrency,
  staged,
  onToggleStage,
}: {
  organizationId: string;
  bountyId: string;
  rewardCurrency: string;
  staged: Set<string>;
  onToggleStage: (id: string) => void;
}) {
  const [page, setPage] = useState(1);

  // Organizers always see submissions, regardless of submissionVisibility.
  // HIDDEN_UNTIL_DEADLINE only hides peer work from other participants.
  const { data, isLoading, error } = useBountySubmissions(
    organizationId,
    bountyId,
    { params: { page, limit: PAGE_SIZE } }
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12'>
        <EmptyState
          title="Couldn't load submissions"
          description='Try again in a moment.'
          type='compact'
        />
      </div>
    );
  }

  const submissions = data?.items ?? [];
  const total = data?.total ?? submissions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (submissions.length === 0) {
    return (
      <div className='py-12'>
        <EmptyState
          title='No submissions yet'
          description='Submitted work will appear here for review.'
          type='compact'
        />
      </div>
    );
  }

  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart + submissions.length - 1;

  return (
    <div className='space-y-4'>
      {staged.size > 0 && (
        <div className='border-primary/30 bg-primary/10 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm'>
          <Trophy className='text-primary h-4 w-4' />
          <span className='text-zinc-200'>{staged.size} staged for payout</span>
          <span className='text-xs text-zinc-500'>
            (winner selection + signing lands in #633)
          </span>
        </div>
      )}

      {submissions.map(s => (
        <SubmissionCard
          key={s.id}
          submission={s}
          rewardCurrency={rewardCurrency}
          staged={staged.has(s.id)}
          onToggleStage={() => onToggleStage(s.id)}
        />
      ))}

      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-zinc-800 pt-4'>
          <span className='text-xs text-zinc-500'>
            Showing {rangeStart}-{rangeEnd} of {total} submissions
          </span>
          <div className='flex items-center gap-2'>
            <BoundlessButton
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </BoundlessButton>
            <span className='text-xs text-zinc-400'>
              Page {page} of {totalPages}
            </span>
            <BoundlessButton
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </BoundlessButton>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission: s,
  rewardCurrency,
  staged,
  onToggleStage,
}: {
  submission: OrganizerBountySubmission;
  rewardCurrency: string;
  staged: boolean;
  onToggleStage: () => void;
}) {
  const user = s.submittedBy;
  const awarded = s.tierPosition != null;

  const submitter = (
    <>
      <Avatar className='h-8 w-8'>
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
        <AvatarFallback className='text-xs'>
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className='group-hover:text-primary text-sm font-medium text-white'>
          {user.name}
        </p>
        {user.username && (
          <p className='text-xs text-zinc-500'>@{user.username}</p>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`rounded-2xl border bg-zinc-900/40 p-5 transition-colors ${
        staged
          ? 'border-primary/40 bg-primary/5'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className='flex items-start justify-between gap-3'>
        {/* Submitter */}
        {user.username ? (
          <Link
            href={`/profile/${user.username}`}
            className='group flex items-center gap-2.5'
          >
            {submitter}
          </Link>
        ) : (
          <div className='flex items-center gap-2.5'>{submitter}</div>
        )}

        <div className='flex items-center gap-2'>
          {awarded && (
            <Badge
              variant='outline'
              className='border-primary/30 bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium'
            >
              <Trophy className='h-3 w-3' />
              {ordinal(s.tierPosition as number)}
              {s.tierAmount
                ? ` · ${formatTierAmount(s.tierAmount)} ${rewardCurrency}`
                : ''}
            </Badge>
          )}
          <Badge
            variant='outline'
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${submissionStatusClass(s.status)}`}
          >
            {s.status}
          </Badge>
        </div>
      </div>

      {/* Work links */}
      <div className='mt-4 flex flex-wrap gap-2'>
        {s.contentUri && (
          <LinkChip
            href={s.contentUri}
            icon={<Github className='h-3.5 w-3.5' />}
            label='Submission'
            primary
          />
        )}
        {s.documentationUrl && (
          <LinkChip
            href={s.documentationUrl}
            icon={<FileText className='h-3.5 w-3.5' />}
            label='Docs'
          />
        )}
        {s.tweetUrl && (
          <LinkChip
            href={s.tweetUrl}
            icon={<Twitter className='h-3.5 w-3.5' />}
            label='Tweet'
          />
        )}
        {s.demoVideoUrl && (
          <LinkChip
            href={s.demoVideoUrl}
            icon={<PlaySquare className='h-3.5 w-3.5' />}
            label='Demo'
          />
        )}
      </div>

      {/* Media */}
      {s.mediaUrls.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-2'>
          {s.mediaUrls.map((url, i) => (
            <a
              key={`${url}-${i}`}
              href={url}
              target='_blank'
              rel='noreferrer'
              className='relative h-16 w-24 overflow-hidden rounded-lg border border-zinc-800'
            >
              <Image
                src={url}
                alt='Submission media'
                fill
                sizes='96px'
                // Uploads go to Cloudinary (whitelisted in next.config), where
                // the optimizer serves resized thumbs; stray hosts bypass the
                // optimizer instead of throwing on an unconfigured hostname.
                unoptimized={!url.startsWith('https://res.cloudinary.com/')}
                className='object-cover'
              />
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='mt-4 flex items-center justify-between border-t border-zinc-800 pt-3'>
        <span className='text-xs text-zinc-500'>
          Submitted {formatDate(s.createdAt)}
          {s.escrowAnchorStatus && s.escrowAnchorStatus !== 'active' && (
            <span className='ml-2 text-amber-400'>
              ({s.escrowAnchorStatus.replace(/_/g, ' ')})
            </span>
          )}
        </span>
        <BoundlessButton
          variant='outline'
          size='sm'
          onClick={onToggleStage}
          className={staged ? 'border-primary text-primary' : 'text-zinc-300'}
        >
          {staged ? (
            <>
              <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
              Staged
            </>
          ) : (
            <>
              <Star className='mr-1.5 h-3.5 w-3.5' />
              Stage for payout
            </>
          )}
        </BoundlessButton>
      </div>
    </div>
  );
}

function LinkChip({
  href,
  icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        primary
          ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700'
      }`}
    >
      {icon}
      {label}
      <ExternalLink className='h-3 w-3 opacity-60' />
    </a>
  );
}
