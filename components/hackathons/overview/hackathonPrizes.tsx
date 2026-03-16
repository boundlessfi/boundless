'use client';

import { PrizeTier } from '@/lib/api/hackathons';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

interface HackathonPrizesProps {
  title?: string;
  totalPrizePool?: string;
  otherPrizes?: string;
  prizes: PrizeTier[];
}

export function HackathonPrizes({
  title = 'Prize Tiers',
  totalPrizePool,
  otherPrizes,
  prizes,
}: HackathonPrizesProps) {
  const firstThreePrizes = prizes.slice(0, 3);
  const remainingPrizes = prizes.slice(3);

  return (
    <div className='space-y-6 py-8'>
      <div>
        <div className='flex justify-start'>
          <div className='border-primary/20 from-primary/10 to-primary/5 mb-4 inline-flex items-center justify-start gap-2 rounded-full border bg-gradient-to-r px-4 py-2'>
            <Trophy className='text-primary h-4 w-4' />
            <span className='text-primary text-sm font-medium'>Prizes</span>
          </div>
        </div>
        <h2 className='mb-3 text-left text-3xl font-bold tracking-tight text-white md:text-4xl'>
          {title}
        </h2>
        <div className='hover:border-primary/30 relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300'>
          {/* Wave background */}
          <div className='absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-lg opacity-5'>
            <Image
              src='/wave.svg'
              alt=''
              fill
              className='object-cover object-bottom-right'
              priority={false}
            />
          </div>
          <div className='relative z-10 flex items-center justify-between'>
            <span className='text-sm font-semibold text-white'>
              {totalPrizePool} USDC
            </span>
            {otherPrizes && (
              <span className='text-primary text-xs font-medium'>
                + {otherPrizes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* First 3 prizes in cards */}
      {firstThreePrizes.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {firstThreePrizes.map((prize, index) => (
            <div
              key={index}
              className='group border-primary/30 from-primary/10 hover:border-primary/50 hover:shadow-primary/10 relative overflow-hidden rounded-lg border bg-gradient-to-br to-transparent p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              {/* Wave background */}
              <div className='absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-lg opacity-5'>
                <Image
                  src='/wave.svg'
                  alt=''
                  fill
                  className='object-cover object-bottom-right'
                  priority={false}
                />
              </div>

              {/* Animated background gradient on hover */}
              <div className='from-primary/20 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

              <div className='relative z-10'>
                <div className='mb-4 flex items-start gap-3'>
                  <span className='text-2xl transition-transform duration-300 group-hover:scale-110'>
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
                      {prize.place}
                    </h3>
                    <p className='text-xs text-gray-400'>{prize.place}</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='text-primary group-hover:text-primary text-lg font-bold transition-colors duration-300'>
                    {prize.prizeAmount} {prize.currency || 'USDC'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {remainingPrizes.length > 0 && (
        <div className='w-full pt-8'>
          <div className='relative overflow-hidden rounded-lg border border-white/10 bg-white/5'>
            {/* Wave background */}
            <div className='absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-lg opacity-5'>
              <Image
                src='/wave.svg'
                alt=''
                fill
                className='object-cover object-bottom-right'
                priority={false}
              />
            </div>
            <div className='relative z-10 overflow-x-auto'>
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
                      <td className='px-4 py-4 text-left text-sm font-medium text-white'>
                        {prize.place}
                      </td>
                      <td className='px-4 py-4 text-left text-sm text-white/90'>
                        {prize.prizeAmount}
                      </td>
                      <td className='px-4 py-4 text-left text-sm text-white/90'>
                        {prize.currency || 'USDC'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
