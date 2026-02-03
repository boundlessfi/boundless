import { useState } from 'react';
import Empty from './Empty';
import Image from 'next/image';
import { Contributor, Crowdfunding } from '@/features/projects/types';

const ProjectBackers = ({ crowdfund }: { crowdfund: Crowdfunding }) => {
  const [backers] = useState<Contributor[]>(
    crowdfund.contributors as Contributor[]
  );
  const handleBackerClick = (backer: Contributor) => {
    window.open(`/profile/${backer.userId}`, '_blank');
  };

  if (backers.length === 0) {
    return (
      <Empty
        campaignId={crowdfund.id}
        escrowAddress={crowdfund.escrowAddress}
        fundingGoal={crowdfund.fundingGoal}
        fundingRaised={crowdfund.fundingRaised}
        projectTitle={crowdfund.project.title}
      />
    );
  }
  return (
    <div>
      {backers.map(backer => (
        <div
          key={backer.userId}
          className='flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors hover:bg-gray-900/30'
          onClick={() => handleBackerClick(backer)}
        >
          <div className='flex items-center space-x-4'>
            {/* Avatar */}
            <div className='relative'>
              <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                {backer.userId ? (
                  <Image
                    width={48}
                    height={48}
                    src={backer.image || '/avatar.png'}
                    alt={backer.name || 'Default avatar'}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <Image
                    width={48}
                    height={48}
                    src='/avatar.png'
                    alt='Default avatar'
                    className='h-full w-full object-cover'
                  />
                )}
              </div>
            </div>

            {/* Backer Info */}
            <div className='flex flex-col space-y-0.5'>
              <span className='text-base font-normal text-white'>
                {backer.name}{' '}
                <span className='text-xs text-gray-500 italic'>
                  @{backer.username}
                </span>
              </span>
              <span className={`truncate text-sm text-gray-500`}>
                ${backer.amount}
              </span>
            </div>
          </div>

          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M7.5 15L12.5 10L7.5 5'
              stroke='white'
              strokeWidth='1.4'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default ProjectBackers;
