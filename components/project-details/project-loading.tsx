import { Skeleton } from '@/components/ui/skeleton';

export function ProjectLoading() {
  return (
    <div className='min-h-screen bg-[#030303]'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:max-w-[1800px]'>
        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8 xl:gap-12'>
          {/* Left Column - Project Sidebar Skeleton */}
          <div className='w-full space-y-6 lg:max-w-[360px] lg:shrink-0 xl:max-w-[400px] 2xl:max-w-[440px]'>
            {/* Project Header Skeleton */}
            <div className='flex gap-4 sm:gap-5'>
              <Skeleton className='h-16 w-16 shrink-0 rounded-lg sm:h-24 sm:w-24' />
              <div className='flex-1 space-y-3'>
                <Skeleton className='h-6 w-3/4 sm:h-8' />
                <div className='flex flex-wrap gap-2'>
                  <Skeleton className='h-5 w-20 sm:h-6' />
                  <Skeleton className='h-5 w-24 sm:h-6' />
                </div>
                <Skeleton className='h-4 w-32' />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/6' />
            </div>

            {/* Voting Progress Skeleton */}
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-20' />
              </div>
              <Skeleton className='h-2 w-full' />
            </div>

            {/* Action Buttons Skeleton */}
            <div className='flex flex-wrap gap-2 sm:gap-3'>
              <Skeleton className='h-10 flex-1 sm:h-12' />
              <Skeleton className='h-10 w-10 sm:h-12 sm:w-12' />
              <Skeleton className='h-10 w-10 sm:h-12 sm:w-12' />
            </div>

            {/* Creator Info Skeleton — hidden on mobile */}
            <div className='hidden space-y-3 sm:block'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            </div>

            {/* Project Links Skeleton — hidden on mobile */}
            <div className='hidden space-y-4 sm:block'>
              <Skeleton className='h-4 w-24' />
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-40' />
                </div>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-36' />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content Skeleton */}
          <div className='min-h-0 min-w-0 flex-1'>
            {/* Tabs Skeleton */}
            <div className='mb-4 flex gap-2 overflow-x-auto border-b border-gray-800 sm:mb-6 sm:gap-4 lg:mb-8 lg:gap-6'>
              <Skeleton className='h-10 w-16 shrink-0 sm:h-12 sm:w-20' />
              <Skeleton className='h-10 w-14 shrink-0 sm:h-12 sm:w-16' />
              <Skeleton className='h-10 w-20 shrink-0 sm:h-12 sm:w-24' />
              <Skeleton className='h-10 w-24 shrink-0 sm:h-12 sm:w-28' />
              <Skeleton className='h-10 w-16 shrink-0 sm:h-12 sm:w-20' />
            </div>

            {/* Content Skeleton */}
            <div className='space-y-4 sm:space-y-6'>
              <Skeleton className='h-6 w-36 sm:h-8 sm:w-48' />
              <div className='space-y-3 sm:space-y-4'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-4/6' />
                <Skeleton className='h-4 w-3/4' />
              </div>
              <Skeleton className='h-5 w-28 sm:h-6 sm:w-32' />
              <div className='space-y-3 sm:space-y-4'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-4/6' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
