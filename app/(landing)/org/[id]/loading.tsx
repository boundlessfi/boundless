import { Skeleton } from '@/components/ui/skeleton';

export default function OrgProfileLoading() {
  return (
    <section className='mx-auto min-h-screen max-w-[1440px] px-5 py-10 md:px-[50px] lg:px-[100px]'>
      {/* Banner skeleton */}
      <div className='mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
          <Skeleton className='h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28' />
          <div className='flex flex-1 flex-col gap-3'>
            <Skeleton className='h-9 w-72' />
            <Skeleton className='h-5 w-96 max-w-full' />
            <div className='flex gap-3'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex gap-2'>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className='h-9 w-9 rounded-lg' />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>

      {/* About skeleton */}
      <div className='space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 lg:p-8'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>
    </section>
  );
}
