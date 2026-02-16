import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FieldLabelProps {
  label: string;
  tooltip?: string;
  required?: boolean;
  useFormLabel?: boolean;
}

export default function FieldLabel({
  label,
  tooltip,
  required,
  useFormLabel = true,
}: FieldLabelProps) {
  return (
    <div className='flex items-center gap-2'>
      {useFormLabel ? (
        <FormLabel className='text-sm font-medium text-white'>
          {label} {required && <span className='text-error-400'>*</span>}
        </FormLabel>
      ) : (
        <p className='text-sm font-medium text-white'>
          {label} {required && <span className='text-error-400'>*</span>}
        </p>
      )}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              className='rounded-full text-gray-500 transition hover:text-gray-300'
            >
              <Info className='h-4 w-4' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={6} className='max-w-xs'>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
