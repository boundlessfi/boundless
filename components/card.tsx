'use client';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { cardHover, iconSpin } from '@/lib/motion';

const Card = ({
  title,
  value,
  bottomText,
}: {
  title: string;
  value: string | React.ReactNode;
  bottomText: React.ReactNode;
}) => {
  return (
    <motion.div
      className='w-full rounded-[12px] border border-[#21413F3D] bg-[#1C1C1C] p-4 shadow-[0_1.5px_4px_-1px_rgba(16,25,40,0.07)] transition-colors hover:border-[#2A2A2A] sm:p-6'
      whileHover='hover'
      variants={cardHover}
    >
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <h3 className='text-sm leading-[145%] font-medium text-[#F5F5F5] sm:text-base'>
          {title}
        </h3>
        <motion.div variants={iconSpin}>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 sm:h-10 sm:w-10'
          >
            <ChevronRight className='h-3 w-3 text-[#F5F5F5] sm:h-4 sm:w-4' />
          </Button>
        </motion.div>
      </div>
      <span className='block text-2xl leading-[120%] font-semibold tracking-[-0.64px] text-white sm:text-3xl lg:text-[32px]'>
        {value}
      </span>
      {bottomText && (
        <div className='mt-2 flex items-center gap-2 text-xs leading-[145%] font-medium tracking-[-0.06px] text-[#484848] sm:mt-3'>
          {bottomText}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
