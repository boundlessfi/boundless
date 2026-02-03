import React, { useState } from 'react';
import type { Milestone } from './MilestoneForm';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface MilestoneReviewProps {
  milestones: Milestone[];
  totalFundAmount: number;
  onBack: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

const formatDate = (yyyyMmDd: string) => {
  if (!yyyyMmDd) return '';
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const MilestoneReview: React.FC<MilestoneReviewProps> = ({
  milestones,
  totalFundAmount,
  onBack,
  onSubmit,
  submitting,
}) => {
  const calculateFundAmount = (percentage: string) => {
    const numPercentage = parseFloat(percentage) || 0;
    return (totalFundAmount * numPercentage) / 100;
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-white'>
        Submit Your Project Details
      </h2>
      {milestones.map((m, idx) => {
        const isExpanded = expandedIds.has(m.id);
        return (
          <div key={m.id} className='space-y-2'>
            <div className='text-xs text-gray-400'>Milestone {idx + 1}</div>
            <div className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C]'>
              <div
                className='flex cursor-pointer items-center justify-between p-5 pb-3 select-none'
                onClick={() => toggle(m.id)}
              >
                <div className='text-base font-semibold text-white'>
                  {m.title || `Milestone ${idx + 1}`}
                </div>
                <button
                  type='button'
                  className='text-gray-400 hover:text-white'
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              {isExpanded && (
                <div className='space-y-3 p-5 pt-0'>
                  <div className='text-[#fff]'>{m.description}</div>
                  <div className='flex gap-6 text-sm text-gray-300'>
                    <div className='flex items-center gap-2'>
                      <CalendarIcon className='h-4 w-4' />
                      <span className='text-white'>
                        {formatDate(m.deliveryDate)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[#B5B5B5]'>
                        $
                        {calculateFundAmount(m.fundPercentage).toLocaleString()}{' '}
                        ({m.fundPercentage || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className='flex gap-3'>
        <Button
          type='button'
          variant='outline'
          className='border-[#484848] bg-[rgba(255,255,255,0.30)] text-white'
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type='button'
          className='bg-primary text-background'
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default MilestoneReview;
