'use client';

import { PrizeTier } from '@/lib/api/hackathons';

interface HackathonPrizesProps {
  title?: string;
  totalPrizePool?: string;
  otherPrizes?: string;
  prizes: PrizeTier[];
}

export function HackathonPrizes({
  title = 'PRIZES',
  totalPrizePool,
  otherPrizes,
  prizes,
}: HackathonPrizesProps) {
  const firstThreePrizes = prizes.slice(0, 3);
  const remainingPrizes = prizes.slice(3);

  return (
    <div className='space-y-6 py-8'>
      <div>
        <h2 className='text-primary mb-4 text-2xl font-bold'>{title}</h2>
        <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4'>
          <span className='text-sm text-white/90'>{totalPrizePool} USDC</span>
          {otherPrizes && (
            <span className='text-xs text-[#a7f950]'>+ {otherPrizes}</span>
          )}
        </div>
      </div>

      {/* First 3 prizes in cards */}
      {firstThreePrizes.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {firstThreePrizes.map((prize, index) => (
            <div
              key={index}
              className='rounded-lg border border-[#a7f950]/30 bg-gradient-to-br from-[#a7f950]/10 to-transparent p-6 transition-colors hover:border-[#a7f950]/50'
            >
              <div className='mb-4 flex items-start gap-3'>
                <span className='text-2xl'>
                  {index === 0
                    ? '🥇'
                    : index === 1
                      ? '🥈'
                      : index === 2
                        ? '🥉'
                        : '⭐'}
                </span>
                <div>
                  <h3 className='text-lg font-bold text-white'>
                    {prize.position}
                  </h3>
                  <p className='text-xs text-white/60'>{prize.position}</p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='text-base font-bold text-[#a7f950]'>
                  {prize.amount} {prize.currency || 'USDC'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {remainingPrizes.length > 0 && (
        <div className='w-full pt-8'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/10'>
                  <th className='text-primary px-4 py-3 text-left text-sm font-bold'>
                    POSITION
                  </th>
                  <th className='text-primary px-4 py-3 text-left text-sm font-bold'>
                    PRIZE AMOUNT
                  </th>
                  <th className='text-primary px-4 py-3 text-left text-sm font-bold'>
                    CURRENCY
                  </th>
                </tr>
              </thead>
              <tbody>
                {remainingPrizes.map((prize, index) => (
                  <tr
                    key={index}
                    className='border-b border-white/10 transition-colors hover:bg-white/5'
                  >
                    <td className='px-4 py-4 text-left text-sm text-white'>
                      {prize.position}
                    </td>
                    <td className='px-4 py-4 text-left text-sm text-white/70'>
                      {prize.amount}
                    </td>
                    <td className='px-4 py-4 text-left text-sm text-white/70'>
                      {prize.currency || 'USDC'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
