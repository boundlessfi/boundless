'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { aboutTimelineData } from '@/constants';
import TimelineCard from './TimelineCard';
import ProgressiveeBarSvg from './ProgressiveeBarSvg';

interface ImageSliderProps {
  className?: string;
}

export default function ImageSlider({ className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = aboutTimelineData.length;

  // Optimized navigation functions
  const next = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % totalItems);
  }, [totalItems]);

  const prev = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Memoized position calculation
  const getPosition = useCallback(
    (index: number): 'center' | 'left' | 'right' | 'hidden' => {
      const diff = (index - currentIndex + totalItems) % totalItems;

      if (diff === 0) return 'center';
      if (diff === 1 || diff === totalItems - 1) {
        return diff === 1 ? 'right' : 'left';
      }
      return 'hidden';
    },
    [currentIndex, totalItems]
  );

  // Memoized animation variants
  const imageVariants = useMemo(
    () => ({
      center: {
        x: '0%',
        scale: 1,
        zIndex: 5,
        opacity: 1,
        rotateY: 0,
      },
      left: {
        x: '-25%',
        scale: 0.8,
        zIndex: 2,
        opacity: 0.7,
        rotateY: 15,
      },
      right: {
        x: '25%',
        scale: 0.8,
        zIndex: 2,
        opacity: 0.7,
        rotateY: -15,
      },
      hidden: {
        x: '0%',
        scale: 0.5,
        zIndex: 1,
        opacity: 0,
      },
    }),
    []
  );

  return (
    <div
      className={`relative mx-auto flex min-h-[500px] max-w-[992px] items-center ${className}`}
    >
      <div className='relative h-[400px] w-full'>
        {aboutTimelineData.map((item, index) => {
          const position = getPosition(index);
          const { img, year, title, subTitle, backgroundImage } = item;
          return (
            <motion.div
              key={`${year}-${index}`}
              initial='center'
              animate={position}
              variants={imageVariants}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className='absolute inset-0 left-1/2 flex -translate-x-1/2 items-center justify-center'
              style={{
                width: '550px',
                left: '50%',
                // marginLeft: '-200px',
              }}
              aria-hidden={position === 'hidden'}
            >
              <TimelineCard
                img={img}
                year={year}
                title={title}
                subTitle={subTitle}
                backgroundImage={backgroundImage}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prev}
        className='absolute top-1/2 left-32 z-10 -translate-y-1/2 rounded-full border border-white/48 bg-white/60 p-2 shadow-lg backdrop-blur-[7px] transition-colors hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none'
        aria-label='Previous timeline item'
      >
        <ChevronLeft className='h-6 w-6 text-white' />
      </button>

      <button
        onClick={next}
        className='absolute top-1/2 right-24 z-10 -translate-y-1/2 rounded-full border border-white/48 bg-white/60 p-2 shadow-lg transition-colors hover:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none'
        aria-label='Next timeline item'
      >
        <ChevronRight className='h-6 w-6 text-white' />
      </button>

      {/* Progress Bar and Pagination */}
      <nav
        className='absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center'
        aria-label='Timeline navigation'
      >
        {aboutTimelineData.map((_, index) => (
          <div key={index} className='flex items-center'>
            <button
              onClick={() => goToSlide(index)}
              className={`rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none ${
                index === currentIndex ? 'text-white' : 'text-gray-700/65'
              }`}
              aria-label={`Go to timeline item ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              {String(index + 1).padStart(2, '0')}
            </button>

            {index < aboutTimelineData.length - 1 && (
              <div className='mx-4' aria-hidden='true'>
                <ProgressiveeBarSvg />
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
