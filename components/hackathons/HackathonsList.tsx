'use client';

import React from 'react';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import type { Hackathon } from '@/lib/api/hackathons';

interface HackathonsListProps {
  hackathons: Hackathon[];
  className?: string;
}

const HackathonsList = ({ hackathons, className }: HackathonsListProps) => {
  if (hackathons.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className='flex flex-col gap-4'>
        {hackathons.map(hackathon => {
          return (
            <HackathonCard
              key={hackathon.id}
              isFullWidth={true}
              {...hackathon}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HackathonsList;
