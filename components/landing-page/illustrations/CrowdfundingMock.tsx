/**
 * CrowdfundingMock
 *
 * Flat UI mockup of a crowdfunding campaign card with funding progress, themed via tokens.
 */
const CrowdfundingMock = () => {
  return (
    <div
      className='flex h-full w-full items-center justify-center px-4 py-4'
      role='img'
      aria-label='Mockup of a crowdfunding campaign at 65 percent funded with $32,500 raised of $50,000, 47 backers, 8 days left'
    >
      <div className='bg-elevated w-full max-w-[300px] rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Header — project identity */}
        <div className='flex items-center gap-2.5 border-b border-white/10 px-3.5 py-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                cx='8'
                cy='8'
                r='3'
                fill='currentColor'
                className='text-white/85'
              />
              <g
                stroke='currentColor'
                strokeWidth='1.25'
                strokeLinecap='round'
                opacity='0.6'
                className='text-white/70'
              >
                <line x1='8' y1='1.5' x2='8' y2='3' />
                <line x1='8' y1='13' x2='8' y2='14.5' />
                <line x1='1.5' y1='8' x2='3' y2='8' />
                <line x1='13' y1='8' x2='14.5' y2='8' />
                <line x1='3.5' y1='3.5' x2='4.5' y2='4.5' />
                <line x1='11.5' y1='11.5' x2='12.5' y2='12.5' />
                <line x1='3.5' y1='12.5' x2='4.5' y2='11.5' />
                <line x1='11.5' y1='4.5' x2='12.5' y2='3.5' />
              </g>
            </svg>
          </div>
          <div className='flex-1'>
            <div className='text-[13px] font-semibold tracking-tight text-white'>
              SolarFi
            </div>
            <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
              Sustainability · M1 of 4
            </div>
          </div>
          <div className='rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
            Funding
          </div>
        </div>

        {/* Progress */}
        <div className='px-3.5 py-3'>
          <div className='flex items-baseline justify-between'>
            <span className='text-lg font-bold tracking-tight text-white'>
              $32,500
            </span>
            <span className='font-mono text-[10px] text-white/50'>
              of $50,000
            </span>
          </div>
          <div className='bg-border-subtle mt-2 h-2 w-full overflow-hidden rounded-full'>
            <div className='bg-primary h-full w-[65%] rounded-full' />
          </div>
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-3 gap-2 border-t border-white/10 px-3.5 py-2.5'>
          <div>
            <div className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
              Backers
            </div>
            <div className='mt-0.5 text-[11px] font-semibold text-white'>
              47
            </div>
          </div>
          <div>
            <div className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
              Days left
            </div>
            <div className='mt-0.5 text-[11px] font-semibold text-white'>8</div>
          </div>
          <div>
            <div className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
              Funded
            </div>
            <div className='mt-0.5 text-[11px] font-semibold text-white'>
              65%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdfundingMock;
