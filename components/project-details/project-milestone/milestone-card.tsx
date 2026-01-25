import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

export type Status =
  | 'awaiting'
  | 'pending'
  | 'approved'
  | 'in-progress'
  | 'rejected'
  | 'submission'
  | 'in-review'
  | 'draft';
interface MilestoneCardProps {
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  percentage: number;
  status: Status;
  headerText?: string;
  deadline?: string;
  feedbackDays?: number;
  isUnlocked?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
  taskProgress?: {
    completed: number;
    total: number;
  };
}

//status badge colors
const statusBadgeColors = {
  awaiting: 'bg-[#E4DBDB] border-[#3E3838] text-[#3E3838]',
  pending: 'bg-[#E4DBDB] border-[#3E3838] text-[#3E3838]',
  approved: 'bg-[#B5E3C4] border-[#04802E] text-[#04802E]',
  'in-progress': 'bg-[#DBF93614] border-[#DBF936] text-[#DBF936]',
  rejected: 'bg-[#F2BCBA] border-[#BA110B] text-[#BA110B]',
  submission: 'bg-[#C6DDF7] border-[#034592] text-[#034592]',
  'in-review': 'bg-[#FBE2B7] border-[#AD6F07] text-[#AD6F07]',
  draft: 'bg-white border-[#3E3838] text-[#3E3838]',
};
const statusBadgeText = {
  awaiting: 'Awaiting',
  pending: 'Awaiting',
  approved: 'Approved',
  'in-progress': 'In Progress',
  rejected: 'Rejected',
  submission: 'Submission',
  'in-review': 'In Review',
  draft: 'Draft',
};

const MilestoneCard = ({
  title,
  description,
  dueDate,
  amount,
  percentage,
  status,
  headerText,
  deadline,
  feedbackDays,
  onClick,
  isClickable = false,
  taskProgress,
}: MilestoneCardProps) => {
  // Generate dynamic header text based on status
  const getHeaderText = () => {
    if (headerText) return headerText;

    switch (status) {
      case 'approved':
        return 'Milestone funds are unlocked!';
      case 'in-review':
        return `Feedback in ${feedbackDays || 3} days`;
      case 'rejected':
        return `Re-Submit by ${deadline || '31, Jan, 2026'}`;
      case 'submission':
        return `${deadline || '43'} days to deadline`;
      case 'draft':
      case 'pending':
      case 'awaiting':
      case 'in-progress':
      default:
        return dueDate;
    }
  };

  // header text color
  const getHeaderTextColor = () => {
    if (status === 'approved') return 'text-[#5FC381]';
    if (status === 'in-review') return 'text-[#F7C164]';
    if (status === 'rejected') return 'text-[#F7C164]';
    if (status === 'submission') return 'text-[#5FC381]';
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className='w-full'>
      <span
        className={cn(
          'mb-3 inline-block text-sm text-white',
          getHeaderTextColor()
        )}
      >
        {getHeaderText()}
      </span>
      <div
        className={cn(
          'flex flex-col items-start gap-3 rounded-[8px] border border-[#2B2B2B] bg-[#030303] p-5',
          isClickable &&
            'cursor-pointer transition-colors duration-200 hover:border-[#4B4B4B]'
        )}
        onClick={isClickable ? onClick : undefined}
      >
        <div className='flex w-full items-center justify-between'>
          <h4 className='text-base font-medium text-white'>{title}</h4>
          <Badge
            className={cn(
              statusBadgeColors[status],
              'rounded-[4px] border-2 border-solid px-2 py-1 text-xs font-medium'
            )}
          >
            {statusBadgeText[status]}
          </Badge>
        </div>
        <p className='text-sm leading-relaxed text-gray-400'>{description}</p>
        
        {/* Task Progress */}
        {taskProgress && taskProgress.total > 0 && (
          <div className='flex w-full items-center gap-2'>
            <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800'>
              <div
                className='h-full bg-green-500 transition-all duration-300'
                style={{
                  width: `${(taskProgress.completed / taskProgress.total) * 100}%`,
                }}
              />
            </div>
            <span className='text-xs text-gray-500'>
              {taskProgress.completed}/{taskProgress.total} tasks
            </span>
          </div>
        )}
        
        <div className='flex items-center justify-start gap-2 text-gray-400'>
          <span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='21'
              viewBox='0 0 20 21'
              fill='none'
            >
              <path
                d='M10.8332 4.66667C10.8332 5.58714 8.78114 6.33333 6.24984 6.33333C3.71853 6.33333 1.6665 5.58714 1.6665 4.66667M10.8332 4.66667C10.8332 3.74619 8.78114 3 6.24984 3C3.71853 3 1.6665 3.74619 1.6665 4.66667M10.8332 4.66667V5.91667M1.6665 4.66667V14.6667C1.6665 15.5871 3.71853 16.3333 6.24984 16.3333M6.24984 9.66667C6.10938 9.66667 5.9704 9.66437 5.83317 9.65987C3.49713 9.58332 1.6665 8.8694 1.6665 8M6.24984 13C3.71853 13 1.6665 12.2538 1.6665 11.3333M18.3332 10.0833C18.3332 11.0038 16.2811 11.75 13.7498 11.75C11.2185 11.75 9.1665 11.0038 9.1665 10.0833M18.3332 10.0833C18.3332 9.16286 16.2811 8.41667 13.7498 8.41667C11.2185 8.41667 9.1665 9.16286 9.1665 10.0833M18.3332 10.0833V16.3333C18.3332 17.2538 16.2811 18 13.7498 18C11.2185 18 9.1665 17.2538 9.1665 16.3333V10.0833M18.3332 13.2083C18.3332 14.1288 16.2811 14.875 13.7498 14.875C11.2185 14.875 9.1665 14.1288 9.1665 13.2083'
                stroke='#B5B5B5'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
          <div className='text-sm'>
            <span>{formatAmount(amount)}</span> - <span>{percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;
