'use client';

import React, { useState } from 'react';
import { ArrowUp, ThumbsUp, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BoundlessButton } from '@/components/buttons';
import Image from 'next/image';

interface SubmissionCardProps {
  title: string;
  description: string;
  submitterName: string;
  submitterAvatar?: string;
  category?: string;
  categories?: string[];
  status?: 'Pending' | 'Approved' | 'Rejected';
  upvotes?: number;
  votes?: { current: number; total: number };
  comments?: number;
  submittedDate?: string;
  daysLeft?: number;
  score?: number;
  image?: string;
  submissionId?: string;
  onViewClick?: () => void;
  onUpvoteClick?: () => void;
  onCommentClick?: () => void;
  hasUserUpvoted?: boolean;
}

const SubmissionCard = ({
  title,
  description,
  submitterName,
  submitterAvatar,
  category,
  categories = [],
  status = 'Pending',
  upvotes = 0,
  votes,
  comments = 0,
  submittedDate,
  image = '/placeholder.svg',
  onViewClick,
  onUpvoteClick,
  onCommentClick,
  hasUserUpvoted = false,
}: SubmissionCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState(hasUserUpvoted ? 1 : 0);
  const [currentUpvotes, setCurrentUpvotes] = useState(
    votes?.current || upvotes
  );

  // Combine category and categories
  const allCategories = category ? [category, ...categories] : categories;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting) return;

    setIsVoting(true);

    if (userVote === 1) {
      setUserVote(0);
      setCurrentUpvotes(prev => prev - 1);
    } else {
      setUserVote(1);
      setCurrentUpvotes(prev => prev + 1);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setIsVoting(false);

    onUpvoteClick?.();
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick?.();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onViewClick}
      className='group hover:border-primary/45 mx-auto w-full max-w-[397px] cursor-pointer overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#030303] p-4 transition-all sm:p-5'
    >
      {/* Header with Avatar and Status */}
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <div className='flex items-center gap-2'>
          <div
            style={{ backgroundImage: `url(${submitterAvatar})` }}
            className='size-6 rounded-full bg-white bg-cover bg-center'
          ></div>
          <h4 className='text-sm font-normal text-gray-500'>{submitterName}</h4>
        </div>
        {/* <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='group/avatar inline-flex cursor-pointer items-center gap-2'>
                <div className='relative flex-shrink-0'>
                  <Avatar className='h-10 w-10 border-2 border-[#2B2B2B] transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:border-[#A7F950] sm:h-12 sm:w-12'>
                    <AvatarImage
                      src={submitterAvatar}
                      alt={submitterName}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-gray-700 text-white'>
                      {submitterName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className='max-w-24 truncate text-xs font-medium text-gray-300 transition-colors group-hover/avatar:text-[#A7F950] sm:max-w-none sm:text-sm'>
                  {submitterName}
                </span>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider> */}

        <Badge
          className={`flex-shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
            status === 'Approved'
              ? 'border-[#A7F950] bg-[#E5FFE5] text-[#4E9E00]'
              : status === 'Rejected'
                ? 'border-[#FF5757] bg-[#FFEAEA] text-[#D33]'
                : 'border-[#645D5D] bg-[#E4DBDB] text-[#645D5D]'
          }`}
        >
          {status}
        </Badge>
      </div>

      {/* Categories */}
      {allCategories.length > 0 && (
        <div className='mb-3 flex flex-wrap gap-1.5'>
          {allCategories.slice(0, 3).map((cat, idx) => (
            <Badge
              key={idx}
              className='flex-shrink-0 rounded-[4px] border border-[#645D5D] bg-[#E4DBDB] px-2 py-0.5 text-xs font-medium text-[#645D5D]'
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Body - Image and Content */}
      <div className='mb-3 flex items-start space-x-3 sm:mb-4 sm:space-x-4'>
        <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-[90px] sm:w-[80px]'>
          <Image
            src={image}
            alt={title}
            width={200}
            height={200}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </div>

        <div className='min-w-0 flex-1 text-left'>
          <h3 className='mb-2 line-clamp-1 text-base font-bold text-white sm:text-lg'>
            {title}
          </h3>
          <p className='line-clamp-2 text-left text-xs leading-relaxed text-gray-300 sm:line-clamp-3 sm:text-sm'>
            {description}
          </p>
        </div>
      </div>

      {/* Footer - Interaction Buttons and Date */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>
            Submitted: {submittedDate ? formatDate(submittedDate) : 'Recently'}
          </span>
          {/* {score && <span className="text-[#A7F950]">Score: {score}</span>} */}
        </div>

        <div className='flex items-center gap-2'>
          {/* Upvote Button */}
          <BoundlessButton
            onClick={handleUpvote}
            disabled={isVoting}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
              userVote === 1
                ? 'border-primary/20 bg-primary/10 text-primary border'
                : 'bg-[#A7F950] text-black hover:bg-[#A7F950]'
            }`}
          >
            {userVote === 1 ? (
              <ThumbsUp className='h-5 w-5' fill='currentColor' />
            ) : (
              <ArrowUp className='h-5 w-5' />
            )}
            <span>
              {isVoting ? 'Voting...' : userVote === 1 ? 'Upvoted' : 'Upvote'}
            </span>
            <span className='ml-1 text-sm font-bold'>{currentUpvotes}</span>
          </BoundlessButton>

          {/* Comment Button */}
          <Button
            onClick={handleCommentClick}
            variant='outline'
            className='flex h-12 items-center gap-2 rounded-lg border-[#2B2B2B] bg-[#030303] px-4 text-base font-medium text-white hover:border-white hover:bg-transparent hover:text-white'
          >
            <MessageCircle className='h-5 w-5' />
            <span>{comments}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SubmissionCard;
