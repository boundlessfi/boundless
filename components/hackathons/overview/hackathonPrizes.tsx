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
          <div className='mb-4 inline-flex items-center justify-start gap-2 rounded-full border border-[#a7f950]/20 bg-gradient-to-r from-[#a7f950]/10 to-[#a7f950]/5 px-4 py-2'>
            <Trophy className='h-4 w-4 text-[#a7f950]' />
            <span className='text-sm font-medium text-[#a7f950]'>Prizes</span>
          </div>
        </div>
        <h2 className='mb-3 text-left text-3xl font-bold tracking-tight text-white md:text-4xl'>
          {title}
        </h2>
        <div className='relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-[#a7f950]/30'>
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
              <span className='text-xs font-medium text-[#a7f950]'>
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
              className='group relative overflow-hidden rounded-lg border border-[#a7f950]/30 bg-gradient-to-br from-[#a7f950]/10 to-transparent p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#a7f950]/50 hover:shadow-lg hover:shadow-[#a7f950]/10'
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
              <div className='absolute inset-0 bg-gradient-to-br from-[#a7f950]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

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
                      {prize.position}
                    </h3>
                    <p className='text-xs text-gray-400'>{prize.position}</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='text-lg font-bold text-[#a7f950] transition-colors duration-300 group-hover:text-[#a7f950]'>
                    {prize.amount} {prize.currency || 'USDC'}
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
                    <th className='px-4 py-3 text-left text-sm font-bold text-[#a7f950]'>
                      POSITION
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-bold text-[#a7f950]'>
                      PRIZE AMOUNT
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-bold text-[#a7f950]'>
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
                        {prize.position}
                      </td>
                      <td className='px-4 py-4 text-left text-sm text-white/90'>
                        {prize.amount}
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
