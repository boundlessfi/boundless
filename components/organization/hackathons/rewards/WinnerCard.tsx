'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import Ribbon from '@/components/svg/Ribbon';
import { getRibbonColors, getRibbonText } from './winnersUtils';

interface WinnerCardProps {
  rank: number;
  winner?: Submission;
  prizeAmount: string;
  currency: string;
  maxRank: number;
}

export default function WinnerCard({
  rank,
  winner,
  prizeAmount,
  currency,
  maxRank,
}: WinnerCardProps) {
  const getScaleClass = () => {
    if (maxRank <= 3) {
      if (rank === 1) return 'md:scale-110';
      if (rank === 2 || rank === 3) return 'md:scale-95';
    } else {
      if (rank === 1) return 'md:scale-105';
    }
    return '';
  };

  return (
    <div
      className={cn(
        'bg-background-card relative w-fit overflow-hidden rounded-lg p-6 transition-transform',
        getScaleClass()
      )}
    >
      <div className='mb-4 flex items-center justify-center gap-2'>
        <Image
          src='/trophy.svg'
          alt='Trophy'
          width={20}
          height={20}
          className='h-5 w-5 text-yellow-400'
        />
        <span className='text-primary text-lg font-medium'>
          ${prizeAmount} {currency}
        </span>
      </div>

      <div className='mb-4 flex justify-center'>
        <Avatar className='h-24 w-24'>
          {winner ? (
            <>
              <AvatarImage
                src={winner.avatar || 'https://github.com/shadcn.png'}
              />
              <AvatarFallback>
                {winner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className='text-3xl text-gray-500'>
              ?
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className='relative mb-4 flex items-center justify-center'>
        <Ribbon
          primaryColor={getRibbonColors(rank).primaryColor}
          secondaryColor={getRibbonColors(rank).secondaryColor}
        />
        <span className='absolute inset-0 -bottom-3 flex items-center justify-center text-[12px] font-black text-white'>
          {getRibbonText(rank)}
        </span>
      </div>

      <div className='mb-4 text-center'>
        <h3 className='text-sm text-white'>{winner?.name || '?'}</h3>
      </div>

      {winner && (
        <div className='flex items-center justify-between rounded-lg border border-gray-900 p-2'>
          <div className='grid grid-cols-[44px_1fr] grid-rows-2 gap-x-2'>
            <div className='row-span-2 h-11 w-11 overflow-hidden rounded'>
              <Image
                src='/bitmed.png'
                alt={winner.projectName}
                width={44}
                height={44}
                className='h-full w-full object-cover'
              />
            </div>
            <div className='flex items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='line-clamp-1 cursor-help text-sm font-medium text-white'>
                    {winner.projectName}
                  </p>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs'>
                  <p className='break-words'>{winner.projectName}</p>
                </TooltipContent>
              </Tooltip>
              <Badge className='bg-office-brown border-office-brown-darker text-office-brown-darker rounded-[4px] border px-1 py-0.5 text-xs font-medium'>
                Category
              </Badge>
            </div>
            <div className='flex items-center gap-3 text-xs text-gray-500'>
              <span>{winner.score} Votes</span>
              <div className='h-3 w-px bg-gray-900' />
              <span>1k+ Comments</span>
              <ArrowUpRight className='h-4 w-4' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
