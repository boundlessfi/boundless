'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { buttonHover } from '@/lib/motion';
import LoadingSpinner from '../LoadingSpinner';

const boundlessButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-[10px] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 shadow-[0_1px_4px_0_rgba(167,249,80,0.14)]',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-[#2B2B2B] text-white bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-white/30 text-white shadow-xs hover:bg-white/40 border-[0.5px] border-[#484848]',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',

        funding:
          'bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-600/20 dark:bg-green-500 dark:hover:bg-green-600',
        grant:
          'bg-purple-600 text-white shadow-xs hover:bg-purple-700 focus-visible:ring-purple-600/20 dark:bg-purple-500 dark:hover:bg-purple-600',
        milestone:
          'bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600',
        verify:
          'bg-orange-600 text-white shadow-xs hover:bg-orange-700 focus-visible:ring-orange-600/20 dark:bg-orange-500 dark:hover:bg-orange-600',
        escrow:
          'bg-amber-600 text-white shadow-xs hover:bg-amber-700 focus-visible:ring-amber-600/20 dark:bg-amber-500 dark:hover:bg-amber-600',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md !px-4 has-[>svg]:!px-4',
        xl: 'h-12 rounded-md px-8 has-[>svg]:px-6 text-base',
        icon: 'size-9',
      },
      state: {
        default: '',
        loading: 'opacity-75 cursor-not-allowed',
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        pending: 'bg-yellow-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

export interface BoundlessButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof boundlessButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  centerContent?: boolean;
}

const BoundlessButton = React.forwardRef<
  HTMLButtonElement,
  BoundlessButtonProps
>(
  (
    {
      className,
      variant,
      size,
      state,
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      fullWidth,
      centerContent = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading && (
          <LoadingSpinner
            size='sm'
            className='text-background'
            variant='spinner'
          />
        )}

        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );

    const contentWrapper = centerContent ? (
      <span className='flex items-center justify-center gap-2'>
        {buttonContent}
      </span>
    ) : (
      buttonContent
    );

    return (
      <motion.div
        whileHover='hover'
        whileTap='tap'
        variants={buttonHover}
        className={cn('inline-block', fullWidth && 'w-full')}
      >
        <Button
          ref={ref}
          className={cn(
            boundlessButtonVariants({
              variant,
              size,
              state: loading ? 'loading' : state,
            }),
            className,
            fullWidth && 'w-full',
            centerContent && 'justify-center'
          )}
          disabled={isDisabled}
          {...props}
        >
          {contentWrapper}
        </Button>
      </motion.div>
    );
  }
);

BoundlessButton.displayName = 'BoundlessButton';

export { BoundlessButton, boundlessButtonVariants };
