'use client';

import React, { useState } from 'react';
import { FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
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

const formatTimeValue = (date?: Date): string => {
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const applyTimeToDate = (date: Date, timeValue: string): Date => {
  const parts = timeValue.split(':').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = parts;
  const next = new Date(date);
  next.setHours(hours, minutes, seconds, 0);
  return next;
};

export default function DateTimeInput({
  field,
  placeholder,
  disabledPast = true,
}: DateTimeInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex w-full flex-row flex-wrap gap-3 sm:flex-nowrap'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant='outline'
              className={cn(
                'bg-background-card h-12 min-w-0 flex-1 rounded-[12px] border border-gray-900 p-4 text-left font-normal sm:w-32',
                !field.value && 'text-gray-600'
              )}
            >
              {field.value ? format(field.value, 'PPP') : placeholder}
              <ChevronDownIcon className='ml-auto h-4 w-4 shrink-0 text-gray-400' />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className='bg-background-card w-auto overflow-hidden border-gray-900 p-0 text-white!'
          align='start'
        >
          <Calendar
            mode='single'
            selected={field.value}
            captionLayout='dropdown'
            defaultMonth={field.value}
            onSelect={date => {
              if (date) {
                const withTime = field.value
                  ? applyTimeToDate(date, formatTimeValue(field.value))
                  : date;
                field.onChange(withTime);
              } else {
                field.onChange(undefined);
              }
              setOpen(false);
            }}
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
          step='1'
          className='bg-background-card selection:bg-primary/30 h-12 w-40 shrink-0 rounded-[12px] border border-gray-900 px-4 text-sm text-white [&::-webkit-calendar-picker-indicator]:hidden'
          value={formatTimeValue(field.value)}
          onChange={event => {
            const timeValue = event.target.value;
            if (!timeValue) return;
            const base = field.value ?? new Date();
            field.onChange(applyTimeToDate(base, timeValue));
          }}
          disabled={!field.value}
        />
      </FormControl>
    </div>
  );
}
