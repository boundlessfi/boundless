'use client';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'default' | 'primary' | 'white' | 'muted';
  speed?: 'slow' | 'normal' | 'fast';
  variant?: 'dots' | 'spinner' | 'pulse';
}

const LoadingSpinner = ({
  size = 'md',
  className = '',
  color = 'default',
  speed = 'normal',
  variant = 'spinner',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    white: 'text-white',
    muted: 'text-muted-foreground',
  };

  const speedClasses = {
    slow: 2,
    normal: 1,
    fast: 0.5,
  };

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className={cn(
              'h-2 w-2 rounded-full bg-current',
              colorClasses[color]
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: speedClasses[speed],
              repeat: Infinity,
              delay: index * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          'rounded-full bg-current',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: speedClasses[speed],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // Default spinner variant
  return (
    <motion.div
      className={cn(sizeClasses[size], colorClasses[color], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: speedClasses[speed],
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg
        className='h-full w-full'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        />
        <motion.circle
          className='opacity-75'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray='0 100'
          strokeDashoffset='0'
          animate={{
            strokeDasharray: ['0 100', '50 100', '100 100'],
            strokeDashoffset: [0, -25, -50],
          }}
          transition={{
            duration: speedClasses[speed],
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </motion.div>
  );
};

export default LoadingSpinner;
