'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BrushCleaning, Plus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming a utility for class merging exists, otherwise will use template literals

/**
 * Props for the EmptyState component.
 */
export interface EmptyStateProps {
  /** The main title of the empty state */
  title?: string;
  /** A descriptive message explaining the empty state */
  description?: string;
  /** Text to display on the action button (if default action is used) */
  buttonText?: string;
  /** Callback function when the default action button is clicked */
  onAddClick?: () => void;
  /** Additional custom classes for the container */
  className?: string;
  /** Visual style variant of the empty state */
  type?: 'default' | 'compact' | 'custom';
  /** Custom action element to replace the default button. If undefined, default button is shown. */
  action?: React.ReactNode;
}

/**
 * EmptyState Component
 * Displays a placeholder when no data is available, with optional call-to-action.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Projects',
  description = 'There are currently no projects here. Go ahead and create the first one!',
  buttonText = 'Add Project',
  onAddClick,
  className = '',
  type = 'default',
  action,
}) => {
  // Animation variants for staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Determine button styles based on type
  const getButtonStyle = () => {
    const baseStyle =
      'flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (type) {
      case 'compact':
        return `${baseStyle} px-4 py-2 text-sm bg-[#00D2A4] text-black hover:bg-[#00B894] focus:ring-[#00D2A4] shadow-sm`;
      case 'custom':
        return `${baseStyle} px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md`;
      default:
        return `${baseStyle} px-6 py-3 bg-[#00D2A4] text-black hover:bg-[#00B894] focus:ring-[#00D2A4] shadow-[0_2px_8px_rgba(0,210,164,0.2)]`;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className,
        type === 'compact' ? 'min-h-[200px]' : 'min-h-[400px]'
      )}
    >
      {/* Icon */}
      <motion.div
        variants={itemVariants}
        className='mb-6 text-gray-500 dark:text-gray-400'
      >
        <BrushCleaning size={type === 'compact' ? 60 : 100} strokeWidth={1} />
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={itemVariants}
        className={cn(
          'text-foreground font-semibold',
          type === 'compact' ? 'mb-2 text-xl' : 'mb-4 text-3xl'
        )}
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className={cn(
          'text-muted-foreground mx-auto',
          type === 'compact'
            ? 'mb-6 max-w-xs text-sm'
            : 'mb-8 max-w-md text-base'
        )}
      >
        {description}
      </motion.p>

      {/* Action Area */}
      {action !== undefined ? (
        <motion.div variants={itemVariants}>{action}</motion.div>
      ) : (
        onAddClick && (
          <motion.div variants={itemVariants}>
            <button onClick={onAddClick} className={getButtonStyle()}>
              <Plus size={18} />
              {buttonText}
            </button>
          </motion.div>
        )
      )}
    </motion.div>
  );
};

export default EmptyState;
