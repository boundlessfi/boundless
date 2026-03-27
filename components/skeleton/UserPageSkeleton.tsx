import { Skeleton } from '@/components/ui/skeleton';

export const UserPageSkeleton = () => {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
      {/* Welcome skeleton */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <Skeleton className='h-8 w-56' />
          <Skeleton className='mt-2 h-4 w-72' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-28 rounded-md' />
          <Skeleton className='h-9 w-28 rounded-md' />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-white/6 bg-white/2 p-4'
          >
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-4 w-4 rounded' />
            </div>
            <Skeleton className='mt-3 h-8 w-12' />
          </div>
        ))}
      </div>

      {/* Projects + Chart grid skeleton */}
      <div className='grid gap-6 lg:grid-cols-5'>
        {/* Projects skeleton */}
        <div className='rounded-xl border border-white/6 bg-white/2 lg:col-span-3'>
          <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-3 w-14' />
          </div>
          <div className='divide-y divide-white/4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 px-4 py-3 sm:px-5'
              >
                <Skeleton className='h-10 w-10 rounded-lg' />
                <div className='flex-1'>
                  <Skeleton className='mb-1.5 h-4 w-36' />
                  <Skeleton className='h-3 w-20' />
                </div>
                <Skeleton className='h-5 w-16 rounded-full' />
              </div>
            ))}
          </div>
        </div>

        {/* Chart skeleton */}
        <div className='rounded-xl border border-white/6 bg-white/2 lg:col-span-2'>
          <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-7 w-24 rounded-lg' />
          </div>
          <div className='p-4 sm:p-5'>
            <div className='flex h-[200px] items-end gap-2 lg:h-[240px]'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='flex-1 rounded-t'
                  style={{ height: `${30 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecentProjectsSkeleton = () => {
  return (
    <div className='rounded-xl border border-white/6 bg-white/2'>
      <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-3 w-14' />
      </div>
      <div className='divide-y divide-white/4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3 px-4 py-3 sm:px-5'>
            <Skeleton className='h-10 w-10 rounded-lg' />
            <div className='flex-1'>
              <Skeleton className='mb-1.5 h-4 w-36' />
              <Skeleton className='h-3 w-20' />
            </div>
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CampaignTableSkeleton = () => {
  return (
    <div className='rounded-xl border border-white/6 bg-white/2'>
      <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
        <Skeleton className='h-4 w-28' />
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-24 rounded-md' />
          <Skeleton className='h-8 w-20 rounded-md' />
        </div>
      </div>
      <div className='divide-y divide-white/4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4 px-4 py-3 sm:px-5'>
            <Skeleton className='h-10 w-10 rounded-lg' />
            <div className='flex-1'>
              <Skeleton className='mb-1.5 h-4 w-32' />
              <Skeleton className='h-3 w-24' />
            </div>
            <Skeleton className='hidden h-2 w-24 rounded-full sm:block' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
};
