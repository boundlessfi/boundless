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
      <div className='border-border-subtle bg-elevated w-full max-w-[300px] rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Header — project identity */}
        <div className='border-border-subtle flex items-center gap-2.5 border-b px-3.5 py-3'>
          <div className='border-border-subtle bg-stage flex h-8 w-8 items-center justify-center rounded-md border'>
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
                className='text-foreground/85'
              />
              <g
                stroke='currentColor'
                strokeWidth='1.25'
                strokeLinecap='round'
                opacity='0.6'
                className='text-foreground/70'
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
            <div className='text-foreground text-[13px] font-semibold tracking-tight'>
              SolarFi
            </div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.18em] uppercase'>
              Sustainability · M1 of 4
            </div>
          </div>
          <div className='border-border-subtle text-muted-text rounded-md border px-1.5 py-0.5 font-mono text-[8px] tracking-[0.15em] uppercase'>
            Funding
          </div>
        </div>

        {/* Progress */}
        <div className='px-3.5 py-3'>
          <div className='flex items-baseline justify-between'>
            <span className='text-foreground text-lg font-bold tracking-tight'>
              $32,500
            </span>
            <span className='text-muted-text font-mono text-[10px]'>
              of $50,000
            </span>
          </div>
          <div className='bg-border-subtle mt-2 h-2 w-full overflow-hidden rounded-full'>
            <div className='bg-mint h-full w-[65%] rounded-full' />
          </div>
        </div>

        {/* Stats row */}
        <div className='border-border-subtle grid grid-cols-3 gap-2 border-t px-3.5 py-2.5'>
          <div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.15em] uppercase'>
              Backers
            </div>
            <div className='text-foreground mt-0.5 text-[11px] font-semibold'>
              47
            </div>
          </div>
          <div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.15em] uppercase'>
              Days left
            </div>
            <div className='text-foreground mt-0.5 text-[11px] font-semibold'>
              8
            </div>
          </div>
          <div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.15em] uppercase'>
              Funded
            </div>
            <div className='text-foreground mt-0.5 text-[11px] font-semibold'>
              65%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdfundingMock;
