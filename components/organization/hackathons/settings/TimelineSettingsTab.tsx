'use client';

import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  timelineSchema,
  TimelineFormData,
} from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import { BoundlessButton } from '@/components/buttons';
import { Switch } from '@/components/ui/switch';
import DateTimeInput from '@/components/organization/hackathons/new/tabs/components/timeline/DateTimeInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIMEZONES } from '@/components/organization/hackathons/new/tabs/components/timeline/timelineConstants';

import { api } from '@/lib/api/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface TimelineSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  initialData?: Partial<TimelineFormData>;
  onSaveSuccess?: () => Promise<void>;
}

export default function TimelineSettingsTab({
  organizationId,
  hackathonId,
  initialData,
  onSaveSuccess,
}: TimelineSettingsTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      startDate: initialData?.startDate || undefined,
      submissionDeadline: initialData?.submissionDeadline || undefined,
      registrationDeadline: initialData?.registrationDeadline || undefined,
      judgingDeadline: initialData?.judgingDeadline || undefined,
      timezone: initialData?.timezone || 'UTC',
      phases: initialData?.phases || [],
    },
  });

  const { dirtyFields, isDirty } = form.formState;

  useEffect(() => {
    if (initialData) {
      form.reset({
        startDate: initialData.startDate || undefined,
        submissionDeadline: initialData.submissionDeadline || undefined,
        registrationDeadline: initialData.registrationDeadline || undefined,
        judgingDeadline: initialData.judgingDeadline || undefined,
        timezone: initialData.timezone || 'UTC',
        phases: initialData.phases || [],
      });
    }
  }, [initialData, form]);

  const hasRegistrationDeadline = !!form.watch('registrationDeadline');
  const hasJudgingDeadline = !!form.watch('judgingDeadline');

  const onSubmit = async (data: TimelineFormData) => {
    setIsSaving(true);
    try {
      const formatDate = (date?: Date | string | null) => {
        if (!date) return undefined;
        const d = new Date(date);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const timelineChanges: Record<string, unknown> = {};

      if (dirtyFields.startDate)
        timelineChanges.startDate = formatDate(data.startDate);
      if (dirtyFields.submissionDeadline)
        timelineChanges.submissionDeadline = formatDate(
          data.submissionDeadline
        );
      if (dirtyFields.registrationDeadline)
        timelineChanges.registrationDeadline = data.registrationDeadline
          ? formatDate(data.registrationDeadline)
          : null;
      if (dirtyFields.judgingDeadline)
        timelineChanges.judgingDeadline = data.judgingDeadline
          ? formatDate(data.judgingDeadline)
          : null;
      if (dirtyFields.timezone) timelineChanges.timezone = data.timezone;
      if (dirtyFields.phases)
        timelineChanges.phases = data.phases?.map(phase => ({
          name: phase.name,
          description: phase.description,
          startDate: formatDate(phase.startDate),
          endDate: formatDate(phase.endDate),
        }));

      await api.patch(
        `/organizations/${organizationId}/hackathons/${hackathonId}/schedule`,
        { timeline: timelineChanges }
      );
      toast.success('Timeline settings saved successfully!');
      form.reset(data);
      if (onSaveSuccess) {
        await onSaveSuccess();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(
        errorMessage || 'Failed to save timeline settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>
          Timeline & Schedule
        </h2>
        <p className='mt-1 text-sm text-gray-400'>
          Configure important dates and deadlines for your hackathon.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='startDate'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FormLabel className='text-sm'>
                    Start Time <span className='text-error-400'>*</span>
                  </FormLabel>
                  <DateTimeInput
                    field={field}
                    placeholder='Select start date'
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
                  <FormLabel className='text-sm'>
                    Submission Deadline{' '}
                    <span className='text-error-400'>*</span>
                  </FormLabel>
                  <DateTimeInput
                    field={field}
                    placeholder='Select submission deadline'
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
                  <FormLabel className='text-sm'>
                    Timezone <span className='text-error-400'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'>
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

          {/* Pre-Registration End Time Section */}
          <div className='space-y-4'>
            <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
              <div>
                <p className='text-sm font-medium text-white'>
                  Pre-registration End Time
                </p>
                <p className='text-xs text-gray-400'>
                  Set a specific date when pre-registration closes (optional).
                </p>
              </div>
              <Switch
                checked={hasRegistrationDeadline}
                onCheckedChange={checked => {
                  if (checked) {
                    const fallback =
                      form.getValues('submissionDeadline') || new Date();
                    form.setValue('registrationDeadline', fallback, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue('registrationDeadline', undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </div>

            {hasRegistrationDeadline && (
              <FormField
                control={form.control}
                name='registrationDeadline'
                render={({ field }) => (
                  <FormItem className='gap-3'>
                    <FormLabel className='text-sm'>
                      Pre-registration End Time
                    </FormLabel>
                    <p className='text-xs text-gray-400'>
                      Must be on or before the submission deadline.
                    </p>
                    <DateTimeInput
                      field={field}
                      placeholder='Select pre-registration end time'
                    />
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Judging Deadline Section */}
          <div className='space-y-4'>
            <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
              <div>
                <p className='text-sm font-medium text-white'>
                  Judging Deadline
                </p>
                <p className='text-xs text-gray-400'>
                  Set a deadline for when all judging must be completed
                  (optional).
                </p>
              </div>
              <Switch
                checked={hasJudgingDeadline}
                onCheckedChange={checked => {
                  if (checked) {
                    const fallback =
                      form.getValues('submissionDeadline') || new Date();
                    form.setValue('judgingDeadline', fallback, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue('judgingDeadline', undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </div>

            {hasJudgingDeadline && (
              <FormField
                control={form.control}
                name='judgingDeadline'
                render={({ field }) => (
                  <FormItem className='gap-3'>
                    <FormLabel className='text-sm'>Judging Deadline</FormLabel>
                    <p className='text-xs text-gray-400'>
                      Must be on or after the submission deadline.
                    </p>
                    <DateTimeInput
                      field={field}
                      placeholder='Select judging deadline'
                    />
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className='flex justify-end pt-4'>
            <BoundlessButton
              type='submit'
              variant='default'
              size='lg'
              disabled={isSaving || !isDirty}
              className='min-w-[120px]'
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </BoundlessButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
