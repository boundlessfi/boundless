/**
 * HackathonMock
 *
 * Flat UI mockup of a hackathon leaderboard. Themed via tokens.
 */
const HackathonMock = () => {
  return (
    <div
      className='flex h-full w-full items-center justify-center px-4 py-4'
      role='img'
      aria-label='Mockup of a hackathon final standings leaderboard with three placed entries and a $50,000 prize pool'
    >
      <div className='border-border-subtle bg-elevated w-full max-w-[300px] rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Header */}
        <div className='border-border-subtle flex items-start justify-between border-b px-3.5 py-2.5'>
          <div>
            <div className='text-muted-text font-mono text-[8px] tracking-[0.18em] uppercase'>
              Hackathon · #boundless_q4
            </div>
            <div className='text-foreground mt-0.5 text-[13px] font-semibold tracking-tight'>
              Final standings
            </div>
          </div>
          <div className='border-border-subtle bg-stage text-foreground rounded-md border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider'>
            $50K POOL
          </div>
        </div>

        {/* Leaderboard */}
        <div className='space-y-1.5 px-3.5 py-3'>
          {/* 1st place — highlighted */}
          <div className='border-mint-border bg-mint-bg flex items-center justify-between rounded-md border px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='text-mint font-mono text-[10px] font-bold'>
                01
              </span>
              <span className='bg-mint/60 h-2 w-2 rounded-full' />
              <span className='bg-foreground/30 h-1 w-20 rounded-full' />
            </div>
            <span className='text-foreground text-[11px] font-semibold'>
              $25,000
            </span>
          </div>

          {/* 2nd */}
          <div className='border-border-subtle flex items-center justify-between rounded-md border px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='text-muted-text font-mono text-[10px] font-bold'>
                02
              </span>
              <span className='bg-border-strong h-2 w-2 rounded-full' />
              <span className='bg-border-strong h-1 w-16 rounded-full' />
            </div>
            <span className='text-secondary-text text-[11px] font-medium'>
              $15,000
            </span>
          </div>

          {/* 3rd */}
          <div className='border-border-subtle flex items-center justify-between rounded-md border px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='text-muted-text font-mono text-[10px] font-bold'>
                03
              </span>
              <span className='bg-border-strong h-2 w-2 rounded-full' />
              <span className='bg-border-strong h-1 w-14 rounded-full' />
            </div>
            <span className='text-secondary-text text-[11px] font-medium'>
              $10,000
            </span>
          </div>
        </div>

        {/* Footer / status */}
        <div className='border-border-subtle flex items-center justify-between border-t px-3.5 py-2'>
          <span className='text-muted-text font-mono text-[8px] tracking-[0.15em] uppercase'>
            Released on-chain
          </span>
          <span className='bg-mint h-1.5 w-1.5 rounded-full' />
        </div>
      </div>
    </div>
  );
};

export default HackathonMock;
