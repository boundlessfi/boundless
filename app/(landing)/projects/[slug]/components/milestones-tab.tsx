'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Megaphone, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CampaignStatus,
  normalizeCampaignStatus,
  type Milestone,
} from '@/features/projects/types';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import { getCrowdfundingMilestones } from '@/features/projects/api';
import { useOptionalAuth } from '@/hooks/use-auth';
import { MilestonesTabSkeleton } from './skeletons';
import { MilestoneSubmissionModal } from '@/components/project-details/project-milestone/MilestoneSubmissionModal';
import { MilestoneDisputeModal } from '@/components/project-details/project-milestone/MilestoneDisputeModal';
import { DisputeStatusBadge } from '@/components/project-details/project-milestone/DisputeStatusBadge';
import { DisputeDetailPanel } from '@/components/project-details/project-milestone/DisputeDetailPanel';

type FilterValue =
  | 'all'
  | 'awaiting'
  | 'in-progress'
  | 'in-review'
  | 'submission'
  | 'approved'
  | 'rejected'
  | 'draft';

type DisplayStatus =
  | 'awaiting'
  | 'in-progress'
  | 'in-review'
  | 'submission'
  | 'approved'
  | 'rejected'
  | 'draft';

interface DisplayMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  percentage: number;
  status: DisplayStatus;
  dateLabel: string;
  raw: Milestone;
  index: number;
}

const STATUS_FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'submission', label: 'Submission' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
];

const STATUS_BADGE: Record<
  DisplayStatus,
  { label: string; className: string }
> = {
  approved: {
    label: 'COMPLETED',
    className: 'border-primary/40 bg-primary/10 text-primary',
  },
  'in-progress': {
    label: 'IN PROGRESS',
    className: 'border-primary/50 bg-primary/15 text-primary',
  },
  'in-review': {
    label: 'IN REVIEW',
    className: 'border-primary/40 bg-primary/10 text-primary',
  },
  submission: {
    label: 'SUBMITTED',
    className: 'border-primary/40 bg-primary/10 text-primary',
  },
  awaiting: {
    label: 'UPCOMING',
    className: 'border-stepper-border bg-inactive text-gray-400',
  },
  draft: {
    label: 'PLANNED',
    className: 'border-stepper-border bg-inactive text-gray-500',
  },
  rejected: {
    label: 'REJECTED',
    className: 'border-error-500/40 bg-error-500/10 text-error-300',
  },
};

function mapStatus(reviewStatus?: string): DisplayStatus {
  switch ((reviewStatus || 'pending').toLowerCase()) {
    case 'completed':
    case 'approved':
      return 'approved';
    case 'in-progress':
    case 'active':
      return 'in-progress';
    case 'rejected':
    case 'failed':
      return 'rejected';
    case 'submission':
    case 'submitted':
      return 'submission';
    // Resubmission states are actionable for the creator (they can submit
    // again), so display them as in-progress rather than the muted "upcoming"
    // styling that the awaiting fallback gives.
    case 'resubmission_required':
    case 'resubmission-required':
    case 'resubmit_required':
    case 'resubmit-required':
      return 'in-progress';
    case 'review':
    case 'in-review':
      return 'in-review';
    case 'draft':
      return 'draft';
    case 'pending':
    case 'awaiting':
    default:
      return 'awaiting';
  }
}

