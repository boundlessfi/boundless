import React from 'react';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { ArrowUpIcon } from 'lucide-react';
import LottieAnimation from '@/components/LottieAnimation';

interface EmptyProps {
  projectStatus: string;
  onVote?: () => void;
}

const Empty = ({ onVote }: EmptyProps) => {
  return (
    <div className='mx-auto w-full max-w-[400px] space-y-5 py-5 text-center'>
      <LottieAnimation />
      <div className='space-y-1'>
        <h3 className='text-center text-base font-medium text-white md:text-lg'>
          Cast the First Vote!
        </h3>
        <p className='text-center text-gray-500'>
          Be the first to vote on this project.
        </p>
      </div>
      <BoundlessButton
        onClick={onVote}
        iconPosition='left'
        size='lg'
        icon={<ArrowUpIcon />}
      >
        Upvote
      </BoundlessButton>
    </div>
  );
};

export default Empty;
