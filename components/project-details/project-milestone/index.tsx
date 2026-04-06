import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Timeline, TimelineItemType } from '@/components/ui/timeline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ListFilter, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Status } from './milestone-card';
import EmptyState from '@/components/EmptyState';
import { Milestone } from '@/features/projects/types';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import Link from 'next/link';
import { getCrowdfundingMilestones } from '@/features/projects/api';
import {
  CampaignStatus,
  normalizeCampaignStatus,
} from '@/features/projects/types';
import { useOptionalAuth } from '@/hooks/use-auth';
import { MilestoneSubmissionModal } from './MilestoneSubmissionModal';
import { MilestoneDisputeModal } from './MilestoneDisputeModal';
import { DisputeStatusBadge } from './DisputeStatusBadge';
import { DisputeDetailPanel } from './DisputeDetailPanel';

const filterOptions = [
  { value: 'all', label: 'All Milestones', count: 0 },
  { value: 'awaiting', label: 'Awaiting', count: 0 },
  { value: 'in-progress', label: 'In Progress', count: 0 },
  { value: 'in-review', label: 'In Review', count: 0 },
  { value: 'submission', label: 'Submission', count: 0 },
  { value: 'approved', label: 'Approved', count: 0 },
  { value: 'rejected', label: 'Rejected', count: 0 },
  { value: 'draft', label: 'Draft', count: 0 },
];

interface ProjectMilestoneProps {
  vm: ProjectViewModel;
}

