'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
  /** When true, the ring renders muted (e.g. results published already). */
  done?: boolean;
}

export function ProgressRing({
  value,
  total,
  size = 144,
  strokeWidth = 10,
  label,
  sublabel,
  className,
  done = false,
}: ProgressRingProps) {
  const safeTotal = Math.max(total, 0);
  const safeValue = Math.min(Math.max(value, 0), safeTotal);
  const pct = safeTotal === 0 ? 0 : safeValue / safeTotal;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference * (1 - pct);
  const stroke = done ? 'stroke-gray-600' : 'stroke-primary';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={strokeWidth}
          className='stroke-gray-900/80'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          className={cn(
            stroke,
            'transition-[stroke-dashoffset] duration-700 ease-out'
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
        <div className='text-2xl font-semibold tracking-tight text-white'>
          {label ?? (
            <>
              {safeValue}
              <span className='text-gray-600'>/{safeTotal}</span>
            </>
          )}
        </div>
        {sublabel && (
          <div className='mt-0.5 text-[10px] tracking-wider text-gray-500 uppercase'>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
