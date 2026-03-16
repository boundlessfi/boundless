import React from 'react';
import Logo from './Logo';
import TitleAndInfo from './TitleAndInfo';
import ActionButtons from './ActionButtons';
import type { Hackathon } from '@/lib/api/hackathons';

interface HeaderProps {
  hackathon: Hackathon;
}

const Header = ({ hackathon }: HeaderProps) => {
  return (
    <div className='flex w-full flex-col gap-6 px-4 py-6 md:flex-row md:items-start md:justify-between md:px-16 md:py-10'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
        <Logo logo={hackathon.banner || ''} title={hackathon.name} />
        <TitleAndInfo
          title={hackathon.name}
          status={hackathon.status}
          participantType={hackathon.participantType}
          participantCount={hackathon._count.participants ?? 0}
          venueType={hackathon.venueType}
          participants={hackathon.participants}
          submissionDeadline={hackathon.submissionDeadline}
          submissionDeadlineOriginal={hackathon.submissionDeadlineOriginal}
        />
      </div>
      <div className='mt-2 md:mt-0'>
        <ActionButtons />
      </div>
    </div>
  );
};

export default Header;
