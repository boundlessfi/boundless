import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useFieldArray, useForm } from 'react-hook-form';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { timelineSchema, TimelineFormData } from './schemas/timelineSchema';
import { BoundlessButton } from '@/components/buttons';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FieldLabel from './components/timeline/FieldLabel';
import DateTimeInput from './components/timeline/DateTimeInput';
import {
  TIMELINE_FIELD_TOOLTIPS,
  TIMEZONES,
} from './components/timeline/timelineConstants';

interface TimelineTabProps {
  onContinue?: () => void;
  onSave?: (data: TimelineFormData) => Promise<void>;
  initialData?: Partial<TimelineFormData>;
  isLoading?: boolean;
}

export default function TimelineTab({
  onSave,
  initialData,
  isLoading = false,
}: TimelineTabProps) {
  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      startDate: initialData?.startDate || undefined,
      submissionDeadline: initialData?.submissionDeadline || undefined,
      judgingStart: initialData?.judgingStart || undefined,
      endDate: initialData?.endDate || undefined,
      judgingEnd: initialData?.judgingEnd || undefined,
      winnersAnnouncedAt: initialData?.winnersAnnouncedAt || undefined,
      timezone: initialData?.timezone || 'UTC',
      phases: initialData?.phases || [],
    },
  });

  const phasesFieldArray = useFieldArray({
    control: form.control,
    name: 'phases',
  });

  const hasJudgingEnd = !!form.watch('judgingEnd');
  const hasWinnersAnnouncedAt = !!form.watch('winnersAnnouncedAt');

  const onSubmit = async (data: TimelineFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        // Navigation is handled automatically in saveTimelineStep
        toast.success('Timeline saved successfully!');
      }
    } catch {
      toast.error('Failed to save timeline. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-10'>
        <div className='grid gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FieldLabel
                  label='Start Date'
                  required
                  tooltip={TIMELINE_FIELD_TOOLTIPS.startDate}
                />
                <DateTimeInput
                  field={field}
                  placeholder='When participants can register.'
                />
                <FormMessage className='text-error-400 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='submissionDeadline'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FieldLabel
                  label='Submission Deadline'
                  required
                  tooltip={TIMELINE_FIELD_TOOLTIPS.submissionDeadline}
                />
                <DateTimeInput
                  field={field}
                  placeholder='Final project submission deadline.'
                />
                <FormMessage className='text-error-400 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='judgingStart'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FieldLabel
                  label='Judging Start'
                  required
                  tooltip={TIMELINE_FIELD_TOOLTIPS.judgingStart}
                />
                <DateTimeInput
                  field={field}
                  placeholder='When judging begins.'
                />
                <FormMessage className='text-error-400 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endDate'
            render={({ field }) => (
              <FormItem className='gap-3'>
                <FieldLabel
                  label='End Date'
                  required
                  tooltip={TIMELINE_FIELD_TOOLTIPS.endDate}
                />
                <DateTimeInput
                  field={field}
                  placeholder='When the hackathon ends.'
                />
                <FormMessage className='text-error-400 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='timezone'
            render={({ field }) => (
              <FormItem className='gap-3 md:col-span-2'>
                <FieldLabel
                  label='Timezone'
                  required
                  tooltip={TIMELINE_FIELD_TOOLTIPS.timezone}
                />
                <FormControl>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'>
                      <SelectValue placeholder='Select a timezone' />
                    </SelectTrigger>
                    <SelectContent className='max-h-72'>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className='text-error-400 text-xs' />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-6'>
          <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
            <div className='space-y-1'>
              <FieldLabel
                label='Judging End'
                tooltip={TIMELINE_FIELD_TOOLTIPS.judgingEnd}
                useFormLabel={false}
              />
              <p className='text-xs text-gray-400'>
                Add an end date for judging.
              </p>
            </div>
            <Switch
              checked={hasJudgingEnd}
              onCheckedChange={checked => {
                if (checked) {
                  const fallbackDate =
                    form.getValues('judgingStart') ||
                    form.getValues('submissionDeadline') ||
                    new Date();
                  form.setValue('judgingEnd', fallbackDate, {
                    shouldValidate: true,
                  });
                } else {
                  form.setValue('judgingEnd', undefined, {
                    shouldValidate: true,
                  });
                }
              }}
            />
          </div>

          {hasJudgingEnd && (
            <FormField
              control={form.control}
              name='judgingEnd'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FieldLabel label='Judging End' />
                  <DateTimeInput
                    field={field}
                    placeholder='When judging ends.'
                  />
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className='space-y-6'>
          <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
            <div className='space-y-1'>
              <FieldLabel
                label='Winner Announcement'
                tooltip={TIMELINE_FIELD_TOOLTIPS.winnersAnnouncedAt}
                useFormLabel={false}
              />
              <p className='text-xs text-gray-400'>
                Set a public results date.
              </p>
            </div>
            <Switch
              checked={hasWinnersAnnouncedAt}
              onCheckedChange={checked => {
                if (checked) {
                  const fallbackDate =
                    form.getValues('judgingEnd') ||
                    form.getValues('judgingStart') ||
                    new Date();
                  form.setValue('winnersAnnouncedAt', fallbackDate, {
                    shouldValidate: true,
                  });
                } else {
                  form.setValue('winnersAnnouncedAt', undefined, {
                    shouldValidate: true,
                  });
                }
              }}
            />
          </div>

          {hasWinnersAnnouncedAt && (
            <FormField
              control={form.control}
              name='winnersAnnouncedAt'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FieldLabel label='Winner Announcement' />
                  <DateTimeInput
                    field={field}
                    placeholder='Public results date.'
                  />
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <FieldLabel
                label='Phases'
                tooltip={TIMELINE_FIELD_TOOLTIPS.phases}
                useFormLabel={false}
              />
              <p className='text-xs text-gray-400'>
                Optional milestones for the event.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              className='border-gray-900'
              onClick={() =>
                phasesFieldArray.append({
                  name: '',
                  startDate: new Date(),
                  endDate: new Date(),
                  description: '',
                })
              }
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Phase
            </Button>
          </div>

          {phasesFieldArray.fields.length === 0 ? (
            <div className='bg-background-card rounded-[12px] border border-dashed border-gray-900 p-4 text-xs text-gray-400'>
              No phases added yet.
            </div>
          ) : (
            <div className='space-y-4'>
              {phasesFieldArray.fields.map((phase, index) => (
                <div
                  key={phase.id}
                  className='bg-background-card rounded-[16px] border border-gray-900 p-4'
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <p className='text-sm font-medium text-white'>
                      Phase {index + 1}
                    </p>
                    <button
                      type='button'
                      onClick={() => phasesFieldArray.remove(index)}
                      className='flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                      Remove
                    </button>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name={`phases.${index}.name`}
                      render={({ field }) => (
                        <FormItem className='gap-3'>
                          <FieldLabel label='Phase Name' required />
                          <FormControl>
                            <Input
                              className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                              placeholder='e.g. Kickoff'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-error-400 text-xs' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`phases.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem className='gap-3'>
                          <FieldLabel label='Phase Start' required />
                          <DateTimeInput
                            field={field}
                            placeholder='Phase start date.'
                          />
                          <FormMessage className='text-error-400 text-xs' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`phases.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem className='gap-3'>
                          <FieldLabel label='Phase End' required />
                          <DateTimeInput
                            field={field}
                            placeholder='Phase end date.'
                          />
                          <FormMessage className='text-error-400 text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`phases.${index}.description`}
                    render={({ field }) => (
                      <FormItem className='mt-4 gap-3'>
                        <FieldLabel label='Description' />
                        <FormControl>
                          <Textarea
                            className='bg-background-card rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                            placeholder='Optional notes for this phase.'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='text-error-400 text-xs' />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex justify-start pt-6'>
          <BoundlessButton type='submit' size='xl' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Continue'}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
