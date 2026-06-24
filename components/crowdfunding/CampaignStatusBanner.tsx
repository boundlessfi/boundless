'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  Zap,
  XCircle,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useWithdrawSubmission,
  usePublishCampaign,
} from '@/features/crowdfunding';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CrowdfundingV2Status } from '@/features/crowdfunding';
import type { Crowdfunding } from '@/features/projects/types';

interface StatusConfig {
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STATUS_CONFIG: Record<CrowdfundingV2Status, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-zinc-400',
    borderColor: 'border-zinc-700',
    bgColor: 'bg-zinc-900/50',
    icon: Clock,
    description:
      'Your campaign is saved as a draft. Complete all sections and submit for review when ready.',
  },
  SUBMITTED_FOR_REVIEW: {
    label: 'Under Review',
    color: 'text-blue-400',
    borderColor: 'border-blue-800/50',
    bgColor: 'bg-blue-950/30',
    icon: Clock,
    description:
      'Your campaign is being reviewed by the Boundless team. We will notify you by email with the outcome.',
  },
  REVIEW_REJECTED: {
    label: 'Changes Requested',
    color: 'text-amber-400',
    borderColor: 'border-amber-800/50',
    bgColor: 'bg-amber-950/30',
    icon: AlertCircle,
    description:
      'The review team has requested some changes before your campaign can go live. See feedback below.',
  },
  REVIEW_APPROVED: {
    label: 'Ready to Launch',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-800/50',
    bgColor: 'bg-emerald-950/30',
    icon: Zap,
    description:
      'Your campaign has been approved. Launch it to start accepting support from the community.',
  },
  VOTING: {
    label: 'Community Voting',
    color: 'text-purple-400',
    borderColor: 'border-purple-800/50',
    bgColor: 'bg-purple-950/30',
    icon: Users,
    description:
      'Community members are voting to validate your campaign. You will be notified when the vote concludes.',
  },
  VOTE_FAILED: {
    label: 'Voting Failed',
    color: 'text-red-400',
    borderColor: 'border-red-800/50',
    bgColor: 'bg-red-950/30',
    icon: XCircle,
    description:
      'Your campaign did not reach the required community votes. Contact support to discuss next steps.',
  },
  VOTE_PASSED: {
    label: 'Ready to Launch',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-800/50',
    bgColor: 'bg-emerald-950/30',
    icon: Zap,
    description:
      'Your campaign passed the community vote. Launch it to start accepting support from the community.',
  },
  PUBLISHING: {
    label: 'Launching...',
    color: 'text-blue-400',
    borderColor: 'border-blue-800/50',
    bgColor: 'bg-blue-950/30',
    icon: Loader2,
    description: 'Your campaign is being set up. This may take a few moments.',
  },
  FUNDING: {
    label: 'Live',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-800/50',
    bgColor: 'bg-emerald-950/30',
    icon: CheckCircle2,
    description:
      'Your campaign is live and accepting support from the community.',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-zinc-400',
    borderColor: 'border-zinc-700',
    bgColor: 'bg-zinc-900/50',
    icon: CheckCircle2,
    description:
      'This campaign has been successfully completed. All milestones were delivered.',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-400',
    borderColor: 'border-red-800/50',
    bgColor: 'bg-red-950/30',
    icon: XCircle,
    description:
      'This campaign was cancelled. All contributions have been refunded.',
  },
  PAUSED: {
    label: 'Paused',
    color: 'text-amber-400',
    borderColor: 'border-amber-800/50',
    bgColor: 'bg-amber-950/30',
    icon: Pause,
    description:
      'This campaign has been temporarily paused. Contact support for details.',
  },
  FAILED: {
    label: 'Failed',
    color: 'text-red-400',
    borderColor: 'border-red-800/50',
    bgColor: 'bg-red-950/30',
    icon: XCircle,
    description:
      'This campaign encountered an issue. Contact support for assistance.',
  },
};

interface Props {
  campaign: Crowdfunding;
  onStatusChange?: () => void;
}

