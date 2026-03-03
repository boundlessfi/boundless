'use client';

import { motion } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CalendarDays,
  Trophy,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  FileText,
  Layers,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TableCell, TableRow as ShadcnTableRow } from '@/components/ui/table';
import Image from 'next/image';
import { format } from 'date-fns';
import { useState } from 'react';

// ─────────────────────────── Url Sanitization ───────────────────────────

export function getSafeUrl(urlString?: string): string | undefined {
  if (!urlString) return undefined;
  try {
    const parsed = new URL(urlString);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return parsed.href;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export type SortField =
  | 'projectName'
  | 'hackathon'
  | 'status'
  | 'submittedAt'
  | 'rank';
export type SortDir = 'asc' | 'desc';

export type SubmissionRow = {
  id: string;
  projectName: string;
  description?: string;
  introduction?: string;
  logo?: string;
  videoUrl?: string;
  category?: string;
  links?: Array<{ type: string; url: string }>;
  status: string;
  rank?: number | null;
  submittedAt: string;
  votes?: number | any[];
  comments?: number | any[];
  hackathon?: {
    id?: string;
    title?: string;
    name?: string;
    startDate?: string;
    submissionDeadline?: string;
    banner?: string;
  };
};

// ─────────────────────────── Status badge ───────────────────────────

export function getStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const s = (status || '').toLowerCase();

  if (
    s === 'ranked' ||
    s === 'shortlisted' ||
    s === 'winner' ||
    s === 'completed'
  ) {
    return {
      label:
        s === 'shortlisted' ? 'Ranked' : s.charAt(0).toUpperCase() + s.slice(1),
      className: 'text-primary bg-primary/10',
    };
  }
  if (s === 'under_review' || s === 'under review') {
    return {
      label: 'Under Review',
      className: 'text-amber-400 bg-amber-400/10',
    };
  }
  if (s === 'submitted') {
    return {
      label: 'Submitted',
      className: 'text-blue-400 bg-blue-400/10',
    };
  }
  if (s === 'disqualified') {
    return {
      label: 'Disqualified',
      className: 'text-red-400 bg-red-400/10',
    };
  }
  // draft / default
  return {
    label:
      s === 'draft'
        ? 'Draft'
        : s.charAt(0).toUpperCase() + s.slice(1) || 'Draft',
    className: 'text-gray-400 bg-gray-800/20',
  };
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-semibold backdrop-blur-sm ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─────────────────────────── Sort icon ───────────────────────────

export function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (sortField !== field)
    return <ChevronsUpDown className='ml-1 inline h-3.5 w-3.5 text-zinc-600' />;
  return sortDir === 'asc' ? (
    <ChevronUp className='ml-1 inline h-3.5 w-3.5 text-[#a7f950]' />
  ) : (
    <ChevronDown className='ml-1 inline h-3.5 w-3.5 text-[#a7f950]' />
  );
}

export function SubmissionsSheetContent({
  submission,
}: {
  submission: SubmissionRow;
}) {
  const hackathonName =
    submission.hackathon?.title ||
    submission.hackathon?.name ||
    'Unknown Hackathon';

  const voteCount =
    typeof submission.votes === 'number'
      ? submission.votes
      : Array.isArray(submission.votes)
        ? submission.votes.length
        : 0;

  const commentCount =
    typeof submission.comments === 'number'
      ? submission.comments
      : Array.isArray(submission.comments)
        ? submission.comments.length
        : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const viewUrl = `/projects/${submission.id}?type=submission`;

  return (
    <div className='space-y-6 px-6 pt-2 pb-8 md:px-10'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex-1 space-y-1.5'>
          <h2 className='text-2xl leading-tight font-bold text-white'>
            {submission.projectName}
          </h2>
          <p className='flex items-center gap-1.5 text-sm text-zinc-400'>
            <Layers className='h-3.5 w-3.5 shrink-0' />
            {hackathonName}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <StatusBadge status={submission.status} />
          <a
            href={viewUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={e => e.stopPropagation()}
            className='inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white'
            aria-label='View submission page'
          >
            <ExternalLink className='h-3.5 w-3.5' />
            View Page
          </a>
        </div>
      </div>

      {/* Banner / Logo */}
      {(submission.hackathon?.banner || submission.logo) && (
        <div className='relative h-48 w-full overflow-hidden rounded-xl border border-white/5'>
          <Image
            src={submission.hackathon?.banner || submission.logo!}
            alt={submission.projectName}
            fill
            className='object-cover opacity-80'
          />
          {submission.logo && submission.hackathon?.banner && (
            <div className='absolute bottom-3 left-4'>
              <div className='relative h-12 w-12 overflow-hidden rounded-lg border border-white/20 bg-black/60 backdrop-blur-md'>
                <Image
                  src={submission.logo}
                  alt='Project logo'
                  fill
                  className='object-cover'
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata strip */}
      <div className='flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400'>
        {submission.rank != null && (
          <span className='flex items-center gap-1.5'>
            <Trophy className='h-4 w-4 text-amber-400' />
            <span className='font-medium text-amber-400'>
              Rank #{submission.rank}
            </span>
          </span>
        )}
        <span className='flex items-center gap-1.5'>
          <CalendarDays className='h-4 w-4' />
          Submitted {formatDate(submission.submittedAt)}
        </span>
        {submission.category && (
          <span className='flex items-center gap-1.5'>
            <FileText className='h-4 w-4' />
            {submission.category}
          </span>
        )}
        {voteCount > 0 && (
          <span className='flex items-center gap-1.5'>
            <ThumbsUp className='h-4 w-4' />
            {voteCount} vote{voteCount !== 1 ? 's' : ''}
          </span>
        )}
        {commentCount > 0 && (
          <span className='flex items-center gap-1.5'>
            <MessageCircle className='h-4 w-4' />
            {commentCount} comment{commentCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Hackathon dates */}
      {(submission.hackathon?.startDate ||
        submission.hackathon?.submissionDeadline) && (
        <div className='flex flex-wrap gap-4 text-sm'>
          {submission.hackathon.startDate && (
            <div className='rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2'>
              <p className='text-xs text-zinc-500'>Hackathon Start</p>
              <p className='font-medium text-white'>
                {formatDate(submission.hackathon.startDate)}
              </p>
            </div>
          )}
          {submission.hackathon.submissionDeadline && (
            <div className='rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2'>
              <p className='text-xs text-zinc-500'>Submission Deadline</p>
              <p className='font-medium text-white'>
                {formatDate(submission.hackathon.submissionDeadline)}
              </p>
            </div>
          )}
        </div>
      )}

      <Separator className='bg-white/5' />

      {/* Description */}
      {submission.description && (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold tracking-wider text-zinc-500 uppercase'>
            Description
          </h3>
          <p className='leading-relaxed text-zinc-300'>
            {submission.description}
          </p>
        </div>
      )}

      {/* Introduction */}
      {submission.introduction && (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold tracking-wider text-zinc-500 uppercase'>
            Introduction
          </h3>
          <p className='leading-relaxed text-zinc-300'>
            {submission.introduction}
          </p>
        </div>
      )}

      {/* Video link */}
      {submission.videoUrl && getSafeUrl(submission.videoUrl) && (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold tracking-wider text-zinc-500 uppercase'>
            Demo Video
          </h3>
          <a
            href={getSafeUrl(submission.videoUrl)}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg border border-[#a7f950]/30 bg-[#a7f950]/5 px-3 py-2 text-sm text-[#a7f950] transition-colors hover:bg-[#a7f950]/10'
          >
            <ExternalLink className='h-4 w-4' />
            Watch Demo
          </a>
        </div>
      )}

      {/* Project links */}
      {submission.links && submission.links.length > 0 && (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold tracking-wider text-zinc-500 uppercase'>
            Project Links
          </h3>
          <div className='flex flex-wrap gap-2'>
            {submission.links.map((link, i) => {
              const safeUrl = getSafeUrl(link.url);
              if (!safeUrl) return null;
              return (
                <a
                  key={i}
                  href={safeUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white'
                >
                  <ExternalLink className='h-3.5 w-3.5 shrink-0' />
                  {link.type || link.url}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Disqualification reason */}
      {(submission.status || '').toLowerCase() === 'disqualified' &&
        (submission as any).disqualificationReason && (
          <div className='rounded-xl border border-red-500/30 bg-red-500/10 p-4'>
            <h4 className='mb-1.5 font-semibold text-red-400'>
              Disqualification Reason
            </h4>
            <p className='text-sm text-red-300'>
              {(submission as any).disqualificationReason}
            </p>
          </div>
        )}
    </div>
  );
}

export function TableRow({
  submission,
  index,
  onClick,
}: {
  submission: SubmissionRow;
  index: number;
  onClick: () => void;
}) {
  const hackathonName =
    submission.hackathon?.title || submission.hackathon?.name || '—';

  const viewUrl = `/projects/${submission.id}?type=submission`;
  const [isHoverOrFocus, setIsHoverOrFocus] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleLeftClick = (e: React.MouseEvent) => {
    // Left click only
    if (e.button !== 0) return;
    onClick();
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    // Middle click only -> open in new tab
    if (e.button === 1) {
      e.stopPropagation();
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick();
    } else if (e.key === ' ') {
      e.preventDefault(); // prevent page scrolling
      onClick();
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={handleLeftClick}
      onAuxClick={handleAuxClick}
      className='group cursor-pointer border-b border-white/5 transition-colors duration-150 hover:bg-white/[0.04]'
      onMouseEnter={() => setIsHoverOrFocus(true)}
      onMouseLeave={() => setIsHoverOrFocus(false)}
      role='button'
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${submission.projectName}`}
    >
      {/* Project */}
      <TableCell className='py-4 pr-3 pl-4'>
        <div className='flex items-center gap-3'>
          {submission.logo ? (
            <div className='relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900'>
              <Image
                src={submission.logo}
                alt={submission.projectName}
                fill
                className='object-cover'
              />
            </div>
          ) : (
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5'>
              <FileText className='h-4 w-4 text-zinc-500' />
            </div>
          )}
          <div className='flex items-center gap-2'>
            <span className='max-w-[180px] truncate font-medium text-white'>
              {submission.projectName}
            </span>
            {/* Always in DOM — fade via opacity so no layout shift */}
            <a
              href={viewUrl}
              target='_blank'
              rel='noopener noreferrer'
              onClick={e => e.stopPropagation()}
              onFocus={() => setIsHoverOrFocus(true)}
              onBlur={() => setIsHoverOrFocus(false)}
              tabIndex={isHoverOrFocus ? 0 : -1}
              aria-hidden={!isHoverOrFocus}
              title='Open submission in new tab'
              className='rounded-sm text-zinc-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-zinc-200 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#a7f950] focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 focus-visible:outline-none'
              aria-label={`Open ${submission.projectName} in new tab`}
            >
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </div>
        </div>
      </TableCell>

      {/* Hackathon */}
      <TableCell className='hidden px-3 py-4 sm:table-cell'>
        <span className='max-w-[180px] truncate text-sm text-zinc-400'>
          {hackathonName}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className='px-3 py-4'>
        <StatusBadge status={submission.status} />
      </TableCell>

      {/* Date */}
      <TableCell className='hidden px-3 py-4 lg:table-cell'>
        <span className='text-sm text-zinc-400'>
          {formatDate(submission.submittedAt)}
        </span>
      </TableCell>

      {/* Rank */}
      <TableCell className='hidden px-3 py-4 xl:table-cell'>
        {submission.rank != null ? (
          <span className='inline-flex items-center gap-1 text-sm font-medium text-amber-400'>
            <Trophy className='h-3.5 w-3.5' />#{submission.rank}
          </span>
        ) : (
          <span className='text-sm text-zinc-600'>—</span>
        )}
      </TableCell>

      {/* Chevron */}
      <TableCell className='py-4 pr-4 pl-3 text-right'>
        <ChevronDown className='ml-auto h-4 w-4 -rotate-90 text-zinc-600 transition-colors group-hover:text-zinc-300' />
      </TableCell>
    </motion.tr>
  );
}
