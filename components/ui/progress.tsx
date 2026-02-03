'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentProps<
  typeof ProgressPrimitive.Root
> {
  indicatorClassName?: string;
}

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all',
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...(indicatorClassName
            ? {}
            : {
                backgroundImage:
                  'linear-gradient(to right, rgba(167, 249, 80, 0.5) 0%, rgba(167, 249, 80, 0.6) 20%, rgba(167, 249, 80, 0.7) 40%, rgba(167, 249, 80, 0.8) 60%, rgba(167, 249, 80, 0.9) 80%, rgba(167, 249, 80, 1) 100%)',
              }),
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
