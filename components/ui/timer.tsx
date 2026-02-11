'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';

const timerVariants = cva(
  [
    'inline-flex items-center gap-2 font-medium rounded-full transition-all duration-200',
    '',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-background text-foreground border border-border shadow-[0_2px_4px_rgba(0,0,0,0.02),_0px_1px_2px_rgba(0,0,0,0.04)]',
        outline:
          'border border-input bg-background text-foreground shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset]',
        ghost: 'bg-transparent text-foreground ',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/20',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5 h-5 gap-1',
        md: 'text-xs px-2 py-1 h-6 gap-1.5',
        lg: 'text-sm px-2.5 py-1.5 h-7 gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const timerIconVariants = cva('transition-transform duration-[2000ms]', {
  variants: {
    size: {
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
    },
    loading: {
      true: 'animate-spin',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    loading: false,
  },
});

const timerDisplayVariants = cva('font-mono tabular-nums tracking-tight', {
  variants: {
    size: {
      sm: 'text-[10px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type TimerRootProps = {
  /** Whether the timer is in loading/running state */
  loading?: boolean;
} & VariantProps<typeof timerVariants> &
  React.HTMLAttributes<HTMLDivElement>;

export const TimerRoot = React.forwardRef<HTMLDivElement, TimerRootProps>(
  ({ variant, size, loading, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerVariants({ variant, size }), className)}
        role='timer'
        aria-live='polite'
        aria-atomic='true'
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimerRoot.displayName = 'TimerRoot';

export type TimerIconProps = {
  /** Custom icon to display instead of default Clock */
  icon?: React.ComponentType<{ className?: string }>;
} & VariantProps<typeof timerIconVariants> &
  React.HTMLAttributes<HTMLDivElement>;

export const TimerIcon = React.forwardRef<HTMLDivElement, TimerIconProps>(
  ({ size, loading, icon: Icon = Clock, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerIconVariants({ size, loading }), className)}
        {...props}
      >
        <Icon className='h-full w-full' />
      </div>
    );
  }
);
TimerIcon.displayName = 'TimerIcon';

export type TimerDisplayProps = {
  /** Time value to display */
  time: string;
  /** Optional label for accessibility */
  label?: string;
} & VariantProps<typeof timerDisplayVariants> &
  React.HTMLAttributes<HTMLDivElement>;

export const TimerDisplay = React.forwardRef<HTMLDivElement, TimerDisplayProps>(
  ({ size, time, label, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerDisplayVariants({ size }), className)}
        aria-label={label || `Timer: ${time}`}
        {...props}
      >
        {time}
      </div>
    );
  }
);
TimerDisplay.displayName = 'TimerDisplay';

/**
 * Hook for a countdown timer
 */
export function useCountdown(targetDate?: string | Date) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    display: string;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    display: '00:00:00:00',
    isExpired: true,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          display: '00:00:00:00',
          isExpired: true,
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const display = `${days.toString().padStart(2, '0')}d ${hours
        .toString()
        .padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds
        .toString()
        .padStart(2, '0')}s`;

      return {
        days,
        hours,
        minutes,
        seconds,
        display,
        isExpired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

interface CountdownTimerProps extends VariantProps<typeof timerVariants> {
  targetDate?: string | Date;
  className?: string;
  showIcon?: boolean;
}

export const CountdownTimer = ({
  targetDate,
  className,
  variant = 'ghost',
  size = 'md',
  showIcon = true,
}: CountdownTimerProps) => {
  const { display, isExpired } = useCountdown(targetDate);

  if (isExpired && !targetDate) return null;

  return (
    <TimerRoot variant={variant} size={size} className={className}>
      {showIcon && <TimerIcon size={size} loading={!isExpired} />}
      <TimerDisplay size={size} time={isExpired ? 'Expired' : display} />
    </TimerRoot>
  );
};
