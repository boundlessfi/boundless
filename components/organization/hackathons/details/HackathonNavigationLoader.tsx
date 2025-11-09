'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HackathonNavigationLoaderProps {
  className?: string;
}

const HackathonNavigationLoader = ({
  className,
}: HackathonNavigationLoaderProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[999998] flex items-center justify-center',
        'bg-[rgba(28,28,28,0.52)] backdrop-blur-[50px]',
        className
      )}
    >
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 right-0 h-96 w-96 rounded-full bg-green-500/5 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-80 w-80 rounded-full bg-green-400/5 blur-3xl' />
        <div className='absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full bg-green-600/5 blur-3xl' />
      </div>

      <div className='relative z-10 flex flex-col items-center'>
        <div className='relative mb-4 flex h-10 items-center space-x-2 sm:mb-6 sm:h-12 sm:space-x-3'>
          <motion.div
            className='h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5'
            animate={{
              height: ['8px', '32px', '8px', '40px', '8px'],
              backgroundColor: [
                'rgba(167, 249, 80, 0.08)',
                '#a7f950',
                'rgba(167, 249, 80, 0.08)',
              ],
              alignSelf: ['center', 'end', 'center', 'end', 'center'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0,
            }}
          />

          <motion.div
            className='h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5'
            animate={{
              height: ['8px', '32px', '8px', '40px', '8px'],
              backgroundColor: [
                'rgba(167, 249, 80, 0.08)',
                '#a7f950',
                'rgba(167, 249, 80, 0.08)',
              ],
              alignSelf: ['center', 'end', 'center', 'end', 'center'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.0,
            }}
          />

          <motion.div
            className='h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5'
            animate={{
              height: ['8px', '32px', '8px', '40px', '8px'],
              backgroundColor: [
                'rgba(167, 249, 80, 0.08)',
                '#a7f950',
                'rgba(167, 249, 80, 0.08)',
              ],
              alignSelf: ['center', 'end', 'center', 'end', 'center'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2.0,
            }}
          />
        </div>

        <motion.h2
          className='px-4 text-center text-base font-normal tracking-wide text-white sm:text-lg'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Loading...
        </motion.h2>
      </div>
    </div>
  );
};

export default HackathonNavigationLoader;