export function CampaignStatusBanner({ campaign, onStatusChange }: Props) {
  const router = useRouter();
  const withdraw = useWithdrawSubmission();
  const publish = usePublishCampaign();
  const [launchOpen, setLaunchOpen] = useState(false);

  const status = (campaign.v2Status ?? 'DRAFT') as CrowdfundingV2Status;
  const raised = campaign.fundingRaised ?? 0;
  const goal = campaign.fundingGoal ?? 0;
  const fullyFunded = status === 'FUNDING' && goal > 0 && raised >= goal;
  const milestones = campaign.milestones ?? [];
  const completedMilestones = milestones.filter(m =>
    Boolean(m.claimedAt)
  ).length;

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = config.icon;

  const isActing = withdraw.isPending || publish.isPending;

  const handleLaunch = () => {
    publish.mutate(campaign, {
      onSuccess: () => {
        toast.success('Launching your campaign. This takes a moment.');
        setLaunchOpen(false);
        onStatusChange?.();
      },
      onError: err =>
        toast.error(
          err instanceof Error
            ? err.message
            : 'Failed to launch. Please try again.'
        ),
    });
  };

  const renderReviewFeedback = () => {
    if (status !== 'REVIEW_REJECTED' || !campaign.reviews?.length) return null;
    const latest = [...campaign.reviews]
      .reverse()
      .find(r => r.action === 'REJECTED' || r.action === 'REQUEST_REVISION');
    if (!latest) return null;
    return (
      <div className='mt-3 rounded-lg border border-amber-800/40 bg-amber-950/20 p-3 text-sm'>
        <p className='font-medium text-amber-300'>Reviewer feedback</p>
        {latest.reason && (
          <p className='mt-1 text-amber-200/70'>{latest.reason}</p>
        )}
        {latest.details && (
          <p className='mt-1 text-amber-200/50'>{latest.details}</p>
        )}
      </div>
    );
  };

  const renderFundingProgress = () => {
    if (status !== 'FUNDING') return null;
    const total = milestones.length;
    if (total === 0) return null;
    const milestonePct = Math.round((completedMilestones / total) * 100);
    return (
      <div className='mt-3 space-y-1.5'>
        <div className='flex items-center justify-between text-xs text-zinc-400'>
          <span>Milestones completed</span>
          <span>
            {completedMilestones} / {total}
          </span>
        </div>
        <Progress value={milestonePct} className='h-2' />
      </div>
    );
  };

  const renderVotingProgress = () => {
    if (status !== 'VOTING') return null;
    const up = campaign.voteUpCount ?? 0;
    const goal = campaign.voteGoal ?? 1;
    const pct = Math.min(100, Math.round((up / goal) * 100));
    return (
      <div className='mt-3 space-y-1.5'>
        <div className='flex items-center justify-between text-xs text-zinc-400'>
          <span>{up} votes</span>
          <span>{goal} needed</span>
        </div>
        <Progress value={pct} className='h-2' />
        <p className='text-xs text-zinc-500'>
          {pct}% of the votes needed to go live
        </p>
      </div>
    );
  };

  const renderActions = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              router.push(`/crowdfunding/new?campaignId=${campaign.id}`)
            }
            className='border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            Continue editing
          </Button>
        );

      case 'SUBMITTED_FOR_REVIEW':
        return (
          <Button
            size='sm'
            variant='ghost'
            disabled={isActing}
            onClick={() =>
              withdraw.mutate(campaign.id, {
                onSuccess: () => {
                  toast.success('Submission withdrawn.');
                  onStatusChange?.();
                },
                onError: () =>
                  toast.error('Something went wrong. Please try again.'),
              })
            }
            className='text-zinc-400 hover:text-white'
          >
            {isActing ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Withdraw submission
          </Button>
        );

      case 'REVIEW_REJECTED':
        return (
          <div className='flex gap-2'>
            <Button
              size='sm'
              onClick={() =>
                router.push(`/crowdfunding/new?campaignId=${campaign.id}`)
              }
              className='bg-primary hover:bg-primary/90'
            >
              Edit &amp; resubmit
            </Button>
          </div>
        );

      case 'REVIEW_APPROVED':
      case 'VOTE_PASSED':
        return (
          <Button
            size='sm'
            disabled={isActing}
            onClick={() => setLaunchOpen(true)}
            className='bg-primary hover:bg-primary/90 gap-2'
          >
            {publish.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Zap className='h-4 w-4' />
            )}
            Launch campaign
          </Button>
        );

      case 'VOTE_FAILED':
      case 'PAUSED':
      case 'FAILED':
        return (
          <Button
            size='sm'
            variant='ghost'
            onClick={() =>
              (window.location.href = 'mailto:support@boundlessfi.xyz')
            }
            className='text-zinc-400 hover:text-white'
          >
            Contact support
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={cn(
          'rounded-xl border p-4',
          config.borderColor,
          config.bgColor
        )}
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <Icon
              className={cn(
                'mt-0.5 h-5 w-5 flex-shrink-0',
                config.color,
                status === 'PUBLISHING' && 'animate-spin'
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  fullyFunded ? 'text-primary' : config.color
                )}
              >
                {fullyFunded ? 'Fully Funded' : config.label}
              </p>
              <p className='mt-0.5 text-sm text-zinc-400'>
                {fullyFunded
                  ? 'Your campaign has reached its funding goal. Milestones are now being delivered.'
                  : config.description}
              </p>
              {renderReviewFeedback()}
              {renderVotingProgress()}
              {renderFundingProgress()}
            </div>
          </div>
          <div className='flex-shrink-0'>{renderActions()}</div>
        </div>
      </div>

      <AlertDialog open={launchOpen} onOpenChange={setLaunchOpen}>
        <AlertDialogContent className='border-zinc-800 bg-zinc-950 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Launch your campaign?</AlertDialogTitle>
            <AlertDialogDescription className='text-zinc-400'>
              This opens your campaign for support and starts a 30-day funding
              window. Supporters&apos; money is held safely and released to you
              as you complete each milestone. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={publish.isPending}
              className='border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
            >
              Not yet
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={publish.isPending}
              onClick={e => {
                e.preventDefault();
                handleLaunch();
              }}
              className='bg-primary hover:bg-primary/90'
            >
              {publish.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Launch campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
