import React, { useState, useMemo, useEffect } from 'react';
import { Timeline, TimelineItemType } from '@/components/ui/timeline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Status } from './milestone-card';
import EmptyState from '@/components/EmptyState';
import { Crowdfunding, Milestone } from '@/features/projects/types';
import Link from 'next/link';
import { getCrowdfundingMilestones } from '@/features/projects/api';

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
  crowdfund: Crowdfunding;
}

const ProjectMilestone = ({ crowdfund }: ProjectMilestoneProps) => {
  const [selectedFilter, setSelectedFilter] = useState<Status | 'all'>('all');
  const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const data = await getCrowdfundingMilestones(crowdfund.slug);
        setFetchedMilestones(data || []);
      } catch {
        // Failed to fetch milestones
      } finally {
        setLoading(false);
      }
    };

    if (crowdfund.slug) {
      fetchMilestones();
    }
  }, [crowdfund.slug]);
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
      <div className='my-6 flex items-center justify-between'>
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
        <Link href={`/projects/${crowdfund.slug}/milestones`}>
          <Button variant='ghost' className='text-white underline'>
            View All Milestones
          </Button>
        </Link>
      </div>

      <Timeline
        items={filteredMilestones}
        showConnector={true}
        variant='default'
        className='w-full'
        projectSlug={crowdfund.slug}
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
    </div>
  );
};

export default ProjectMilestone;
