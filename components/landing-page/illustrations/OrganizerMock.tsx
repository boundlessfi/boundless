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
      <div className='border-border-subtle bg-elevated w-full max-w-[280px] rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Title bar */}
        <div className='border-border-subtle flex items-center gap-2 border-b px-3 py-2'>
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
          <div className='border-border-subtle bg-stage ml-1 flex flex-1 items-center justify-center rounded-md border px-2 py-1'>
            <span className='text-muted-text font-mono text-[9px] tracking-tight'>
              boundless.xyz/programs/new
            </span>
          </div>
        </div>

        {/* Body */}
        <div className='px-4 py-3.5'>
          <div className='text-muted-text font-mono text-[8px] tracking-[0.18em] uppercase'>
            New program · #hck_q4
          </div>
          <div className='text-foreground mt-1.5 text-lg font-semibold tracking-tight'>
            $50,000 USD
          </div>

          <div className='mt-3 flex flex-wrap gap-1.5'>
            <span className='bg-mint text-on-mint rounded-full px-2.5 py-0.5 text-[9px] font-semibold'>
              Hackathon
            </span>
            <span className='border-border-subtle text-secondary-text rounded-full border px-2.5 py-0.5 text-[9px] font-medium'>
              Grant
            </span>
            <span className='border-border-subtle text-secondary-text rounded-full border px-2.5 py-0.5 text-[9px] font-medium'>
              Bounty
            </span>
          </div>

          {/* Field rows */}
          <div className='mt-3 space-y-1.5'>
            <div className='border-border-subtle flex items-center justify-between border-b pb-1.5'>
              <span className='text-muted-text font-mono text-[9px] tracking-wide uppercase'>
                Release rule
              </span>
              <span className='text-foreground text-[10px] font-medium'>
                Judging
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-text font-mono text-[9px] tracking-wide uppercase'>
                Escrow
              </span>
              <span className='text-foreground text-[10px] font-medium'>
                Soroban · USDC
              </span>
            </div>
          </div>

          <div className='bg-mint text-on-mint mt-3 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-semibold'>
            Create program →
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerMock;