const ProjectMilestone = ({ vm }: ProjectMilestoneProps) => {
  const [selectedFilter, setSelectedFilter] = useState<Status | 'all'>('all');
  const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputePanelState, setDisputePanelState] = useState<{
    open: boolean;
    milestone: Milestone | null;
    index: number;
  }>({ open: false, milestone: null, index: 0 });
  const { user } = useOptionalAuth();

  const campaignSlug = vm.campaign?.campaignSlug;
  const onChainId = vm.campaign?.onChainId;
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
  const inlineMilestones =
    vm.campaign?.milestones ?? vm.submission?.milestones ?? [];

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const data = await getCrowdfundingMilestones(campaignSlug!);
        setFetchedMilestones(data || []);
      } catch {
        setFetchedMilestones(inlineMilestones);
      } finally {
        setLoading(false);
      }
    };

    if (campaignSlug) {
      fetchMilestones();
    } else {
      setFetchedMilestones(inlineMilestones);
      setLoading(false);
    }
  }, [campaignSlug, inlineMilestones]);

  const refreshMilestones = useCallback(async () => {
    if (campaignSlug) {
      try {
        const data = await getCrowdfundingMilestones(campaignSlug);
        setFetchedMilestones(data || []);
      } catch {
        // Keep current milestones on error
      }
    }
  }, [campaignSlug]);

  const milestones: TimelineItemType[] = useMemo(() => {
    if (!fetchedMilestones || fetchedMilestones.length === 0) {
      return [];
    }

    return fetchedMilestones.map((milestone, index) => {
      let dueDate = 'TBD';
      try {
        if (milestone.endDate) {
          dueDate = new Date(milestone.endDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch {
        // Invalid date format, use TBD
      }

      const mapStatus = (status?: string): Status => {
        const normalizedStatus = (status || 'pending').toLowerCase();

        switch (normalizedStatus) {
          case 'completed':
          case 'approved':
            return 'approved';
          case 'in-progress':
          case 'active':
            return 'in-progress';
          case 'pending':
          case 'awaiting':
            return 'awaiting';
          case 'rejected':
          case 'failed':
            return 'rejected';
          case 'submission':
          case 'submitted':
            return 'submission';
          case 'review':
          case 'in-review':
            return 'in-review';
          case 'draft':
            return 'draft';
          default:
            return 'awaiting';
        }
      };

      const mappedStatus = mapStatus(milestone.reviewStatus);

      return {
        id: milestone.id || `milestone-${index}`,
        title: milestone.title,
        description: milestone.description,
        dueDate,
        amount: milestone.amount,
        percentage: milestone.fundingPercentage,
        status: mappedStatus,
        ...(milestone.reviewStatus === 'in-review' && { feedbackDays: 3 }),
        ...(milestone.reviewStatus === 'rejected' && { deadline: dueDate }),
        ...(milestone.reviewStatus === 'approved' && { isUnlocked: true }),
      };
    });
  }, [fetchedMilestones]);

  const filterOptionsWithCounts = useMemo(() => {
    return filterOptions.map(option => {
      if (option.value === 'all') {
        return { ...option, count: milestones.length };
      }
      const count = milestones.filter(
        milestone => milestone.status === option.value
      ).length;
      return { ...option, count };
    });
  }, [milestones]);

  const filteredMilestones = useMemo(() => {
    if (selectedFilter === 'all') {
      return milestones;
    }
    return milestones.filter(milestone => milestone.status === selectedFilter);
  }, [milestones, selectedFilter]);

  const currentFilterLabel =
    filterOptionsWithCounts.find(option => option.value === selectedFilter)
      ?.label || 'All Milestones';

  if (loading) {
    return (
      <div className='flex w-full items-center justify-center py-12'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='my-4 flex flex-col gap-3 sm:my-6 sm:flex-row sm:items-center sm:justify-between'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='bg-background flex w-full items-center gap-2 border-[#ffffff]/24 px-3 text-white md:w-fit'
            >
              <ListFilter className='size-4' />
              {currentFilterLabel}
              {selectedFilter !== 'all' && (
                <span className='rounded-full bg-[#22c55e] px-2 py-1 text-xs text-black'>
                  :{selectedFilter}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-56 border-zinc-800 bg-black'
            align='start'
          >
            <DropdownMenuRadioGroup
              value={selectedFilter}
              onValueChange={value =>
                setSelectedFilter(value as Status | 'all')
              }
            >
              {filterOptionsWithCounts.map(option => (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  className='flex items-center justify-between text-white data-[state=checked]:text-[#22c55e]'
                >
                  <span>{option.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {campaignSlug && (
          <Link href={`/projects/${campaignSlug}/milestones`}>
            <Button variant='ghost' className='text-white underline'>
              View All Milestones
            </Button>
          </Link>
        )}
      </div>

      {/* Creator: Submit milestone buttons — only when campaign is funded */}
      {isCreator && onChainId && vm.campaign && isFundedOrExecuting && (
        <div className='mb-4 space-y-2'>
          {fetchedMilestones.map((milestone, index) => {
            const status = (milestone.reviewStatus || 'pending').toLowerCase();
            const canSubmit =
              status === 'pending' ||
              status === 'resubmission_required' ||
              status === 'awaiting';
            if (!canSubmit) return null;
            return (
              <MilestoneSubmissionModal
                key={milestone.id || index}
                campaignId={vm.campaign!.campaignId}
                onChainId={onChainId}
                milestoneId={milestone.id!}
                milestoneIndex={index}
                milestoneTitle={milestone.title}
                onSuccess={refreshMilestones}
              >
                <Button
                  variant='outline'
                  size='sm'
                  className='mr-2 gap-2 border-[#ffffff]/24 text-white'
                >
                  <Upload className='h-4 w-4' />
                  Submit: {milestone.title}
                </Button>
              </MilestoneSubmissionModal>
            );
          })}
        </div>
      )}

      {/* Backer: Dispute controls — only when campaign is funded */}
      {isBacker && onChainId && vm.campaign && isFundedOrExecuting && (
        <div className='mb-4 space-y-2'>
          {fetchedMilestones.map((milestone, index) => {
            const status = (milestone.reviewStatus || 'pending').toLowerCase();
            const hasActiveDispute = !!milestone.disputeStatus;
            const canDispute =
              !hasActiveDispute &&
              (status === 'submitted' || status === 'approved');

            if (!hasActiveDispute && !canDispute) return null;

            return (
              <div
                key={milestone.id || index}
                className='flex flex-wrap items-center gap-2'
              >
                {/* Dispute status badge + view details */}
                {hasActiveDispute && milestone.disputeStatus && (
                  <>
                    <DisputeStatusBadge
                      status={milestone.disputeStatus}
                      resolution={milestone.disputeResolution}
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs text-white/60 hover:text-white'
                      onClick={() =>
                        setDisputePanelState({
                          open: true,
                          milestone,
                          index,
                        })
                      }
                    >
                      View dispute — {milestone.title}
                    </Button>
                  </>
                )}

                {/* File new dispute (only when no active dispute) */}
                {canDispute && (
                  <MilestoneDisputeModal
                    campaignId={vm.campaign!.campaignId}
                    onChainId={onChainId}
                    milestoneId={milestone.id!}
                    milestoneIndex={index}
                    milestoneTitle={milestone.title}
                    onSuccess={refreshMilestones}
                  >
                    <Button
                      variant='outline'
                      size='sm'
                      className='gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10'
                    >
                      Dispute: {milestone.title}
                    </Button>
                  </MilestoneDisputeModal>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Timeline
        items={filteredMilestones}
        showConnector={true}
        variant='default'
        className='w-full'
        projectSlug={campaignSlug ?? ''}
      />

      {filteredMilestones.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='text-center'>
            {milestones.length === 0 ? (
              <EmptyState
                title='No milestones defined'
                description="This project doesn't have any milestones yet."
                action={false}
              />
            ) : (
              <EmptyState
                title='No milestones found'
                description='No milestones match the selected filter.'
                action={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Dispute detail slide-over */}
      {disputePanelState.milestone && (
        <DisputeDetailPanel
          milestone={disputePanelState.milestone}
          milestoneIndex={disputePanelState.index}
          open={disputePanelState.open}
          onOpenChange={open =>
            setDisputePanelState(prev => ({ ...prev, open }))
          }
        />
      )}
    </div>
  );
};

export default ProjectMilestone;
