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
import { Input } from '@/components/ui/input';

interface TimelineSettingsTabProps {
  organizationId?: string;
  hackathonId?: string;
  initialData?: Partial<TimelineFormData>;
  onSave?: (data: TimelineFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function TimelineSettingsTab({
  initialData,
  onSave,
  isLoading = false,
}: TimelineSettingsTabProps) {
  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
      registrationDeadline: initialData?.registrationDeadline || undefined,
      submissionDeadline: initialData?.submissionDeadline || undefined,
      timezone: initialData?.timezone || 'UTC',
      phases: initialData?.phases || [],
    },
  });

  const onSubmit = async (data: TimelineFormData) => {
    if (onSave) {
      await onSave(data);
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
                    Judging Date <span className='text-error-400'>*</span>
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
                            <span>Select judging date</span>
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
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='registrationDeadline'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FormLabel className='text-sm'>
                    Winner Announcement{' '}
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
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
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
                  <Input
                    {...field}
                    type='text'
                    placeholder='UTC'
                    className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
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
              disabled={isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </BoundlessButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
