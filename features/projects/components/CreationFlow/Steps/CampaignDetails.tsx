'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Plus, X, Info, AlertCircle, GripVertical } from 'lucide-react';
import { z } from 'zod';
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
import { Milestone } from '../../../hooks/use-project-creation';

interface CampaignDetailsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

// ── Sortable Milestone Card ──────────────────────────────────

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
        'rounded-xl border border-white/10 bg-white/2 transition-all',
        isDragging && 'border-primary/20 bg-primary/5 z-50 shadow-xl'
      )}
    >
      <div className='p-3 sm:p-5'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              {...attributes}
              {...listeners}
              className='flex h-6 w-6 cursor-move items-center justify-center rounded-md bg-white/5 text-white/25 transition-colors hover:bg-white/10 hover:text-white/50 sm:h-7 sm:w-7'
            >
              <GripVertical className='h-3.5 w-3.5' />
            </div>
            <span className='text-sm font-medium text-white/50'>
              Milestone {index + 1}
            </span>
          </div>

          {canRemove && (
            <button
              type='button'
              onClick={() => onRemoveMilestone(milestone.id)}
              className='rounded-md p-1.5 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <CreationInput
            label='Title'
            placeholder='e.g. MVP Launch, Smart Contract Audit'
            value={milestone.title}
            onChange={e =>
              onMilestoneChange(milestone.id, 'title', e.target.value)
            }
            required
          />

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-[13px] font-medium text-white/50'>
                Description<span className='ml-0.5 text-red-400'>*</span>
              </label>
              <Textarea
                placeholder='What will be achieved in this milestone?'
                value={milestone.description}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'description', e.target.value)
                }
                className='focus-visible:border-primary/40 focus-visible:ring-primary/20 min-h-20 resize-none rounded-lg border border-white/10 bg-white/4 px-3.5 py-2.5 text-sm text-white transition-colors placeholder:text-white/25 hover:border-white/20 focus-visible:ring-1'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-[13px] font-medium text-white/50'>
                Deliverable<span className='ml-0.5 text-red-400'>*</span>
              </label>
              <Textarea
                placeholder='e.g. GitHub Repo, UI Mockups, Deployed Contract'
                value={milestone.deliverable}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'deliverable', e.target.value)
                }
                className='focus-visible:border-primary/40 focus-visible:ring-primary/20 min-h-20 resize-none rounded-lg border border-white/10 bg-white/4 px-3.5 py-2.5 text-sm text-white transition-colors placeholder:text-white/25 hover:border-white/20 focus-visible:ring-1'
              />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-[13px] font-medium text-white/50'>
              Success Criteria
            </label>
            <Textarea
              placeholder='How will we verify this is complete?'
              value={milestone.successCriteria}
              onChange={e =>
                onMilestoneChange(
                  milestone.id,
                  'successCriteria',
                  e.target.value
                )
              }
              rows={2}
              className='focus-visible:border-primary/40 focus-visible:ring-primary/20 resize-none rounded-lg border border-white/10 bg-white/4 px-3.5 py-2.5 text-sm text-white transition-colors placeholder:text-white/25 hover:border-white/20 focus-visible:ring-1'
            />
          </div>

          {/* Dates & percentage */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-[13px] font-medium text-white/50'>
                Start Date<span className='ml-0.5 text-red-400'>*</span>
              </label>
              <Input
                type='date'
                value={milestone.startDate}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'startDate', e.target.value)
                }
                className={cn(
                  'focus-visible:border-primary/40 focus-visible:ring-primary/20 h-10 rounded-lg bg-white/4 px-3.5 text-sm text-white transition-colors focus-visible:ring-1',
                  errors[`${milestone.id}-startDate`]
                    ? 'border-red-500/60'
                    : 'border-white/10 hover:border-white/20'
                )}
              />
              {errors[`${milestone.id}-startDate`] && (
                <p className='flex items-center gap-1 text-xs text-red-400'>
                  <AlertCircle className='h-3 w-3 shrink-0' />
                  {errors[`${milestone.id}-startDate`]}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-[13px] font-medium text-white/50'>
                End Date<span className='ml-0.5 text-red-400'>*</span>
              </label>
              <Input
                type='date'
                value={milestone.endDate}
                onChange={e =>
                  onMilestoneChange(milestone.id, 'endDate', e.target.value)
                }
                className={cn(
                  'focus-visible:border-primary/40 focus-visible:ring-primary/20 h-10 rounded-lg bg-white/4 px-3.5 text-sm text-white transition-colors focus-visible:ring-1',
                  errors[`${milestone.id}-endDate`]
                    ? 'border-red-500/60'
                    : 'border-white/10 hover:border-white/20'
                )}
              />
              {errors[`${milestone.id}-endDate`] && (
                <p className='flex items-center gap-1 text-xs text-red-400'>
                  <AlertCircle className='h-3 w-3 shrink-0' />
                  {errors[`${milestone.id}-endDate`]}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-[13px] font-medium text-white/50'>
                Fund Release %
              </label>
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
                className='focus-visible:border-primary/40 focus-visible:ring-primary/20 h-10 rounded-lg border border-white/10 bg-white/4 px-3.5 text-sm text-white transition-colors placeholder:text-white/25 hover:border-white/20 focus-visible:ring-1'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────

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
      if (startDate <= today) return 'Must be at least tomorrow';
    }

    if (field === 'endDate' && value && milestone.startDate) {
      const startDate = new Date(milestone.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) return 'Must be after start date';

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
    <div className='flex flex-col gap-8 sm:gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Crowdfunding Setup
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          Define your funding goal and project milestones.
        </p>
      </div>

      <div className='flex flex-col gap-8'>
        {/* Funding Goal */}
        <section className='flex flex-col gap-5'>
          <h3 className='text-sm font-semibold text-white sm:text-base'>
            Funding Goal
          </h3>

          <CreationInput
            label='Amount (USDC)'
            placeholder='Enter amount e.g. 25000'
            type='number'
            value={formData.fundingAmount || ''}
            onChange={e =>
              updateFormData({ fundingAmount: Number(e.target.value) })
            }
            required
          />

          <div className='flex items-start gap-2.5 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3.5'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-400/50' />
            <p className='text-xs text-blue-400/60'>
              This is the total amount you aim to raise. It will be distributed
              across milestones based on the fund release percentages you set.
            </p>
          </div>
        </section>

        {/* Milestones */}
        <section className='flex flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-white sm:text-base'>
              Project Roadmap
            </h3>
            <button
              type='button'
              onClick={addMilestone}
              className='border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'
            >
              <Plus className='h-3.5 w-3.5' />
              Add Milestone
            </button>
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
              <div className='flex flex-col gap-4'>
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
        </section>
      </div>
    </div>
  );
}
