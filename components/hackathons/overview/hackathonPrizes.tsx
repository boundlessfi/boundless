'use client';

interface HackathonPrizesProps {
  title?: string;
  totalPrizes?: string;
  otherPrizes?: string;
  prizes: Array<{
    title: string;
    rank: string;
    prize: string;
    details: string[];
    icon?: string;
  }>;
}

export function HackathonPrizes({
  title = 'PRIZES',
  totalPrizes = '$1,000+ in prizes',
  otherPrizes,
  prizes,
}: HackathonPrizesProps) {
  return (
    <div className='space-y-6 py-8'>
      <div>
        <h2 className='text-primary mb-4 text-2xl font-bold'>{title}</h2>
        <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4'>
          <span className='text-sm text-white/90'>{totalPrizes}</span>
          {otherPrizes && (
            <span className='text-xs text-[#a7f950]'>+ {otherPrizes}</span>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {prizes.map((prize, index) => (
          <div
            key={index}
            className='rounded-lg border border-[#a7f950]/30 bg-gradient-to-br from-[#a7f950]/10 to-transparent p-6 transition-colors hover:border-[#a7f950]/50'
          >
            <div className='mb-4 flex items-start gap-3'>
              <span className='text-2xl'>{prize.icon || '⭐'}</span>
              <div>
                <h3 className='text-lg font-bold text-white'>{prize.title}</h3>
                <p className='text-xs text-white/60'>{prize.rank}</p>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='text-base font-bold text-[#a7f950]'>
                {prize.prize}
              </div>
              <ul className='space-y-2'>
                {prize.details.map((detail, i) => (
                  <li key={i} className='flex gap-2 text-sm text-white/70'>
                    <span className='flex-shrink-0 text-[#a7f950]'>✓</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
