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
      <div className='bg-elevated w-full max-w-[300px] rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-white/10 px-3.5 py-2.5'>
          <div>
            <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
              Hackathon · #boundless_q4
            </div>
            <div className='mt-0.5 text-[13px] font-semibold tracking-tight text-white'>
              Final standings
            </div>
          </div>
          <div className='rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white'>
            $50K POOL
          </div>
        </div>

        {/* Leaderboard */}
        <div className='space-y-1.5 px-3.5 py-3'>
          {/* 1st place — highlighted */}
          <div className='border-primary/30 bg-primary/10 flex items-center justify-between rounded-md border px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='text-primary font-mono text-[10px] font-bold'>
                01
              </span>
              <span className='bg-primary/60 h-2 w-2 rounded-full' />
              <span className='bg-foreground/30 h-1 w-20 rounded-full' />
            </div>
            <span className='text-[11px] font-semibold text-white'>
              $25,000
            </span>
          </div>

          {/* 2nd */}
          <div className='flex items-center justify-between rounded-md border border-white/10 px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='font-mono text-[10px] font-bold text-white/50'>
                02
              </span>
              <span className='bg-border-strong h-2 w-2 rounded-full' />
              <span className='bg-border-strong h-1 w-16 rounded-full' />
            </div>
            <span className='text-[11px] font-medium text-white/70'>
              $15,000
            </span>
          </div>

          {/* 3rd */}
          <div className='flex items-center justify-between rounded-md border border-white/10 px-2.5 py-2'>
            <div className='flex items-center gap-2.5'>
              <span className='font-mono text-[10px] font-bold text-white/50'>
                03
              </span>
              <span className='bg-border-strong h-2 w-2 rounded-full' />
              <span className='bg-border-strong h-1 w-14 rounded-full' />
            </div>
            <span className='text-[11px] font-medium text-white/70'>
              $10,000
            </span>
          </div>
        </div>

        {/* Footer / status */}
        <div className='flex items-center justify-between border-t border-white/10 px-3.5 py-2'>
          <span className='font-mono text-[8px] tracking-[0.15em] text-white/50 uppercase'>
            Released on-chain
          </span>
          <span className='bg-primary h-1.5 w-1.5 rounded-full' />
        </div>
      </div>
    </div>
  );
};

export default HackathonMock;
