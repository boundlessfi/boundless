'use client';

import React from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Pin,
  MoreHorizontal,
  Edit,
  Trash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BoundlessButton } from '@/components/buttons';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useSubmissionVote } from '@/hooks/hackathon/use-submission-vote';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  hasUserUpvoted?: boolean;
  isPinned?: boolean;
  isMySubmission?: boolean;
  isDeadlinePassed?: boolean;
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
  submissionId,
  onViewClick,
  onUpvoteClick,
  onCommentClick,
  onEditClick,
  onDeleteClick,
  hasUserUpvoted = false,
  isPinned = false,
  isMySubmission = false,
  isDeadlinePassed = false,
}: SubmissionCardProps) => {
  const router = useRouter();

  // Use custom hook for vote management
  const {
    voteCount,
    hasVoted,
    isLoading: isVoting,
    toggleVote,
  } = useSubmissionVote(submissionId || '');

  // Use hook data if submissionId is provided, otherwise fall back to props
  const currentUpvotes = submissionId ? voteCount : votes?.current || upvotes;
  const userHasVoted = submissionId ? hasVoted : hasUserUpvoted;

  // Combine category and categories
  const allCategories = category ? [category, ...categories] : categories;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting || !submissionId) return;

    try {
      await toggleVote();
      onUpvoteClick?.();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submissionId) {
      router.push(`/projects/${submissionId}?type=submission&tab=comments`);
    }
    onCommentClick?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick?.();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div
      onClick={onViewClick}
      className={`group hover:border-primary/45 mx-auto w-full max-w-[397px] cursor-pointer overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#030303] p-4 transition-all sm:p-5 ${onViewClick ? 'hover:border-[#A7F950]/50' : ''}`}
    >
      {isPinned && (
        <div className='mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#A7F950]'>
          <Pin className='h-3.5 w-3.5 fill-[#A7F950]' />
          <span>Your Submission</span>
        </div>
      )}

      {/* Header with Avatar and Status */}
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <div className='flex items-center gap-2'>
          <div
            style={{ backgroundImage: `url(${submitterAvatar})` }}
            className={`size-8 rounded-full border-2 bg-white bg-cover bg-center ${isPinned ? 'border-[#A7F950]' : 'border-[#2B2B2B]'}`}
          ></div>
          <div className='flex flex-col'>
            <h4 className='text-sm font-medium text-white'>{submitterName}</h4>
            {/* We can add username here if we had it available in props */}
          </div>
        </div>

        <div className='flex items-center gap-2'>
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

          {isMySubmission && !isDeadlinePassed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='border-gray-800 bg-black text-white'
              >
                <DropdownMenuItem
                  onClick={handleEditClick}
                  className='cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-white'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Submission
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className='cursor-pointer text-red-500 focus:bg-red-900/20 focus:text-red-400'
                >
                  <Trash className='mr-2 h-4 w-4' />
                  Delete Submission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
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
              userHasVoted
                ? 'border-primary/20 bg-primary/10 text-primary border'
                : 'bg-[#A7F950] text-black hover:bg-[#A7F950]'
            }`}
          >
            <ThumbsUp
              className='h-5 w-5'
              fill={userHasVoted ? 'currentColor' : 'none'}
            />
            <span>
              {isVoting ? 'Voting...' : userHasVoted ? 'Upvoted' : 'Upvote'}
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
