'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Calendar } from 'lucide-react';
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

interface MilestonesProps {
  onDataChange?: (data: MilestonesFormData) => void;
  initialData?: Partial<MilestonesFormData>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface MilestonesFormData {
  fundingAmount: string;
  milestones: Milestone[];
}

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
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    const startDate = new Date(val.startDate);
    const endDate = new Date(val.endDate);

    // Check if start date is in the future (at least tomorrow)
    if (startDate <= today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'Start date must be at least tomorrow',
      });
    }

    // Check if end date is after start date
    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }

    // Check if milestone has reasonable duration (at least 1 week)
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

    // Check if milestone is not too far in the future (max 2 years)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
    if (startDate > maxFutureDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'Start date cannot be more than 2 years in the future',
      });
    }
  });

const milestonesSchema = z.object({
  fundingAmount: z
    .string()
    .refine(
      v => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      'Please enter a valid funding amount'
    ),
  milestones: z
    .array(milestoneSchema)
    .min(1, 'At least one complete milestone is required')
    .superRefine((milestones, ctx) => {
      // Check that milestones are in chronological order
      for (let i = 0; i < milestones.length - 1; i++) {
        const currentEndDate = new Date(milestones[i].endDate);
        const nextStartDate = new Date(milestones[i + 1].startDate);

        // Allow some overlap (up to 1 day) but not significant overlap
        const daysBetween = Math.ceil(
          (nextStartDate.getTime() - currentEndDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysBetween < -1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [i + 1, 'startDate'],
            message: `Milestone ${i + 2} start date should be after milestone ${i + 1} end date`,
          });
        }
      }

      // Check that total project timeline is reasonable (max 3 years)
      if (milestones.length > 0) {
        const firstStartDate = new Date(milestones[0].startDate);
        const lastEndDate = new Date(milestones[milestones.length - 1].endDate);
        const totalDurationInDays = Math.ceil(
          (lastEndDate.getTime() - firstStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (totalDurationInDays > 1095) {
          // 3 years
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['milestones'],
            message: 'Total project timeline cannot exceed 3 years',
          });
        }
      }
    }),
});

