/**
 * GrantMock
 *
 * Flat UI mockup of a staged grant program with three milestones, themed via tokens.
 */
const GrantMock = () => {
  return (
    <div
      className='flex h-full w-full items-center justify-center px-3 py-3'
      role='img'
      aria-label='Mockup of a staged grant program with three milestones, two completed and one pending'
    >
      <div className='bg-elevated w-full max-w-[240px] rounded-xl border border-white/10 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
          Grant · #infra-2026
        </div>
        <div className='mt-1 text-[13px] font-semibold tracking-tight text-white'>
          Staged release
        </div>

        {/* Milestones */}
        <div className='mt-3 space-y-1.5'>
          {/* M1 — paid */}
          <div className='border-primary/30 bg-primary/10 flex items-center justify-between rounded-md border px-2.5 py-1.5'>
            <div className='flex items-center gap-2'>
              <span className='bg-primary flex h-3.5 w-3.5 items-center justify-center rounded-full'>
                <svg
                  width='7'
                  height='7'
                  viewBox='0 0 7 7'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M1 3.5 L2.75 5 L6 1.75'
                    stroke='var(--on-mint)'
                    strokeWidth='1.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
              <span className='text-[10px] font-medium text-white'>M1</span>
            </div>
            <span className='text-primary font-mono text-[9px] font-semibold'>
              $10,000
            </span>
          </div>

          {/* M2 — paid */}
          <div className='border-primary/30 bg-primary/10 flex items-center justify-between rounded-md border px-2.5 py-1.5'>
            <div className='flex items-center gap-2'>
              <span className='bg-primary flex h-3.5 w-3.5 items-center justify-center rounded-full'>
                <svg
                  width='7'
                  height='7'
                  viewBox='0 0 7 7'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M1 3.5 L2.75 5 L6 1.75'
                    stroke='var(--on-mint)'
                    strokeWidth='1.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
              <span className='text-[10px] font-medium text-white'>M2</span>
            </div>
            <span className='text-primary font-mono text-[9px] font-semibold'>
              $10,000
            </span>
          </div>

          {/* M3 — pending */}
          <div className='flex items-center justify-between rounded-md border border-white/10 px-2.5 py-1.5'>
            <div className='flex items-center gap-2'>
              <span className='border-border-strong h-3.5 w-3.5 rounded-full border' />
              <span className='text-[10px] font-medium text-white/70'>M3</span>
            </div>
            <span className='font-mono text-[9px] font-medium text-white/50'>
              $10,000
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-3 flex items-center justify-between border-t border-white/10 pt-2'>
          <span className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
            Released
          </span>
          <span className='text-[11px] font-semibold text-white'>
            $20K{' '}
            <span className='font-mono text-[9px] font-normal text-white/50'>
              / $30K
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GrantMock;
