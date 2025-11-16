import React, { useMemo } from 'react';
import Empty from './Empty';
import Image from 'next/image';
import { CrowdfundingProject } from '@/lib/api/types';

interface Voter {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    avatar?: string;
  };
  voteType?: 'positive' | 'negative';
  votedAt?: string;
}

interface ProjectVotersProps {
  project?: CrowdfundingProject;
}

const ProjectVoters = ({ project }: ProjectVotersProps) => {
  const voters: Voter[] = useMemo(() => {
    if (!project?.voting?.voters || project.voting.voters.length === 0) {
      return [];
    }

    // Debug: Log the raw voter data to understand the structure

    return project.voting.voters.map(
      (voter: {
        _id?: string;
        userId?:
          | {
              _id?: string;
              profile?: {
                firstName?: string;
                lastName?: string;
                username?: string;
                bio?: string;
                avatar?: string;
              };
              firstName?: string;
              lastName?: string;
              username?: string;
              bio?: string;
              avatar?: string;
            }
          | string;
        vote?: string | number;
        votedAt?: string;
        createdAt?: string;
      }) => {
        // Handle both userId as object and string cases
        const userData = typeof voter.userId === 'object' ? voter.userId : null;
        const userIdString =
          typeof voter.userId === 'string' ? voter.userId : userData?._id || '';

        return {
          _id: voter._id || userIdString,
          profile: {
            firstName:
              userData?.profile?.firstName || userData?.firstName || 'Unknown',
            lastName:
              userData?.profile?.lastName || userData?.lastName || 'User',
            username:
              userData?.profile?.username ||
              userData?.username ||
              'unknown_user',
            bio: userData?.profile?.bio || userData?.bio || 'Project supporter',
            avatar: userData?.profile?.avatar || userData?.avatar,
          },
          voteType:
            voter.vote === 'positive' || voter.vote === 1
              ? 'positive'
              : 'negative',
          votedAt: voter.votedAt || voter.createdAt,
        };
      }
    );
  }, [project?.voting?.voters]);

  const handleVoterClick = (voter: Voter) => {
    // TODO: Navigate to voter profile or show voter details
    // Could implement navigation to user profile page
    window.open(`/profile/${voter.profile.username}`, '_blank');
  };
  if (voters.length === 0) {
    return <Empty projectStatus={project?.status ?? ''} />;
  }
  return (
    <div>
      {voters.map(voter => (
        <div
          key={voter._id}
          className='flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors hover:bg-gray-900/30'
          onClick={() => handleVoterClick(voter)}
        >
          <div className='flex items-center space-x-4'>
            {/* Avatar */}
            <div className='relative'>
              <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
                {voter.profile.avatar ? (
                  <Image
                    width={48}
                    height={48}
                    src={voter.profile.avatar}
                    alt={voter.profile.firstName}
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

            {/* Member Info */}
            <div className='flex flex-col space-y-0.5'>
              <span className='text-base font-normal text-white'>
                {voter.profile.firstName} {voter.profile.lastName}
              </span>
              <span className={`truncate text-sm text-gray-500`}>
                {voter.profile.bio}
              </span>
            </div>
          </div>

          {/* Chevron */}
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

export default ProjectVoters;
