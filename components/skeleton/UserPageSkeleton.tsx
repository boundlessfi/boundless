import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/motion';

export const UserPageSkeleton = () => {
  return (
    <div className='mt-14 flex flex-col gap-8 lg:flex-row lg:gap-16'>
      {/* Profile Overview Skeleton */}
      <div className='w-full lg:w-auto'>
        <div className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
          {/* Avatar and basic info */}
          <div className='mb-6 flex items-center gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='flex-1'>
              <Skeleton className='mb-2 h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>

          {/* Stats */}
          <div className='mb-6 grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <Skeleton className='mx-auto mb-2 h-8 w-12' />
              <Skeleton className='mx-auto h-3 w-16' />
            </div>
            <div className='text-center'>
              <Skeleton className='mx-auto mb-2 h-8 w-12' />
              <Skeleton className='mx-auto h-3 w-16' />
            </div>
          </div>

          {/* Bio */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </div>
      </div>

      {/* Tabs Section Skeleton */}
      <div className='flex-1'>
        <div className='w-full'>
          {/* Tabs Header */}
          <div className='border-b border-zinc-800'>
            <div className='flex h-auto w-full justify-start gap-6 bg-transparent p-0'>
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-8 w-20' />
              <Skeleton className='hidden h-8 w-24 md:block' />
            </div>
          </div>

          {/* Tab Content */}
          <div className='mt-6'>
            {/* Activity Tab Content */}
            <div className='space-y-6'>
              {/* Activity Stats */}
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'
                  >
                    <Skeleton className='mb-2 h-4 w-16' />
                    <Skeleton className='mb-3 h-8 w-8' />
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter Dropdown */}
              <Skeleton className='h-10 w-32' />

              {/* Activity Feed */}
              <div className='space-y-4'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'
                  >
                    <div className='flex items-start gap-3'>
                      <Skeleton className='h-10 w-10 rounded-full' />
                      <div className='flex-1'>
                        <Skeleton className='mb-2 h-4 w-48' />
                        <Skeleton className='h-3 w-32' />
                      </div>
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                ))}
              </div>

              {/* Future Feature */}
              <div className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
                <Skeleton className='mb-4 h-6 w-40' />
                <div className='grid grid-cols-7 gap-2'>
                  {Array.from({ length: 35 }).map((_, index) => (
                    <Skeleton key={index} className='h-3 w-3 rounded-sm' />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecentProjectsSkeleton = () => {
  return (
    <>
      <motion.div
        className='flex flex-col items-start justify-between gap-3 sm:gap-4 xl:flex-row xl:items-center xl:gap-0'
        variants={fadeInUp}
      >
        <div className='flex items-center gap-2 sm:gap-3 xl:gap-5'>
          <Skeleton className='h-6 w-32 sm:h-7 sm:w-40' />
          <Skeleton className='h-8 w-20' />
        </div>
        <div className='flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3 xl:w-auto'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-24' />
        </div>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 gap-4 sm:grid-cols-1 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'
        variants={staggerContainer}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            className='rounded-[12px] border border-[#484848] bg-[#2B2B2B] p-4'
            variants={fadeInUp}
            custom={index}
          >
            <div className='mb-3 flex items-start gap-3'>
              <Skeleton className='h-16 w-16 flex-shrink-0 rounded-lg' />
              <div className='min-w-0 flex-1'>
                <Skeleton className='mb-2 h-5 w-3/4' />
                <Skeleton className='mb-1 h-4 w-full' />
                <Skeleton className='h-4 w-2/3' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-1/2' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export const CampaignTableSkeleton = () => {
  return (
    <>
      <div className='flex flex-col items-start justify-between gap-3 sm:gap-4 xl:flex-row xl:items-center xl:gap-0'>
        <div className='flex items-center gap-2 sm:gap-3 xl:gap-5'>
          <Skeleton className='h-6 w-32 sm:h-7 sm:w-40' />
        </div>
        <div className='flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3 xl:w-auto'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-24' />
        </div>
      </div>

      <div className='hidden gap-6 border-b border-[#2B2B2B] px-4 py-3 text-sm font-medium text-[#B5B5B5] xl:flex'>
        <div className='w-[200px] flex-shrink-0'>
          <Skeleton className='h-4 w-24' />
        </div>
        <div className='w-[164px] flex-shrink-0'>
          <Skeleton className='h-4 w-16' />
        </div>
        <div className='w-[160px] flex-shrink-0'>
          <Skeleton className='h-4 w-28' />
        </div>
        <div className='w-[100px] flex-shrink-0'>
          <Skeleton className='h-4 w-20' />
        </div>
        <div className='w-[73px] flex-shrink-0'>
          <Skeleton className='h-4 w-18' />
        </div>
        <div className='w-[75px] flex-shrink-0'>
          <Skeleton className='h-4 w-12' />
        </div>
        <div className='ml-auto w-[64px] flex-shrink-0 text-right'>
          <Skeleton className='ml-auto h-4 w-16' />
        </div>
      </div>

      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className='hidden items-center gap-6 rounded-[12px] border border-[#2B2B2B] bg-[#2B2B2B] p-3 xl:flex'
          >
            <div className='flex w-[200px] flex-shrink-0 items-center gap-3'>
              <Skeleton className='h-11 w-11 rounded-[4px]' />
              <div className='min-w-0 flex-1'>
                <Skeleton className='mb-1 h-4 w-24' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>

            <div className='flex w-[164px] flex-shrink-0 items-center gap-3'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-4 w-20' />
            </div>

            <div className='w-[160px] flex-shrink-0 space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-2 w-full rounded-full' />
            </div>

            <div className='w-[100px] flex-shrink-0'>
              <Skeleton className='h-4 w-16' />
            </div>

            <div className='w-[73px] flex-shrink-0'>
              <Skeleton className='h-4 w-8' />
            </div>

            <div className='w-[75px] flex-shrink-0'>
              <Skeleton className='h-6 w-16 rounded-none' />
            </div>

            <div className='ml-auto flex w-[64px] flex-shrink-0 justify-end'>
              <Skeleton className='h-8 w-8 rounded' />
            </div>
          </div>
        ))}

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className='rounded-[12px] border border-[#2B2B2B] bg-[#2B2B2B] p-3 sm:p-4 xl:hidden'
          >
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                <Skeleton className='h-10 w-10 rounded-[4px] sm:h-12 sm:w-12' />
                <div className='min-w-0 flex-1'>
                  <Skeleton className='mb-1 h-4 w-24' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
              <div className='flex items-center gap-1 sm:gap-2'>
                <Skeleton className='h-6 w-16 rounded-none' />
                <Skeleton className='h-7 w-7 rounded sm:h-8 sm:w-8' />
              </div>
            </div>

            <div className='space-y-2 sm:space-y-3'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <Skeleton className='h-7 w-7 rounded-full sm:h-8 sm:w-8' />
                <Skeleton className='h-4 w-20' />
              </div>

              <div className='space-y-1.5 sm:space-y-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-1.5 w-full rounded-full sm:h-2' />
              </div>

              <div className='flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
