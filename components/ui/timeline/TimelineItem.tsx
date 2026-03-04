import React from 'react';
import { TimelineItemProps } from './types';
import MilestoneCard from '@/components/project-details/project-milestone/milestone-card';
import { Status } from '@/components/project-details/project-milestone/milestone-card';

const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  isLast,
  showConnector,
  projectSlug,
}) => {
  // Map timeline status to milestone card status

  // Determine if milestone should be clickable (only for submitted milestones)
  const isClickable =
    item.status === 'submission' ||
    item.status === 'in-review' ||
    item.status === 'approved' ||
    item.status === 'awaiting' ||
    item.status === 'rejected';

  // Get status-based colors
  const getStatusColor = () => {
    switch (item.status) {
      case 'approved':
        return '#99FF2D'; // Primary green - approved
      case 'submission':
      case 'in-review':
        return '#FFA500'; // Orange - in review
      case 'rejected':
        return '#EF4444'; // Red - rejected
      case 'awaiting':
        return '#3B82F6'; // Blue - awaiting
      case 'pending':
      default:
        return '#B5B5B5'; // Gray - pending/default
    }
  };

  // Handle milestone click - open in new tab
  const handleMilestoneClick = () => {
    // eslint-disable-next-line no-console
    if (isClickable && projectSlug) {
      const milestoneUrl = `/projects/${projectSlug}/milestone/${item.id}`;
      window.open(milestoneUrl, '_blank');
    }
  };

  return (
    <li className={`relative flex items-start gap-6 pb-5`}>
      <div
        className={`${showConnector && !isLast ? 'before:absolute before:top-[0.4px] before:left-3 before:h-full before:border-l before:border-dashed before:border-[#FFFFFF4D]' : ''}`}
      >
        {item.icon ? (
          <div className='relative z-10'>{item.icon}</div>
        ) : (
          <svg
            width='24'
            height='23'
            viewBox='0 0 24 23'
            className='relative z-10'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M0.869629 11.1304C0.869629 4.98327 5.8529 0 12.0001 0C18.1472 0 23.1305 4.98327 23.1305 11.1304C23.1305 17.2776 18.1472 22.2609 12.0001 22.2609C5.8529 22.2609 0.869629 17.2776 0.869629 11.1304Z'
              fill='#2B2B2B'
            />
            <circle
              cx='12.0003'
              cy='11.1297'
              r='5.56522'
              fill={getStatusColor()}
            />
          </svg>
        )}
      </div>

      <div className='flex-1'>
        <MilestoneCard
          title={item.title}
          description={item.description}
          dueDate={item.dueDate || item.date || ''}
          amount={item.amount || 0}
          percentage={item.percentage || 0}
          status={item.status as Status}
          headerText={item.headerText}
          deadline={item.deadline}
          feedbackDays={item.feedbackDays}
          isUnlocked={item.isUnlocked}
          onClick={handleMilestoneClick}
          isClickable={isClickable}
        />
      </div>
    </li>
  );
};

export default TimelineItem;
