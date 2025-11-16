import React, { useState } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  judgingSchema,
  JudgingFormData,
  Criterion,
} from './schemas/judgingSchema';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Minus,
  GripVertical,
  Info,
  LucideArrowUpRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion } from 'framer-motion';

interface JudgingTabProps {
  onContinue?: () => void;
  onSave?: (data: JudgingFormData) => Promise<void>;
  initialData?: JudgingFormData;
  isLoading?: boolean;
}

// Judging Criteria Templates
const JUDGING_TEMPLATES = {
  standard: {
    name: 'Standard Criteria',
    description:
      'Innovation, Impact, Technical Quality, Usability, Presentation',
    criteria: [
      {
        name: 'Innovation',
        weight: 25,
        description: 'How original or creative is the idea?',
      },
      {
        name: 'Impact',
        weight: 20,
        description: 'What problem does it solve and for whom?',
      },
      {
        name: 'Technical Quality',
        weight: 20,
        description: 'Code quality, architecture, and technical implementation',
      },
      {
        name: 'Usability',
        weight: 20,
        description: 'User experience and ease of use',
      },
      {
        name: 'Presentation',
        weight: 15,
        description: 'Clarity of pitch and demonstration',
      },
    ],
  },
  technical: {
    name: 'Technical Focus',
    description: 'Emphasizes technical excellence and implementation',
    criteria: [
      {
        name: 'Technical Implementation',
        weight: 40,
        description: 'Code quality, architecture, and technical depth',
      },
      {
        name: 'Innovation',
        weight: 25,
        description: 'Novel approaches and creative solutions',
      },
      {
        name: 'Scalability',
        weight: 20,
        description: 'Can it handle growth and scale?',
      },
      {
        name: 'Documentation',
        weight: 15,
        description: 'Code documentation and technical writing',
      },
    ],
  },
  impact: {
    name: 'Impact Focus',
    description: 'Emphasizes real-world impact and user value',
    criteria: [
      {
        name: 'Impact',
        weight: 35,
        description: 'Real-world problem solving and user value',
      },
      {
        name: 'Market Potential',
        weight: 25,
        description: 'Market size and business viability',
      },
      {
        name: 'User Experience',
        weight: 25,
        description: 'Usability and user satisfaction',
      },
      {
        name: 'Innovation',
        weight: 15,
        description: 'Creative and original approach',
      },
    ],
  },
  balanced: {
    name: 'Balanced',
    description: 'Equal weight across all criteria',
    criteria: [
      {
        name: 'Innovation',
        weight: 20,
        description: 'Originality and creativity',
      },
      {
        name: 'Impact',
        weight: 20,
        description: 'Problem solving and value creation',
      },
      {
        name: 'Technical Quality',
        weight: 20,
        description: 'Code quality and implementation',
      },
      {
        name: 'Design',
        weight: 20,
        description: 'UI/UX and visual design',
      },
      {
        name: 'Presentation',
        weight: 20,
        description: 'Pitch quality and demonstration',
      },
    ],
  },
};

