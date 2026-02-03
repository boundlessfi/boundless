'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BoundlessButton } from '@/components/buttons';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  deliveryDate: string;
  fundPercentage: string;
  isExpanded: boolean;
}

interface MilestoneFormProps {
  milestone: Milestone;
  onUpdate: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  totalMilestones: number;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  milestone,
  onUpdate,
  onDelete,
  totalMilestones,
}) => {
  const handleFieldChange = (
    field: keyof Milestone,
    value: string | boolean
  ) => {
    onUpdate({
      ...milestone,
      [field]: value,
    });
  };

  const handleSave = () => {
    if (
      !milestone.title.trim() ||
      !milestone.description.trim() ||
      !milestone.deliveryDate
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Milestone saved successfully');
  };

  const handleDelete = () => {
    if (totalMilestones <= 3) {
      toast.error('Minimum 3 milestones required');
      return;
    }
    onDelete(milestone.id);
  };

  if (!milestone.isExpanded) {
    return (
      <div className='w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-white'>
              {milestone.title || `Milestone ${milestone.id}`}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleFieldChange('isExpanded', true)}
              className='text-white hover:text-green-400'
            >
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full space-y-4 rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
      {/* Header */}
      <div className='flex items-end justify-between gap-3'>
        <div className='flex flex-1 flex-col gap-2'>
          <h3 className='text-xs font-medium tracking-[-0.06px] text-white'>
            Milestone {milestone.id} <span className='text-[#D42620]'>*</span>
          </h3>
          <Input
            className='h-12 w-full rounded-[12px] border-[#2B2B2B] bg-[#1C1C1C] text-white'
            value={milestone.title}
            onChange={e => handleFieldChange('title', e.target.value)}
            placeholder='Enter milestone title'
          />
        </div>
        <div className='!w-[102px]'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDelete}
            className='text-red-400 hover:bg-red-400/10 hover:text-red-300'
          >
            <Trash2 className='h-4 w-4 text-white' />
          </Button>
          <BoundlessButton
            variant='outline'
            disabled={!milestone.title}
            onClick={handleSave}
          >
            Save
          </BoundlessButton>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='flex items-center justify-between text-xs font-medium text-white'>
          <div>
            Description <span className='text-[#D42620]'>*</span>
          </div>
          <div className='text-xs text-gray-400'>
            {milestone.description.length}/400
          </div>
        </Label>
        <div className='relative'>
          <Textarea
            value={milestone.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            placeholder='Describe this milestone...'
            className='min-h-[120px] resize-none border-[#2B2B2B] bg-[#1C1C1C] text-white placeholder:text-gray-400'
            maxLength={400}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-xs font-medium text-white'>
          Delivery Date <span className='text-[#D42620]'>*</span>
        </Label>
        <div className='relative'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='flex h-12 w-full justify-between justify-start border-[#2B2B2B] bg-[#1C1C1C] font-normal text-white'
              >
                {milestone.deliveryDate ? (
                  new Date(
                    Number(milestone.deliveryDate.split('-')[0]),
                    Number(milestone.deliveryDate.split('-')[1]) - 1,
                    Number(milestone.deliveryDate.split('-')[2])
                  ).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                ) : (
                  <span className='text-gray-400'>Pick a date</span>
                )}
                <CalendarIcon className='mr-2 h-4 w-4 text-gray-400' />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align='start'
              className='w-auto rounded-[12px] border-[#2B2B2B] bg-[#101010] p-0 text-white'
            >
              <Calendar
                mode='single'
                selected={(() => {
                  if (!milestone.deliveryDate) return undefined;
                  const [y, m, d] = milestone.deliveryDate
                    .split('-')
                    .map(Number);
                  if (!y || !m || !d) return undefined;
                  return new Date(y, m - 1, d);
                })()}
                onSelect={date => {
                  if (!date) return;
                  const y = date.getFullYear();
                  const m = `${date.getMonth() + 1}`.padStart(2, '0');
                  const d = `${date.getDate()}`.padStart(2, '0');
                  handleFieldChange('deliveryDate', `${y}-${m}-${d}`);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-xs font-medium text-white'>
          Fund % <span className='text-[#D42620]'>*</span>
        </Label>
        <div className='relative'>
          <Input
            value={milestone.fundPercentage}
            onChange={e => handleFieldChange('fundPercentage', e.target.value)}
            placeholder='To be calculated later'
            className='h-12 border-[#2B2B2B] bg-[#1C1C1C] text-white placeholder:text-gray-400'
            disabled
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className='absolute top-1/2 right-1 -translate-y-1/2 transform'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-gray-400 hover:text-white'
                >
                  <HelpCircle className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='w-fit max-w-[400px] rounded-[16px] border-[#2B2B2B] bg-[#101010] p-5 text-white shadow-[0_1px_4px_0_rgba(72,72,72,0.14),0_0_4px_1px_#484848]'
              >
                <div>
                  <h4 className='mb-2 text-lg font-medium text-white'>
                    How are milestone funds determined?
                  </h4>
                </div>
                <p className='w-full text-base text-[#B5B5B5]'>
                  Based on your total funding goal, Boundless will automatically
                  divide funds across your milestones using a smart, weighted
                  distribution model.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default MilestoneForm;
