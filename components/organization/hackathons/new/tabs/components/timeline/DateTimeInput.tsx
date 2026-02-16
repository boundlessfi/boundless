import React from 'react';
import { FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateTimeInputProps {
  field: {
    value?: Date;
    onChange: (value?: Date) => void;
  };
  placeholder: string;
  disabledPast?: boolean;
}

export default function DateTimeInput({
  field,
  placeholder,
  disabledPast = true,
}: DateTimeInputProps) {
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

  return (
    <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]'>
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
                <span>{placeholder}</span>
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
            disabled={
              disabledPast
                ? date => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }
                : undefined
            }
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
            field.onChange(applyTimeToDate(field.value, event.target.value));
          }}
          disabled={!field.value}
        />
      </FormControl>
    </div>
  );
}
