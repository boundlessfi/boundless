/**
 * BountyMock
 *
 * Flat UI mockup of a posted bounty, themed via tokens.
 */
const BountyMock = () => {
  return (
    <div
      className='flex h-full w-full items-center justify-center px-3 py-3'
      role='img'
      aria-label='Mockup of an open $1,200 bounty for a CSV exporter task'
    >
      <div className='bg-elevated w-full max-w-[240px] rounded-xl border border-white/10 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
              Bounty · #b_148
            </div>
            <div className='mt-1 text-[13px] font-semibold tracking-tight text-white'>
              CSV exporter
            </div>
          </div>
          <div className='ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold tracking-[0.15em] text-white uppercase'>
            Open
          </div>
        </div>

        {/* Description lines */}
        <div className='mt-3 space-y-1.5'>
          <div className='bg-border-subtle h-1 w-full rounded-full' />
          <div className='bg-border-subtle h-1 w-5/6 rounded-full' />
          <div className='bg-border-subtle h-1 w-2/3 rounded-full' />
        </div>

        {/* Tags */}
        <div className='mt-3 flex flex-wrap gap-1'>
          <span className='rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[8px] tracking-wide text-white/50 uppercase'>
            Backend
          </span>
          <span className='rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[8px] tracking-wide text-white/50 uppercase'>
            14d
          </span>
        </div>

        {/* Reward */}
        <div className='mt-3 flex items-end justify-between border-t border-white/10 pt-2.5'>
          <div>
            <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
              Reward
            </div>
            <div className='mt-0.5 text-base font-semibold tracking-tight text-white'>
              $1,200
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <span className='bg-primary h-1.5 w-1.5 rounded-full' />
            <span className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
              On-chain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyMock;
