/**
 * OrganizerMock
 *
 * A flat browser-window UI mockup showing the program-creation flow on
 * Boundless. Themed via tokens so it works in both light and dark mode.
 * Mint accent on the active program-type chip and the primary CTA.
 */
const OrganizerMock = () => {
  return (
    <div
      className='flex h-full w-full items-center justify-center px-5 py-5'
      role='img'
      aria-label='Mockup of the Boundless program-creation screen with a $50,000 hackathon prize pool and a Create program button'
    >
      <div className='bg-elevated w-full max-w-[280px] rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Title bar */}
        <div className='flex items-center gap-2 border-b border-white/10 px-3 py-2'>
          <div className='flex gap-1'>
            <span
              className='bg-border-strong h-2 w-2 rounded-full'
              aria-hidden
            />
            <span
              className='bg-border-strong h-2 w-2 rounded-full'
              aria-hidden
            />
            <span
              className='bg-border-strong h-2 w-2 rounded-full'
              aria-hidden
            />
          </div>
          <div className='ml-1 flex flex-1 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 py-1'>
            <span className='font-mono text-[9px] tracking-tight text-white/50'>
              boundless.xyz/programs/new
            </span>
          </div>
        </div>

        {/* Body */}
        <div className='px-4 py-3.5'>
          <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
            New program · #hck_q4
          </div>
          <div className='mt-1.5 text-lg font-semibold tracking-tight text-white'>
            $50,000 USD
          </div>

          <div className='mt-3 flex flex-wrap gap-1.5'>
            <span className='bg-primary rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-black'>
              Hackathon
            </span>
            <span className='rounded-full border border-white/10 px-2.5 py-0.5 text-[9px] font-medium text-white/70'>
              Grant
            </span>
            <span className='rounded-full border border-white/10 px-2.5 py-0.5 text-[9px] font-medium text-white/70'>
              Bounty
            </span>
          </div>

          {/* Field rows */}
          <div className='mt-3 space-y-1.5'>
            <div className='flex items-center justify-between border-b border-white/10 pb-1.5'>
              <span className='font-mono text-[9px] tracking-wide text-white/50 uppercase'>
                Release rule
              </span>
              <span className='text-[10px] font-medium text-white'>
                Judging
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-mono text-[9px] tracking-wide text-white/50 uppercase'>
                Escrow
              </span>
              <span className='text-[10px] font-medium text-white'>
                Soroban · USDC
              </span>
            </div>
          </div>

          <div className='bg-primary mt-3 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-semibold text-black'>
            Create program →
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerMock;
