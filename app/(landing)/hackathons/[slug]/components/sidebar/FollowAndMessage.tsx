'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MessageSquare, UserPlus, Check, AlertCircle } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useFollow } from '@/hooks/use-follow';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function FollowAndMessage() {
  const { currentHackathon: hackathon } = useHackathonData();
  const hackathonLoading = !hackathon;
  const hackathonError = false; // Handled by parent

  const org = hackathon?.organization;
  const orgName = org?.name ?? 'Organization';
  const orgLogo = org?.logo ?? '';
  const orgHandle = org?.name
    ? `@${org.name.toLowerCase().replace(/\s+/g, '_')}`
    : '@organization';

  const {
    isFollowing,
    isLoading: followLoading,
    toggleFollow,
  } = useFollow('ORGANIZATION', org?.id || '', false);

  const handleToggleFollow = async () => {
    try {
      await toggleFollow();
      toast.success(
        isFollowing ? `Unfollowed ${orgName}` : `Following ${orgName}`
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  if (hackathonLoading) {
    return (
      <div className='mt-4 space-y-6 overflow-hidden rounded-2xl border border-white/5 bg-[#1C1D1B] p-5'>
        <Skeleton className='h-4 w-20' />
        <div className='flex items-center gap-4'>
          <Skeleton className='h-14 w-14 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 flex-1 rounded-xl' />
          <Skeleton className='h-10 flex-1 rounded-xl' />
        </div>
      </div>
    );
  }

  if (hackathonError || !org) {
    return (
      <div className='mt-4 flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
        <AlertCircle className='mb-3 h-8 w-8 text-red-500' />
        <h3 className='text-sm font-bold text-white'>
          Organizer information unavailable
        </h3>
      </div>
    );
  }

  return (
    <div className='mt-4 overflow-hidden rounded-2xl border border-white/5 bg-linear-to-b from-[#1C1D1B] to-[#07090E]'>
      <div className='border-b border-white/5 px-5 py-3'>
        <p className='text-[10px] font-semibold tracking-widest text-gray-500 uppercase'>
          Organizer
        </p>
      </div>

      <div className='px-5 py-4'>
        <div className='mb-5 flex items-center gap-4'>
          <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5'>
            {orgLogo ? (
              <Image
                src={orgLogo}
                alt={orgName}
                fill
                className='object-cover'
              />
            ) : (
              <svg
                viewBox='0 0 56 56'
                className='h-full w-full p-3'
                fill='none'
              >
                <circle cx='28' cy='28' r='4' fill='#7bc67e' />
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x2 = 28 + 14 * Math.cos(rad);
                  const y2 = 28 + 14 * Math.sin(rad);
                  return (
                    <g key={i}>
                      <line
                        x1='28'
                        y1='28'
                        x2={x2}
                        y2={y2}
                        stroke='#7bc67e'
                        strokeWidth='1.5'
                      />
                      <circle cx={x2} cy={y2} r='2.5' fill='#7bc67e' />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
          <div className='min-w-0'>
            <p className='truncate text-base font-bold text-white'>{orgName}</p>
            <p className='truncate text-sm text-gray-500'>{orgHandle}</p>
          </div>
        </div>

        <div className='flex gap-3'>
          <BoundlessButton
            fullWidth
            variant={isFollowing ? 'outline' : 'default'}
            state={isFollowing ? 'success' : 'default'}
            loading={followLoading}
            icon={
              isFollowing ? (
                <Check className='h-4 w-4' />
              ) : (
                <UserPlus className='h-4 w-4' />
              )
            }
            iconPosition='left'
            onClick={handleToggleFollow}
            disabled={followLoading}
            className={
              isFollowing
                ? 'border-primary/40 bg-primary/10 text-primary cursor-default opacity-80'
                : ''
            }
          >
            {isFollowing ? 'Following' : 'Follow'}
          </BoundlessButton>
          <BoundlessButton
            fullWidth
            variant='outline'
            icon={<MessageSquare className='h-4 w-4' />}
            iconPosition='left'
          >
            Message
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
}
