import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { timelineSchema, TimelineFormData } from './schemas/timelineSchema';
import { BoundlessButton } from '@/components/buttons';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TimelineTabProps {
  onContinue?: () => void;
  onSave?: (data: TimelineFormData) => Promise<void>;
  initialData?: Partial<TimelineFormData>;
  isLoading?: boolean;
}

export default function TimelineTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: TimelineTabProps) {
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
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Timeline saved successfully!');
      }
      if (onContinue) {
        onContinue();
      }
    } catch {
      toast.error('Failed to save timeline. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
                        <span>When participants can register.</span>
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
                    disabled={date => date < new Date()}
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
                Submission Deadline <span className='text-error-400'>*</span>
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
                        <span>Final project submission deadline.</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className='bg-background-card w-auto border-gray-900 p-0 !text-white'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
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
                Judging <span className='text-error-400'>*</span>
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
                        <span>When evaluation begins.</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className='bg-background-card w-auto border-gray-900 p-0 !text-white'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
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
                Winner Announcement <span className='text-error-400'>*</span>
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
                        <span>Public results date.</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 text-gray-400' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className='bg-background-card w-auto border-gray-900 p-0 !text-white'
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className='text-error-400 text-xs' />
            </FormItem>
          )}
        />

        <div className='flex justify-start pt-6'>
          <BoundlessButton type='submit' size='xl' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Continue'}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
