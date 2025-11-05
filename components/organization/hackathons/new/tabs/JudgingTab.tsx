import React from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray, Control, Path } from 'react-hook-form';
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

interface JudgingTabProps {
  onContinue?: () => void;
  onSave?: (data: JudgingFormData) => Promise<void>;
  initialData?: JudgingFormData;
  isLoading?: boolean;
}

const SortableCriterionItem = ({
  criterion,
  index,
  onCriterionChange,
  onRemoveCriterion,
  canRemove,
  control,
  totalCriteria,
  totalWeight,
}: {
  criterion: Criterion;
  index: number;
  onCriterionChange: (
    id: string,
    field: string,
    value: string | number
  ) => void;
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

  const hasError =
    Math.abs(totalWeight - 100) > 0.01 && index === totalCriteria - 1;

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
                      value={field.value}
                      onChange={e => {
                        field.onChange(e.target.value);
                        onCriterionChange(criterion.id, 'name', e.target.value);
                      }}
                      className='focus-visible:border-primary h-12 border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <label className='text-sm text-gray-400'>Weight</label>
              <FormField
                control={control}
                name={`criteria.${index}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex h-12 items-stretch overflow-hidden rounded-[12px] border border-gray-900 bg-[#101010]'>
                        <div className='flex-1 px-4 py-3 text-white'>
                          {field.value}%
                        </div>
                        <div className='flex gap-px'>
                          <Button
                            type='button'
                            variant='outline'
                            className='h-full rounded-none border-l border-gray-900 bg-gray-900 hover:bg-gray-800'
                            onClick={() => {
                              const newValue = Math.max(0, field.value - 1);
                              field.onChange(newValue);
                              onCriterionChange(
                                criterion.id,
                                'weight',
                                newValue
                              );
                            }}
                          >
                            <Minus className='h-4 w-4 text-white' />
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            className='h-full rounded-none border-l border-gray-900 bg-gray-900 hover:bg-gray-800'
                            onClick={() => {
                              const newValue = Math.min(100, field.value + 1);
                              field.onChange(newValue);
                              onCriterionChange(
                                criterion.id,
                                'weight',
                                newValue
                              );
                            }}
                          >
                            <Plus className='h-4 w-4 text-white' />
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    {hasError && (
                      <p className='text-error-400 mt-1 flex items-center gap-1 text-xs'>
                        <span>▲</span>
                        <span>
                          Weight must equal{' '}
                          {Math.max(
                            0,
                            Math.round(100 - (totalWeight - field.value))
                          )}
                          % to sum up 100%
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
                      value={field.value || ''}
                      onChange={e => {
                        field.onChange(e.target.value);
                        onCriterionChange(
                          criterion.id,
                          'description',
                          e.target.value
                        );
                      }}
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
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: JudgingTabProps) {
  const form = useForm<JudgingFormData>({
    resolver: zodResolver(judgingSchema),
    defaultValues: initialData || {
      criteria: [
        {
          id: `criterion-${Date.now()}-1`,
          name: 'Innovation',
          weight: 25,
          description: 'How original or creative is the idea?',
        },
        {
          id: `criterion-${Date.now()}-2`,
          name: 'Impact',
          weight: 20,
          description: '',
        },
        {
          id: `criterion-${Date.now()}-3`,
          name: 'Technical Quality',
          weight: 20,
          description: '',
        },
        {
          id: `criterion-${Date.now()}-4`,
          name: 'Usability',
          weight: 20,
          description: '',
        },
        {
          id: `criterion-${Date.now()}-5`,
          name: 'Presentation',
          weight: 15,
          description: '',
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'criteria',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const criteria = form.watch('criteria');
  const totalWeight = React.useMemo(() => {
    return criteria.reduce(
      (sum, criterion) => sum + (criterion.weight || 0),
      0
    );
  }, [criteria]);

  const handleCriterionChange = (
    id: string,
    field: string,
    value: string | number
  ) => {
    const index = fields.findIndex(criterion => criterion.id === id);
    if (index !== -1) {
      const path = `criteria.${index}.${field}` as Path<JudgingFormData>;
      form.setValue(path, value as never, { shouldValidate: true });
      form.trigger('criteria');
    }
  };

  const handleRemoveCriterion = (id: string) => {
    const index = fields.findIndex(criterion => criterion.id === id);
    if (index !== -1 && fields.length > 1) {
      remove(index);
      form.trigger('criteria');
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
    form.trigger('criteria');
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(
        criterion => criterion.id === active.id
      );
      const newIndex = fields.findIndex(criterion => criterion.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        form.trigger('criteria');
      }
    }
  };

  const onSubmit = async (data: JudgingFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Judging settings saved successfully!');
      }
      if (onContinue) {
        onContinue();
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
                  {fields.map((criterion, index) => (
                    <div key={criterion.id} className={index > 0 ? 'mt-4' : ''}>
                      <SortableCriterionItem
                        criterion={criterion}
                        index={index}
                        onCriterionChange={handleCriterionChange}
                        onRemoveCriterion={handleRemoveCriterion}
                        canRemove={fields.length > 1}
                        control={form.control}
                        totalCriteria={fields.length}
                        totalWeight={totalWeight}
                      />
                      <Separator className='mt-3 bg-gray-900' />
                    </div>
                  ))}
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
