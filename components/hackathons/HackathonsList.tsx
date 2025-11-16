'use client';

import React from 'react';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import type { Hackathon } from '@/lib/api/hackathons';
import { useHackathonTransform } from '@/hooks/hackathon/use-hackathon-transform';

interface HackathonsListProps {
  hackathons: Hackathon[];
  className?: string;
}

const HackathonsList = ({ hackathons, className }: HackathonsListProps) => {
  const { transformHackathonForCard } = useHackathonTransform();

  if (hackathons.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className='flex flex-col gap-4'>
        {hackathons.map(hackathon => {
          const orgName =
            '_organizationName' in hackathon
              ? (hackathon as Hackathon & { _organizationName?: string })
                  ._organizationName
              : undefined;
          const transformed = transformHackathonForCard(hackathon, orgName);
          return (
            <HackathonCard
              key={hackathon._id}
              isListView={true}
              isFullWidth={true}
              {...transformed}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HackathonsList;