const SortableCriterionItem = ({
  criterion,
  index,
  onRemoveCriterion,
  canRemove,
  control,
  totalCriteria,
  totalWeight,
}: {
  criterion: Criterion;
  index: number;
  onRemoveCriterion: (id: string) => void;
  canRemove: boolean;
  control: Control<JudgingFormData>;
  totalCriteria: number;
  totalWeight: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: criterion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasError = Math.abs(totalWeight - 100) > 0.01;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative transition-all duration-200',
        isDragging && 'z-50 mx-5 opacity-50'
      )}
    >
      <div className={cn('', hasError && 'border-red-500')}>
        <div className='flex items-start gap-4'>
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'hover:text-primary mt-1 flex h-8 w-8 cursor-move items-center justify-center rounded text-gray-400 transition-colors',
              isDragging && 'text-primary',
              totalCriteria === 1 && 'invisible'
            )}
          >
            <GripVertical className='h-5 w-5' />
          </div>

          <div className='flex-1 space-y-4'>
            <FormField
              control={control}
              name={`criteria.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder='Innovation'
                      {...field}
                      className='focus-visible:border-primary h-12 border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <label className='text-sm text-gray-400'>Weight (%)</label>
              <FormField
                control={control}
                name={`criteria.${index}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex h-12 items-stretch overflow-hidden rounded-[12px] border border-gray-900 bg-[#101010]'>
                        <Button
                          type='button'
                          variant='outline'
                          className='h-full rounded-none border-r border-gray-900 bg-gray-900 hover:bg-gray-800'
                          onClick={() => {
                            const newValue = Math.max(
                              0,
                              Number(field.value) - 1
                            );
                            field.onChange(newValue);
                          }}
                        >
                          <Minus className='h-4 w-4 text-white' />
                        </Button>
                        <Input
                          type='number'
                          min={0}
                          max={100}
                          {...field}
                          value={field.value || 0}
                          onChange={e => {
                            const value = Math.max(
                              0,
                              Math.min(100, Number(e.target.value) || 0)
                            );
                            field.onChange(value);
                          }}
                          className='h-full border-0 bg-transparent text-center text-white focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                        <div className='flex items-center px-2 text-sm text-gray-400'>
                          %
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          className='h-full rounded-none border-l border-gray-900 bg-gray-900 hover:bg-gray-800'
                          onClick={() => {
                            const newValue = Math.min(
                              100,
                              Number(field.value) + 1
                            );
                            field.onChange(newValue);
                          }}
                        >
                          <Plus className='h-4 w-4 text-white' />
                        </Button>
                      </div>
                    </FormControl>
                    {hasError && (
                      <p className='text-error-400 mt-1 flex items-center gap-1 text-xs'>
                        <span>▲</span>
                        <span>
                          Total weight is {totalWeight.toFixed(1)}%. Must equal
                          100%.{' '}
                          {index === totalCriteria - 1 &&
                            `Adjust this criterion to ${Math.max(0, Math.round((100 - (totalWeight - Number(field.value))) * 10) / 10)}% to reach 100%`}
                        </span>
                      </p>
                    )}
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`criteria.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder='Description (optional)'
                      {...field}
                      value={field.value || ''}
                      className='focus-visible:border-primary min-h-[80px] resize-none border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          </div>

          {canRemove && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onRemoveCriterion(criterion.id)}
              className='text-primary/80 hover:text-primary mt-1 h-6 w-6 rounded-full p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function JudgingTab({
  onSave,
  initialData,
  isLoading = false,
}: JudgingTabProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const form = useForm<JudgingFormData>({
    resolver: zodResolver(judgingSchema),
    mode: 'onChange',
    defaultValues: initialData || {
      criteria: [],
    },
  });

  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: 'criteria',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Watch criteria for real-time updates
  const criteria = form.watch('criteria');
  const totalWeight = React.useMemo(() => {
    if (!criteria || criteria.length === 0) return 0;
    return criteria.reduce(
      (sum, criterion) => sum + (Number(criterion.weight) || 0),
      0
    );
  }, [criteria]);

  const handleRemoveCriterion = (id: string) => {
    const index = fields.findIndex(criterion => criterion.id === id);
    if (index !== -1 && fields.length > 1) {
      remove(index);
    }
  };

  const handleAddCriterion = () => {
    const remainingWeight = Math.max(0, 100 - totalWeight);
    const newWeight = Math.min(remainingWeight, 20);

    append({
      id: `criterion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      weight: newWeight,
      description: '',
    });
  };

  const applyTemplate = (templateKey: keyof typeof JUDGING_TEMPLATES) => {
    const template = JUDGING_TEMPLATES[templateKey];
    const newCriteria = template.criteria.map((criterion, idx) => ({
      id: `criterion-${Date.now()}-${idx}`,
      name: criterion.name,
      weight: criterion.weight,
      description: criterion.description || '',
    }));

    replace(newCriteria);
    toast.success(`Applied ${template.name} template`);
    setShowTemplates(false);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(
        criterion => criterion.id === active.id
      );
      const newIndex = fields.findIndex(criterion => criterion.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const onSubmit = async (data: JudgingFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Judging settings saved successfully!');
      }
    } catch {
      toast.error('Failed to save judging settings. Please try again.');
    }
  };

  const administrators = [
    {
      id: '1',
      name: 'Brooklyn Simmons',
      email: 'debbie.baker@example.com',
      role: 'OWNER',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '2',
      name: 'Annette Black',
      email: '@verydarkman',
      role: 'ADMIN',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '3',
      name: 'Cameron Williamson',
      email: 'cameron@example.com',
      role: 'ADMIN',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '4',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'ADMIN',
      avatar: '/api/placeholder/40/40',
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div>
          <h3 className='text-sm'>
            Set Judging Criteria <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 mb-3 text-sm text-gray-500'>
            Define how submissions will be evaluated. Assign weight percentages
            to each criterion so that the total adds up to 100%.
          </p>

          {/* Template Selection */}
          {fields.length === 0 && (
            <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
              <CollapsibleTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:border-primary hover:bg-primary/5 w-full border-gray-800 transition-all'
                >
                  <Sparkles className='mr-2 h-4 w-4' />
                  {showTemplates ? 'Hide' : 'Use'} Judging Criteria Templates
                  {showTemplates ? (
                    <ChevronUp className='ml-2 h-4 w-4' />
                  ) : (
                    <ChevronDown className='ml-2 h-4 w-4' />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'
                >
                  {Object.entries(JUDGING_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      type='button'
                      onClick={() =>
                        applyTemplate(key as keyof typeof JUDGING_TEMPLATES)
                      }
                      className='hover:border-primary hover:bg-primary/5 group rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-all'
                    >
                      <p className='group-hover:text-primary font-medium text-white transition-colors'>
                        {template.name}
                      </p>
                      <p className='mt-1 text-xs text-gray-500'>
                        {template.description}
                      </p>
                    </button>
                  ))}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Weight Summary */}
          {fields.length > 0 && (
            <div className='mb-3 flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2'>
              <span className='text-sm text-gray-400'>Total Weight</span>
              <span
                className={cn(
                  'text-lg font-semibold',
                  Math.abs(totalWeight - 100) < 0.01
                    ? 'text-green-400'
                    : 'text-amber-400'
                )}
              >
                {totalWeight.toFixed(1)}%
              </span>
            </div>
          )}

          <div className='bg-background-card mt-3 rounded-[12px] border border-gray-900'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={fields.map(criterion => criterion.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-0 py-4'>
                  {fields.length === 0 ? (
                    <div className='flex flex-col items-center justify-center px-4 py-12'>
                      <p className='text-sm text-gray-500'>
                        No criteria added yet. Add your first criterion or use a
                        template above.
                      </p>
                    </div>
                  ) : (
                    fields.map((criterion, index) => (
                      <div key={criterion.id}>
                        <SortableCriterionItem
                          criterion={criterion}
                          index={index}
                          onRemoveCriterion={handleRemoveCriterion}
                          canRemove={fields.length > 1}
                          control={form.control}
                          totalCriteria={fields.length}
                          totalWeight={totalWeight}
                        />
                        {index < fields.length - 1 && (
                          <Separator className='mt-3 bg-gray-900' />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>

            <div className='border-gray-900 px-4 pb-4'>
              <BoundlessButton
                type='button'
                variant='outline'
                className='border-primary hover:bg-primary/10 text-primary w-full bg-transparent font-normal'
                onClick={handleAddCriterion}
                size='xl'
              >
                Add Criterion
                <Plus className='ml-2 h-4 w-4' />
              </BoundlessButton>
            </div>
          </div>
          {form.formState.errors.criteria && (
            <p className='text-error-400 mt-2 text-sm'>
              {form.formState.errors.criteria.message}
            </p>
          )}
        </div>

        <div>
          <h3 className='text-sm'>
            Administrators <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 mb-3 text-sm text-gray-500'>
            The admins and the owner of your organization have full permissions
            to manage this hackathon. See below.
          </p>
          <div className='bg-background-card mt-3 rounded-[12px] border border-gray-900 p-6'>
            <div className='space-y-4'>
              {administrators.map(admin => (
                <div
                  key={admin.id}
                  className='flex items-center justify-between py-3'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-medium text-white'>
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white'>
                        {admin.name}
                      </p>
                      <p className='text-xs text-gray-500'>{admin.email}</p>
                    </div>
                  </div>
                  <span className='text-xs font-medium text-gray-400'>
                    {admin.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-4 flex items-start gap-2 rounded-[12px] bg-[#DBF936]/12 p-4'>
            <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-[#DBF936]' />
            <p className='flex items-center gap-1 text-xs text-white'>
              To add, remove, or edit admin, visit your{' '}
              <Link
                href='/organization/dashboard'
                className='flex items-center gap-1 text-[#DBF936] underline'
              >
                organization dashboard{' '}
                <LucideArrowUpRight className='h-4 w-4' />
              </Link>
            </p>
          </div>
        </div>

        <BoundlessButton type='submit' size='xl' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </BoundlessButton>
      </form>
    </Form>
  );
}
