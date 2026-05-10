/**
 * BuilderMock
 *
 * Stacked submission cards showing milestone-based payout. Themed via tokens.
 */
const BuilderMock = () => {
  return (
    <div
      className='relative flex h-full w-full items-center justify-center px-5 py-5'
      role='img'
      aria-label='Mockup of a builder submission card showing milestone 2 of 3 paid out at $2,500 with a PAID status pill'
    >
      {/* Back card 2 */}
      <div
        className='bg-elevated/50 absolute h-[140px] w-[230px] translate-x-6 -translate-y-2 rotate-[6deg] rounded-xl border border-white/10'
        aria-hidden='true'
      />
      {/* Back card 1 */}
      <div
        className='bg-elevated/75 absolute h-[148px] w-[240px] translate-x-3 -translate-y-1 -rotate-[4deg] rounded-xl border border-white/10'
        aria-hidden='true'
      />

      {/* Front card */}
      <div className='bg-elevated relative w-full max-w-[260px] rounded-xl border border-white/10 px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-mono text-[8px] tracking-[0.18em] text-white/50 uppercase'>
              Submission · #sub_a42
            </div>
            <div className='mt-1 text-base font-semibold tracking-tight text-white'>
              Milestone 2 of 3
            </div>
          </div>
          <div className='bg-primary rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-black'>
            PAID
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className='mt-3 flex items-center gap-1.5'>
          <span className='bg-primary h-1.5 flex-1 rounded-full' />
          <span className='bg-primary h-1.5 flex-1 rounded-full' />
          <span className='bg-border-subtle h-1.5 flex-1 rounded-full' />
        </div>

        {/* Body lines */}
        <div className='mt-3.5 space-y-1.5'>
          <div className='bg-border-subtle h-1 w-full rounded-full' />
          <div className='bg-border-subtle h-1 w-5/6 rounded-full' />
          <div className='bg-border-subtle h-1 w-2/3 rounded-full' />
        </div>

        {/* Total */}
        <div className='mt-3.5 flex items-end justify-between border-t border-white/10 pt-2.5'>
          <span className='font-mono text-[9px] tracking-[0.18em] text-white/50 uppercase'>
            Released
          </span>
          <span className='text-base font-semibold tracking-tight text-white'>
            $2,500
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuilderMock;
