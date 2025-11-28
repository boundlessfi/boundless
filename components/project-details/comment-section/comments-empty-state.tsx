'use client';

import { CommentInput } from './comment-input';
import LottieAnimation from '@/components/LottieAnimation';

interface CommentsEmptyStateProps {
  onAddComment: (content: string) => void;
  isRegistered?: boolean;
}

export function CommentsEmptyState({
  onAddComment,
  isRegistered = false,
}: CommentsEmptyStateProps) {
  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-col items-center justify-center px-4 py-16 md:py-20'>
        <div className='relative mb-8'>
          <LottieAnimation width={400} height={400} />
        </div>
        <h3 className='mb-8 text-center text-base font-medium text-white md:text-lg'>
          Be the first to Leave a Comment
        </h3>
      </div>
      {isRegistered ? (
        <CommentInput onSubmit={onAddComment} />
      ) : (
        <div className='rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-6 text-center md:px-6'>
          <p className='text-sm text-gray-400'>
            Register for this hackathon to start the discussion
          </p>
        </div>
      )}
    </div>
  );
}