// Sortable Milestone Item Component
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
              <Textarea
                placeholder='Describe what will be achieved in this milestone, the key activities involved, and the expected outcome or deliverable.'
                value={milestone.description}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'description', e.target.value)
                }
                className='focus-visible:border-primary min-h-20 resize-none border-[#2B2B2B] bg-[#101010] p-4 text-white placeholder:text-[#919191]'
              />
            </div>

            {/* Date Inputs */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                {errors[`${milestone.id}-startDate`] && (
                  <p className='text-sm text-red-500'>
                    {errors[`${milestone.id}-startDate`]}
                  </p>
                )}
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
                {errors[`${milestone.id}-endDate`] && (
                  <p className='text-sm text-red-500'>
                    {errors[`${milestone.id}-endDate`]}
                  </p>
                )}
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

const Milestones = React.forwardRef<
  { validate: () => boolean },
  MilestonesProps
>(({ onDataChange, initialData }, ref) => {
  const [formData, setFormData] = useState<MilestonesFormData>({
    fundingAmount: initialData?.fundingAmount || '0',
    milestones: initialData?.milestones || [
      {
        id: `milestone-${Date.now()}-initial`,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      },
    ],
  });

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        fundingAmount: initialData.fundingAmount || '0',
        milestones: initialData.milestones || [
          {
            id: `milestone-${Date.now()}-initial`,
            title: '',
            description: '',
            startDate: '',
            endDate: '',
          },
        ],
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState<{
    fundingAmount?: string;
    milestones?: string;
    [key: string]: string | undefined;
  }>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputChange = (
    field: keyof MilestonesFormData,
    value: string | Milestone[]
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    onDataChange?.(newData);
  };

  const validateMilestoneField = (
    milestone: Milestone,
    field: keyof Milestone,
    value: string
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (field === 'startDate' && value) {
      const startDate = new Date(value);
      if (startDate <= today) {
        return 'Start date must be at least tomorrow';
      }

      // Check if not too far in future (2 years)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
      if (startDate > maxFutureDate) {
        return 'Start date cannot be more than 2 years in the future';
      }
    }

    if (field === 'endDate' && value && milestone.startDate) {
      const startDate = new Date(milestone.startDate);
      const endDate = new Date(value);

      if (endDate <= startDate) {
        return 'End date must be after start date';
      }

      // Check minimum duration (1 week)
      const durationInDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (durationInDays < 7) {
        return 'Milestone duration must be at least 1 week';
      }
    }

    return undefined;
  };

  const handleMilestoneChange = (
    id: string,
    field: keyof Milestone,
    value: string
  ) => {
    const updatedMilestones = formData.milestones.map(milestone =>
      milestone.id === id ? { ...milestone, [field]: value } : milestone
    );

    // Validate the specific field
    const milestone = updatedMilestones.find(m => m.id === id);
    if (milestone) {
      const fieldError = validateMilestoneField(milestone, field, value);
      if (fieldError) {
        setErrors(prev => ({ ...prev, [`${id}-${field}`]: fieldError }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${id}-${field}`];
          return newErrors;
        });
      }
    }

    handleInputChange('milestones', updatedMilestones);
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    };
    handleInputChange('milestones', [...formData.milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (formData.milestones.length > 1) {
      const updatedMilestones = formData.milestones.filter(
        milestone => milestone.id !== id
      );
      handleInputChange('milestones', updatedMilestones);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = formData.milestones.findIndex(
        item => item.id === active.id
      );
      const newIndex = formData.milestones.findIndex(
        item => item.id === over?.id
      );

      const newMilestones = arrayMove(formData.milestones, oldIndex, newIndex);
      handleInputChange('milestones', newMilestones);
    }
  };

  const validateForm = (): boolean => {
    const parsed = milestonesSchema.safeParse(formData);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const newErrors: { fundingAmount?: string; milestones?: string } = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === 'fundingAmount') newErrors.fundingAmount = issue.message;
      if (key === 'milestones') newErrors.milestones = issue.message;
    }
    setErrors(newErrors);
    return false;
  };

  React.useImperativeHandle(ref, () => ({
    validate: validateForm,
  }));

  return (
    <div className='min-h-full space-y-8 text-white'>
      <div className='space-y-2'>
        <Label className='text-white'>
          How much funding does your project need?{' '}
          <span className='text-red-500'>*</span>
        </Label>
        <Input
          type='number'
          placeholder='0 USDC'
          value={formData.fundingAmount}
          onChange={e => handleInputChange('fundingAmount', e.target.value)}
          className={cn(
            'focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 text-lg text-white placeholder:text-[#FFFFFF99]',
            errors.fundingAmount && 'border-red-500'
          )}
        />
        <div className='flex items-start space-x-2'>
          <FormHint
            hint="This amount will serve as your project's total funding goal. It will be allocated across milestones during admin review."
            side='top'
          />
          <p className='text-sm text-[#B5B5B5]'>
            This amount will serve as your project's total funding goal. It will
            be allocated across milestones during admin review.
          </p>
        </div>
        {errors.fundingAmount && (
          <p className='text-sm text-red-500'>{errors.fundingAmount}</p>
        )}
      </div>

      {/* Milestones */}
      <div className='space-y-4'>
        <div className='space-y-3'>
          <Label className='text-white'>
            Define milestones for your project{' '}
            <span className='text-red-500'>*</span>
          </Label>
          <p className='text-sm text-[#B5B5B5]'>
            Add at least one milestone to outline your project's progress. Fund
            allocation for each milestone will be finalized during admin review.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={formData.milestones.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-5'>
              {formData.milestones.map((milestone, index) => (
                <SortableMilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  onMilestoneChange={handleMilestoneChange}
                  onRemoveMilestone={removeMilestone}
                  canRemove={formData.milestones.length > 1}
                  errors={errors}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Milestone Button */}
        <div className='flex justify-end'>
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

        {errors.milestones && (
          <p className='text-sm text-red-500'>{errors.milestones}</p>
        )}
      </div>
    </div>
  );
});

Milestones.displayName = 'Milestones';

export default Milestones;