function formatDate(endDate?: string) {
  if (!endDate) return 'TBD';
  const d = new Date(endDate);
  if (!Number.isFinite(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface MilestonesTabProps {
  vm: ProjectViewModel;
}

export function MilestonesTab({ vm }: MilestonesTabProps) {
  const { user } = useOptionalAuth();
  const campaignSlug = vm.campaign?.campaignSlug;
  const onChainId = vm.campaign?.onChainId;

  const inlineMilestones = useMemo<Milestone[]>(
    () => vm.campaign?.milestones ?? vm.submission?.milestones ?? [],
    [vm.campaign?.milestones, vm.submission?.milestones]
  );

  const [fetched, setFetched] = useState<Milestone[]>(inlineMilestones);
  const [loading, setLoading] = useState(!!campaignSlug);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [disputePanel, setDisputePanel] = useState<{
    open: boolean;
    milestone: Milestone | null;
    index: number;
  }>({ open: false, milestone: null, index: 0 });

  // ── Fetch crowdfunding milestones (mirrors legacy ProjectMilestone) ──
  useEffect(() => {
    let cancelled = false;
    if (!campaignSlug) {
      setFetched(inlineMilestones);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await getCrowdfundingMilestones(campaignSlug);
        if (!cancelled) setFetched(data || []);
      } catch {
        if (!cancelled) setFetched(inlineMilestones);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignSlug, inlineMilestones]);

  const refreshMilestones = useCallback(async () => {
    if (!campaignSlug) return;
    try {
      const data = await getCrowdfundingMilestones(campaignSlug);
      setFetched(data || []);
    } catch {
      // keep existing milestones on error
    }
  }, [campaignSlug]);

  // ── Build display data ──
  const milestones = useMemo<DisplayMilestone[]>(() => {
    return fetched.map((m, index) => ({
      id: m.id || `milestone-${index}`,
      title: m.title,
      description: m.description,
      amount: m.amount,
      percentage: m.fundingPercentage,
      status: mapStatus(m.reviewStatus),
      dateLabel: formatDate(m.endDate),
      raw: m,
      index,
    }));
  }, [fetched]);

  const visible = useMemo(
    () =>
      filter === 'all'
        ? milestones
        : milestones.filter(m => m.status === filter),
    [milestones, filter]
  );

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<FilterValue, number>> = {
      all: milestones.length,
    };
    for (const m of milestones) {
      counts[m.status] = (counts[m.status] ?? 0) + 1;
    }
    return counts;
  }, [milestones]);

  // ── Permission gates (creator submit / backer dispute) ──
  const isCreator = !!(user && user.id === vm.creatorId);
  const isBacker = !!(
    user && vm.campaign?.contributors?.some(c => c.userId === user.id)
  );
  const campaignStatus = normalizeCampaignStatus(vm.status);
  const isFundedOrExecuting =
    campaignStatus === CampaignStatus.LIVE ||
    campaignStatus === CampaignStatus.FUNDED ||
    campaignStatus === CampaignStatus.EXECUTING ||
    vm.campaign?.trustlessWorkStatus === 'funded';

  // ── Render ──
  if (loading) {
    return <MilestonesTabSkeleton />;
  }

  return (
    <section className='space-y-8'>
      {/* Header */}
      <header className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <h2 className='text-2xl font-bold text-white'>Project Milestones</h2>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='hidden text-sm text-gray-500 sm:inline'>
            Filter by status:
          </span>
          <Select
            value={filter}
            onValueChange={v => setFilter(v as FilterValue)}
          >
            <SelectTrigger className='border-stepper-border bg-background-card h-9 w-[160px] text-sm text-white'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='border-stepper-border bg-background-card text-white'>
              {STATUS_FILTERS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {typeof filterCounts[opt.value] === 'number' && (
                    <span className='text-gray-500'>
                      {' '}
                      ({filterCounts[opt.value]})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {campaignSlug && (
            <Link href={`/projects/${campaignSlug}/milestones`}>
              <Button
                variant='outline'
                className='border-stepper-border bg-background-card hover:bg-inactive h-9 px-4 text-sm text-white'
              >
                View All
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Timeline (or empty state) */}
      {visible.length === 0 ? (
        milestones.length === 0 ? (
          <MilestonesEmptyState />
        ) : (
          <div className='border-stepper-border bg-background-card flex items-center justify-center rounded-2xl border py-12'>
            <p className='text-sm text-gray-500'>
              No milestones match the selected filter.
            </p>
          </div>
        )
      ) : (
        <ol className='relative space-y-10 pl-12 sm:pl-14'>
          {/* vertical track */}
          <span
            aria-hidden
            className='bg-stepper-border absolute top-3 bottom-3 left-[15px] w-px sm:left-[19px]'
          />
          {visible.map(milestone => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              vm={vm}
              isCreator={isCreator}
              isBacker={isBacker}
              isFundedOrExecuting={isFundedOrExecuting}
              onChainId={onChainId ?? null}
              onRefresh={refreshMilestones}
              onOpenDispute={(m, index) =>
                setDisputePanel({ open: true, milestone: m, index })
              }
            />
          ))}
        </ol>
      )}

      {/* Follow progress card */}
      <FollowProgressCard />

      {/* Dispute detail slide-over */}
      {disputePanel.milestone && (
        <DisputeDetailPanel
          milestone={disputePanel.milestone}
          milestoneIndex={disputePanel.index}
          open={disputePanel.open}
          onOpenChange={open => setDisputePanel(prev => ({ ...prev, open }))}
        />
      )}
    </section>
  );
}

/* ─────────────────────────── Milestone row ─────────────────────────── */

interface MilestoneRowProps {
  milestone: DisplayMilestone;
  vm: ProjectViewModel;
  isCreator: boolean;
  isBacker: boolean;
  isFundedOrExecuting: boolean;
  onChainId: string | null;
  onRefresh: () => Promise<void> | void;
  onOpenDispute: (milestone: Milestone, index: number) => void;
}

function MilestoneRow({
  milestone,
  vm,
  isCreator,
  isBacker,
  isFundedOrExecuting,
  onChainId,
  onRefresh,
  onOpenDispute,
}: MilestoneRowProps) {
  const isCompleted = milestone.status === 'approved';
  const isInProgress =
    milestone.status === 'in-progress' ||
    milestone.status === 'in-review' ||
    milestone.status === 'submission';
  const isMuted =
    milestone.status === 'awaiting' || milestone.status === 'draft';
  const badge = STATUS_BADGE[milestone.status];

  // ── Action gating (mirrors legacy ProjectMilestone) ──
  const reviewStatus = (milestone.raw.reviewStatus || 'pending').toLowerCase();
  const canSubmit =
    isCreator &&
    onChainId &&
    vm.campaign &&
    isFundedOrExecuting &&
    (reviewStatus === 'pending' ||
      reviewStatus === 'resubmission_required' ||
      reviewStatus === 'awaiting');

  const hasActiveDispute = !!milestone.raw.disputeStatus;
  const canDispute =
    isBacker &&
    onChainId &&
    vm.campaign &&
    isFundedOrExecuting &&
    !hasActiveDispute &&
    (reviewStatus === 'submitted' || reviewStatus === 'approved');

  return (
    <li className='relative'>
      {/* Marker */}
      <span
        className={cn(
          'absolute top-1 -left-12 flex h-8 w-8 items-center justify-center rounded-full border-2 sm:-left-14 sm:h-10 sm:w-10',
          isCompleted && 'border-primary/60 bg-primary/15',
          isInProgress && 'border-primary bg-primary',
          isMuted && 'border-stepper-border bg-background-card',
          milestone.status === 'rejected' &&
            'border-error-500/60 bg-error-500/15'
        )}
      >
        {isCompleted && <Check className='text-primary h-4 w-4' />}
        {isMuted && (
          <span className='bg-stepper-border h-1.5 w-1.5 rounded-full' />
        )}
      </span>

      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-3'>
          <h3
            className={cn(
              'text-lg font-semibold sm:text-xl',
              isMuted ? 'text-gray-500' : 'text-white'
            )}
          >
            {milestone.title}
          </h3>
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
              badge.className
            )}
          >
            {badge.label}
          </span>
          {hasActiveDispute && milestone.raw.disputeStatus && (
            <DisputeStatusBadge
              status={milestone.raw.disputeStatus}
              resolution={milestone.raw.disputeResolution}
            />
          )}
        </div>

        <p
          className={cn(
            'max-w-2xl text-sm leading-relaxed',
            isMuted ? 'text-gray-600' : 'text-gray-400'
          )}
        >
          {milestone.description}
        </p>

        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs'>
          <span
            className={cn(
              'font-semibold tracking-widest uppercase',
              isInProgress ? 'text-primary' : 'text-gray-600'
            )}
          >
            {milestone.dateLabel}
          </span>
          {milestone.amount > 0 && (
            <span className='text-gray-500'>
              {milestone.amount.toLocaleString()} ·{' '}
              <span className='text-gray-600'>{milestone.percentage}%</span>
            </span>
          )}
        </div>

        {/* Creator: submit milestone */}
        {canSubmit && vm.campaign && onChainId && milestone.raw.id && (
          <div className='pt-3'>
            <MilestoneSubmissionModal
              campaignId={vm.campaign.campaignId}
              onChainId={onChainId}
              milestoneId={milestone.raw.id}
              milestoneIndex={milestone.index}
              milestoneTitle={milestone.title}
              onSuccess={() => onRefresh()}
            >
              <Button
                variant='outline'
                size='sm'
                className='border-stepper-border bg-background-card hover:bg-inactive gap-2 text-white'
              >
                <Upload className='h-4 w-4' />
                Submit milestone
              </Button>
            </MilestoneSubmissionModal>
          </div>
        )}

        {/* Backer: dispute controls */}
        {(canDispute || hasActiveDispute) &&
          vm.campaign &&
          onChainId &&
          milestone.raw.id && (
            <div className='flex flex-wrap items-center gap-2 pt-3'>
              {hasActiveDispute && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-gray-400 hover:text-white'
                  onClick={() => onOpenDispute(milestone.raw, milestone.index)}
                >
                  View dispute
                </Button>
              )}
              {canDispute && (
                <MilestoneDisputeModal
                  campaignId={vm.campaign.campaignId}
                  onChainId={onChainId}
                  milestoneId={milestone.raw.id}
                  milestoneIndex={milestone.index}
                  milestoneTitle={milestone.title}
                  onSuccess={() => onRefresh()}
                >
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-error-500/40 bg-error-500/10 text-error-300 hover:bg-error-500/20 gap-2'
                  >
                    Dispute milestone
                  </Button>
                </MilestoneDisputeModal>
              )}
            </div>
          )}
      </div>
    </li>
  );
}

/* ───────────────────────── Empty state ────────────────────────── */

function MilestonesEmptyState() {
  return (
    <div className='border-stepper-border bg-background-card mx-auto flex max-w-xl flex-col items-center rounded-2xl border px-6 py-12 text-center sm:py-16'>
      <div className='border-primary/30 bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full border'>
        <svg
          viewBox='0 0 24 24'
          className='text-primary h-9 w-9'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='12' cy='12' r='10' />
          <circle cx='12' cy='12' r='4' />
          <path d='M12 2v4M16 6l-4 6' />
        </svg>
      </div>
      <h3 className='text-xl font-bold text-white sm:text-2xl'>
        No milestones defined
      </h3>
      <p className='mt-3 max-w-sm text-sm leading-relaxed text-gray-500'>
        This project doesn&apos;t have any milestones yet.
      </p>
    </div>
  );
}

/* ───────────────────── Follow progress card ───────────────────── */

function FollowProgressCard() {
  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className='border-stepper-border bg-background-card rounded-2xl border p-5 sm:p-6'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-4'>
          <div className='border-primary/30 bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border'>
            <Megaphone className='text-primary h-5 w-5' />
          </div>
          <div className='space-y-1'>
            <h4 className='text-base font-semibold text-white'>
              Follow progress
            </h4>
            <p className='text-sm leading-relaxed text-gray-500'>
              Get notified when a milestone is completed or delayed.
            </p>
          </div>
        </div>
        <Button
          onClick={handleScrollToTop}
          className='bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 text-sm font-semibold'
        >
          Watch Project
        </Button>
      </div>
    </div>
  );
}
