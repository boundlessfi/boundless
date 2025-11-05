import React from 'react';
import { TimelineFormData } from '../../schemas/timelineSchema';

interface TimelineSectionProps {
  data: TimelineFormData;
  onEdit?: () => void;
  formatDate: (date: Date | string | undefined) => string;
}

const formatDateShort = (date: Date | string | undefined): string => {
  if (!date) return 'Not set';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function TimelineSection({
  data,
  onEdit,
  formatDate,
}: TimelineSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-gray-500'>Start Date:</p>
          <p className='text-sm font-medium text-white'>
            {formatDateShort(data.startDate)}
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-gray-500'>
            Submission Deadline:
          </p>
          <p className='text-sm font-medium text-white'>
            {formatDateShort(data.submissionDeadline)}
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-gray-500'>Judging:</p>
          <p className='text-sm font-medium text-white'>
            {formatDateShort(data.endDate)}
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs font-medium text-gray-500'>
            Winner Announcement:
          </p>
          <p className='text-sm font-medium text-white'>
            {formatDateShort(data.registrationDeadline)}
          </p>
        </div>
      </div>
      {data.phases && data.phases.length > 0 && (
        <div className='space-y-3 border-t border-gray-800 pt-4'>
          <p className='text-xs font-medium tracking-wide text-gray-500 uppercase'>
            Phases
          </p>
          <div className='space-y-3'>
            {data.phases.map((phase, idx) => (
              <div
                key={idx}
                className='rounded-lg border border-gray-800 bg-gray-900/50 p-4'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <p className='text-sm font-medium text-white'>{phase.name}</p>
                  <span className='text-xs text-gray-500'>
                    {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                  </span>
                </div>
                {phase.description && (
                  <p className='mt-1 text-xs text-gray-400'>
                    {phase.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Timeline
        </button>
      )}
    </div>
  );
}
