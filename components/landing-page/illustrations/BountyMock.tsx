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
      <div className='border-border-subtle bg-elevated w-full max-w-[240px] rounded-xl border px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.18em] uppercase'>
              Bounty · #b_148
            </div>
            <div className='text-foreground mt-1 text-[13px] font-semibold tracking-tight'>
              CSV exporter
            </div>
          </div>
          <div className='border-border-subtle bg-stage text-foreground ml-2 rounded-full border px-2 py-0.5 text-[8px] font-bold tracking-[0.15em] uppercase'>
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
          <span className='border-border-subtle text-muted-text rounded-md border px-1.5 py-0.5 font-mono text-[8px] tracking-wide uppercase'>
            Backend
          </span>
          <span className='border-border-subtle text-muted-text rounded-md border px-1.5 py-0.5 font-mono text-[8px] tracking-wide uppercase'>
            14d
          </span>
        </div>

        {/* Reward */}
        <div className='border-border-subtle mt-3 flex items-end justify-between border-t pt-2.5'>
          <div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.18em] uppercase'>
              Reward
            </div>
            <div className='text-foreground mt-0.5 text-base font-semibold tracking-tight'>
              $1,200
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <span className='bg-mint h-1.5 w-1.5 rounded-full' />
            <span className='text-muted-text font-mono text-[8px] tracking-[0.15em] uppercase'>
              On-chain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyMock;
