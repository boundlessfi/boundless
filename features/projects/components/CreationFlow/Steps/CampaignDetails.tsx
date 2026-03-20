'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Calendar, Video, Info } from 'lucide-react';
import { z } from 'zod';
import FormHint from '@/components/form/FormHint';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreationInput } from '../CreationUI';

// Re-using types from hook
import { Milestone } from '../../../hooks/use-project-creation';

interface CampaignDetailsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

// ── Validation Schemas ────────────────────────────────────────────────────────

const milestoneSchema = z
  .object({
    id: z.string(),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .superRefine((val, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(val.startDate);
    const endDate = new Date(val.endDate);

    if (startDate <= today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'Start date must be at least tomorrow',
      });
    }

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }

    const durationInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (durationInDays < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Milestone duration must be at least 1 week',
      });
    }
  });

// ── Sortable Item Component ───────────────────────────────────────────────────

const SortableMilestoneItem = ({
  milestone,
  index,
  onMilestoneChange,
  onRemoveMilestone,
  canRemove,
  errors,
}: {
  milestone: Milestone;
  index: number;
  onMilestoneChange: (
    id: string,
    field: keyof Milestone,
    value: string
  ) => void;
  onRemoveMilestone: (id: string) => void;
  canRemove: boolean;
  errors: { [key: string]: string | undefined };
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'milestone-item relative transition-all duration-200',
        isDragging && 'milestone-dragging z-50 shadow-lg'
      )}
    >
      {index > 0 && (
        <div className='absolute top-0 left-1/2 h-px w-screen -translate-x-1/2 bg-[#2B2B2B]' />
      )}
      <div className='p-4'>
        <div className='flex items-start space-x-3'>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'milestone-drag-handle flex h-8 w-8 cursor-move items-center justify-center rounded text-[#B5B5B5] transition-colors hover:border-[#99FF2D] hover:text-white',
              isDragging && 'milestone-dragging'
            )}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M2.5 7.08325H17.5M2.5 12.9166H17.5'
                stroke='#99FF2D'
                strokeWidth='1.4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>

          {/* Milestone Content */}
          <div className='flex-1 space-y-4'>
            {/* Title */}
            <div className='space-y-2'>
              <Input
                placeholder='Enter milestone name/title'
                value={milestone.title}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'title', e.target.value)
                }
                className='focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
              />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                Description
              </Label>
              <Textarea
                placeholder='What will be achieved?'
                value={milestone.description}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'description', e.target.value)
                }
                className='focus-visible:border-primary min-h-20 resize-none border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
              />
            </div>

            {/* Deliverable & Success Criteria */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Deliverable
                </Label>
                <Textarea
                  placeholder='e.g. GitHub Repo, UI Mockups'
                  value={milestone.deliverable}
                  onChange={e =>
                    onMilestoneChange(
                      milestone.id,
                      'deliverable',
                      e.target.value
                    )
                  }
                  className='focus-visible:border-primary min-h-20 resize-none border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                  Success Criteria
                </Label>
                <Textarea
                  placeholder='How will we know it is done?'
                  value={milestone.successCriteria}
                  onChange={e =>
                    onMilestoneChange(
                      milestone.id,
                      'successCriteria',
                      e.target.value
                    )
                  }
                  className='focus-visible:border-primary min-h-20 resize-none border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
                />
              </div>
            </div>

            {/* Date & Percentage */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label className='text-sm text-[#B5B5B5]'>Start Date</Label>
                <div className='relative'>
                  <Input
                    type='date'
                    value={milestone.startDate}
                    onChange={e =>
                      onMilestoneChange(
                        milestone.id,
                        'startDate',
                        e.target.value
                      )
                    }
                    className={cn(
                      'focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 pr-10 text-white',
                      errors[`${milestone.id}-startDate`] && 'border-red-500'
                    )}
                  />
                  <Calendar className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#919191]' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm text-[#B5B5B5]'>End Date</Label>
                <div className='relative'>
                  <Input
                    type='date'
                    value={milestone.endDate}
                    onChange={e =>
                      onMilestoneChange(milestone.id, 'endDate', e.target.value)
                    }
                    className={cn(
                      'focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 pr-10 text-white',
                      errors[`${milestone.id}-endDate`] && 'border-red-500'
                    )}
                  />
                  <Calendar className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#919191]' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm text-[#B5B5B5]'>
                  Funds release %
                </Label>
                <Input
                  type='number'
                  placeholder='e.g. 25'
                  value={milestone.fundingPercentage || ''}
                  onChange={e =>
                    onMilestoneChange(
                      milestone.id,
                      'fundingPercentage',
                      e.target.value
                    )
                  }
                  className='focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
                />
              </div>
            </div>
          </div>

          {/* Remove Button */}
          {canRemove && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onRemoveMilestone(milestone.id)}
              className='text-primary/32 bg-primary/8 hover:bg-primary/8 hover:text-primary h-6 w-6 rounded-full p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function CampaignDetails({
  formData,
  updateFormData,
}: CampaignDetailsProps) {
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>(
    {}
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize first milestone if none exist
  useEffect(() => {
    if (!formData.milestones || formData.milestones.length === 0) {
      updateFormData({
        milestones: [
          {
            id: `ms-${Date.now()}`,
            title: '',
            description: '',
            startDate: '',
            endDate: '',
          },
        ],
      });
    }
  }, []);

  const validateMilestoneField = (
    milestone: Milestone,
    field: keyof Milestone,
    value: string
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (field === 'startDate' && value) {
      const startDate = new Date(value);
      if (startDate <= today) return 'Start date must be at least tomorrow';
    }

    if (field === 'endDate' && value && milestone.startDate) {
      const startDate = new Date(milestone.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) return 'End date must be after start date';

      const durationInDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (durationInDays < 7) return 'Min duration is 1 week';
    }

    return undefined;
  };

  const handleMilestoneChange = (
    id: string,
    field: keyof Milestone,
    value: string
  ) => {
    const updated = formData.milestones.map((m: Milestone) =>
      m.id === id ? { ...m, [field]: value } : m
    );

    const milestone = updated.find((m: Milestone) => m.id === id);
    if (milestone) {
      const error = validateMilestoneField(milestone, field, value);
      setErrors(prev => ({
        ...prev,
        [`${id}-${field}`]: error,
      }));
    }

    updateFormData({ milestones: updated });
  };

  const addMilestone = () => {
    const newMs: Milestone = {
      id: `ms-${Date.now()}`,
      title: '',
      description: '',
      deliverable: '',
      successCriteria: '',
      fundingPercentage: 0,
      startDate: '',
      endDate: '',
    };
    updateFormData({ milestones: [...formData.milestones, newMs] });
  };

  const removeMilestone = (id: string) => {
    if (formData.milestones.length > 1) {
      updateFormData({
        milestones: formData.milestones.filter((m: Milestone) => m.id !== id),
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = formData.milestones.findIndex(
        (m: Milestone) => m.id === active.id
      );
      const newIndex = formData.milestones.findIndex(
        (m: Milestone) => m.id === over?.id
      );
      updateFormData({
        milestones: arrayMove(formData.milestones, oldIndex, newIndex),
      });
    }
  };

  return (
    <div className='flex flex-col gap-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-3xl font-bold tracking-tight text-white'>
          Crowdfunding Setup
        </h2>
        <p className='text-sm font-medium text-white/40'>
          Define your funding goal and project milestones.
        </p>
      </div>

      <div className='flex flex-col gap-10'>
        {/* Funding Goal */}
        <div className='flex flex-col gap-6'>
          <div className='flex items-center gap-3 border-b border-white/5 pb-2'>
            <div className='bg-primary h-1.5 w-1.5 rounded-full' />
            <h3 className='text-xs font-black tracking-[0.2em] text-white/70 uppercase'>
              Goal & Allocation
            </h3>
          </div>

          <div className='flex flex-col gap-4'>
            <CreationInput
              label='Funding Goal (USDC)'
              placeholder='Enter amount e.g. 25000'
              type='number'
              value={formData.fundingAmount || ''}
              onChange={e =>
                updateFormData({ fundingAmount: Number(e.target.value) })
              }
              required
            />
            <div className='flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-[10px] font-medium text-blue-400/80'>
              <Info className='mt-0.5 h-3 w-3 shrink-0' />
              This is the total amount you aim to raise. It will be distributed
              across milestones in the next phases of your project.
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between border-b border-white/5 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary h-1.5 w-1.5 rounded-full' />
              <h3 className='text-xs font-black tracking-[0.2em] text-white/70 uppercase'>
                Project Roadmap
              </h3>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={addMilestone}
              className='border-primary hover:text-primary hover:bg-primary/5 bg-transparent font-normal text-[#99FF2D]'
            >
              Add Milestone
              <Plus className='h-4 w-4 text-[#99FF2D]' />
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={(formData.milestones || []).map((m: Milestone) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='flex flex-col gap-5'>
                {(formData.milestones || []).map(
                  (ms: Milestone, index: number) => (
                    <SortableMilestoneItem
                      key={ms.id}
                      milestone={ms}
                      index={index}
                      onMilestoneChange={handleMilestoneChange}
                      onRemoveMilestone={removeMilestone}
                      canRemove={(formData.milestones || []).length > 1}
                      errors={errors}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
