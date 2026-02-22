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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
      judgingStart: initialData?.judgingStart || undefined,
      endDate: initialData?.endDate || undefined,
      judgingEnd: initialData?.judgingEnd || undefined,
      winnersAnnouncedAt: initialData?.winnersAnnouncedAt || undefined,
      timezone: initialData?.timezone || 'UTC',
      phases: initialData?.phases || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        startDate: initialData.startDate || undefined,
        submissionDeadline: initialData.submissionDeadline || undefined,
        judgingStart: initialData.judgingStart || undefined,
        endDate: initialData.endDate || undefined,
        judgingEnd: initialData.judgingEnd || undefined,
        winnersAnnouncedAt: initialData.winnersAnnouncedAt || undefined,
        timezone: initialData.timezone || 'UTC',
        phases: initialData.phases || [],
      });
    }
  }, [initialData, form]);

  const hasJudgingEnd = !!form.watch('judgingEnd');
  const hasWinnersAnnouncedAt = !!form.watch('winnersAnnouncedAt');

  const formatTimeValue = (date?: Date) => {
    if (!date) return '';
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const applyTimeToDate = (date: Date, timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const next = new Date(date);
    next.setHours(hours || 0, minutes || 0, 0, 0);
    return next;
  };

  const onSubmit = async (data: TimelineFormData) => {
    setIsSaving(true);
    try {
      const formatDate = (date?: Date | string | null) => {
        if (!date) return undefined;
        const d = new Date(date);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const payload = {
        timeline: {
          startDate: formatDate(data.startDate),
          submissionDeadline: formatDate(data.submissionDeadline),
          judgingStart: formatDate(data.judgingStart),
          endDate: formatDate(data.endDate),
          judgingEnd: formatDate(data.judgingEnd),
          winnersAnnouncedAt: formatDate(data.winnersAnnouncedAt),
          timezone: data.timezone,
          phases: data.phases?.map(phase => ({
            name: phase.name,
            description: phase.description,
            startDate: formatDate(phase.startDate),
            endDate: formatDate(phase.endDate),
          })),
        },
      };

      await api.patch(
        `/organizations/${organizationId}/hackathons/${hackathonId}/schedule`,
        payload
      );
      toast.success('Timeline settings saved successfully!');
      // Reset form with current data to clear dirty state
      form.reset(data);
      if (onSaveSuccess) {
        await onSaveSuccess();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
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
                    Start Date <span className='text-error-400'>*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                            !field.value && 'text-gray-600'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Select start date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='bg-background-card w-auto border-gray-900 p-0 text-white'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormControl>
                    <Input
                      type='time'
                      className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                      value={formatTimeValue(field.value)}
                      onChange={event => {
                        if (!field.value) return;
                        field.onChange(
                          applyTimeToDate(field.value, event.target.value)
                        );
                      }}
                      disabled={!field.value}
                    />
                  </FormControl>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                            !field.value && 'text-gray-600'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Select submission deadline</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='bg-background-card w-auto border-gray-900 p-0 text-white'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormControl>
                    <Input
                      type='time'
                      className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                      value={formatTimeValue(field.value)}
                      onChange={event => {
                        if (!field.value) return;
                        field.onChange(
                          applyTimeToDate(field.value, event.target.value)
                        );
                      }}
                      disabled={!field.value}
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='judgingStart'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FormLabel className='text-sm'>
                    Judging Start <span className='text-error-400'>*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                            !field.value && 'text-gray-600'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Select judging start</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='bg-background-card w-auto border-gray-900 p-0 text-white'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormControl>
                    <Input
                      type='time'
                      className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                      value={formatTimeValue(field.value)}
                      onChange={event => {
                        if (!field.value) return;
                        field.onChange(
                          applyTimeToDate(field.value, event.target.value)
                        );
                      }}
                      disabled={!field.value}
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='endDate'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FormLabel className='text-sm'>
                    End Date <span className='text-error-400'>*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                            !field.value && 'text-gray-600'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Select end date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='bg-background-card w-auto border-gray-900 p-0 text-white'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormControl>
                    <Input
                      type='time'
                      className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                      value={formatTimeValue(field.value)}
                      onChange={event => {
                        if (!field.value) return;
                        field.onChange(
                          applyTimeToDate(field.value, event.target.value)
                        );
                      }}
                      disabled={!field.value}
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          </div>

          <div className='space-y-4'>
            <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
              <div>
                <p className='text-sm font-medium text-white'>Judging End</p>
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
                    <FormLabel className='text-sm'>Judging End</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                              !field.value && 'text-gray-600'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select judging end</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className='bg-background-card w-auto border-gray-900 p-0 text-white'
                        align='start'
                      >
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormControl>
                      <Input
                        type='time'
                        className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                        value={formatTimeValue(field.value)}
                        onChange={event => {
                          if (!field.value) return;
                          field.onChange(
                            applyTimeToDate(field.value, event.target.value)
                          );
                        }}
                        disabled={!field.value}
                      />
                    </FormControl>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className='space-y-4'>
            <div className='bg-background-card flex items-center justify-between rounded-[12px] border border-gray-900 p-4'>
              <div>
                <p className='text-sm font-medium text-white'>
                  Winner Announcement
                </p>
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
                    <FormLabel className='text-sm'>
                      Winner Announcement
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 text-left font-normal',
                              !field.value && 'text-gray-600'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select announcement date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className='bg-background-card w-auto border-gray-900 p-0 text-white'
                        align='start'
                      >
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormControl>
                      <Input
                        type='time'
                        className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 px-4 text-sm text-white'
                        value={formatTimeValue(field.value)}
                        onChange={event => {
                          if (!field.value) return;
                          field.onChange(
                            applyTimeToDate(field.value, event.target.value)
                          );
                        }}
                        disabled={!field.value}
                      />
                    </FormControl>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name='timezone'
            render={({ field }) => (
              <FormItem className='gap-3'>
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

          <div className='flex justify-end pt-4'>
            <BoundlessButton
              type='submit'
              variant='default'
              size='lg'
              disabled={isSaving}
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
