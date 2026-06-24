'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Milestone } from '@/features/projects/types';
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

interface MilestonesSectionProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

// Sortable Milestone Item Component
const SortableMilestoneItem = ({
  milestone,
  index,
  onMilestoneChange,
  onRemoveMilestone,
  canRemove,
}: {
  milestone: Milestone;
  index: number;
  onMilestoneChange: (id: string, field: keyof Milestone, value: any) => void;
  onRemoveMilestone: (id: string) => void;
  canRemove: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasContent =
    milestone.name ||
    milestone.description ||
    milestone.startDate ||
    milestone.endDate;

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
            {/* Header with Collapse Toggle */}
            {hasContent && (
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className='hover:text-primary flex items-center gap-2 text-white transition-colors'
                >
                  <span className='text-sm font-medium'>
                    {milestone.name || `Milestone ${index + 1}`}
                  </span>
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={cn(
                      'transition-transform duration-200',
                      isCollapsed ? '-rotate-90' : 'rotate-0'
                    )}
                  >
                    <path
                      d='M4 6L8 10L12 6'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Collapsible Content */}
            <div
              className={cn(
                'space-y-4 transition-all duration-200',
                isCollapsed && hasContent ? 'hidden' : 'block'
              )}
            >
              {/* Title */}
              <div className='space-y-2'>
                <Input
                  placeholder='Enter milestone name/title'
                  value={milestone.name}
                  onChange={e =>
                    onMilestoneChange(
                      milestone.id || '',
                      'name',
                      e.target.value
                    )
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
                    onMilestoneChange(
                      milestone.id || '',
                      'description',
                      e.target.value
                    )
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
                          milestone.id || '',
                          'startDate',
                          e.target.value
                        )
                      }
                      className='focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 pr-10 text-white'
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
                        onMilestoneChange(
                          milestone.id || '',
                          'endDate',
                          e.target.value
                        )
                      }
                      className='focus-visible:border-primary border-[#2B2B2B] bg-[#101010] p-4 pr-10 text-white'
                    />
                    <Calendar className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#919191]' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          {canRemove && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onRemoveMilestone(milestone.id || '')}
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

export function MilestonesSection({
  milestones,
  onChange,
}: MilestonesSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      amount: 0,
      fundingPercentage: 0,
      reviewStatus: 'pending',
      startDate: '',
      endDate: '',
      title: '',
    };
    onChange([...milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    const updated = milestones.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    );
    onChange(updated);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      const updated = milestones.filter(m => m.id !== id);
      onChange(updated);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = milestones.findIndex(item => item.id === active.id);
      const newIndex = milestones.findIndex(item => item.id === over?.id);

      const newMilestones = arrayMove(milestones, oldIndex, newIndex);
      onChange(newMilestones);
    }
  };

  return (
    <div className='space-y-8'>
      {/* Info */}
      <div className='space-y-3'>
        <p className='text-sm text-[#B5B5B5]'>
          Define milestones for your project to outline progress and
          deliverables.
        </p>
      </div>

      {/* Milestones List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={milestones.map(m => m.id || '').filter(id => id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-5'>
            {milestones.length === 0 ? (
              <div className='rounded-lg border border-dashed border-[#2B2B2B] py-12 text-center'>
                <p className='mb-4 text-[#919191]'>No milestones added yet</p>
                <Button
                  type='button'
                  onClick={addMilestone}
                  variant='outline'
                  className='border-primary hover:text-primary hover:bg-primary/5 bg-transparent font-normal text-[#99FF2D]'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Your First Milestone
                </Button>
              </div>
            ) : (
              milestones.map((milestone, index) => (
                <SortableMilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  onMilestoneChange={updateMilestone}
                  onRemoveMilestone={removeMilestone}
                  canRemove={milestones.length > 1}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Milestone Button */}
      {milestones.length > 0 && (
        <div className='flex justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={addMilestone}
            className='border-primary hover:text-primary hover:bg-primary/5 bg-transparent font-normal text-[#99FF2D]'
          >
            Add Milestone
            <Plus className='ml-2 h-4 w-4 text-[#99FF2D]' />
          </Button>
        </div>
      )}
    </div>
  );
}
