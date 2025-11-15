'use client';

import React from 'react';
import { MessageSquare, ThumbsUp, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  reactions?: {
    thumbsUp?: number;
    heart?: number;
  };
}

interface SubmissionCommentsTabProps {
  commentsList?: Comment[];
}

export const SubmissionCommentsTab: React.FC<SubmissionCommentsTabProps> = ({
  commentsList,
}) => {
  return (
    <ScrollArea className='h-3/5 pr-4'>
      <div className='space-y-4'>
        {commentsList && commentsList.length > 0 ? (
          commentsList.map(comment => (
            <div
              key={comment.id}
              className='flex gap-3 rounded-lg border border-gray-800 p-4 transition-colors hover:bg-gray-900/30'
            >
              <Avatar className='h-10 w-10 flex-shrink-0'>
                <AvatarImage
                  src={comment.author.avatar}
                  alt={comment.author.name}
                />
                <AvatarFallback>
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <p className='text-sm font-medium text-white'>
                    {comment.author.name}
                  </p>
                  <p className='text-xs text-gray-400'>
                    @{comment.author.username}
                  </p>
                  <span className='text-xs text-gray-500'>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className='text-sm break-words whitespace-pre-wrap text-gray-300'>
                  {comment.content}
                </p>
                {comment.reactions && (
                  <div className='mt-2 flex items-center gap-4'>
                    {comment.reactions.thumbsUp !== undefined &&
                      comment.reactions.thumbsUp > 0 && (
                        <div className='flex items-center gap-1 text-xs text-gray-400'>
                          <ThumbsUp className='h-3 w-3' />
                          <span>{comment.reactions.thumbsUp}</span>
                        </div>
                      )}
                    {comment.reactions.heart !== undefined &&
                      comment.reactions.heart > 0 && (
                        <div className='flex items-center gap-1 text-xs text-gray-400'>
                          <Heart className='h-3 w-3' />
                          <span>{comment.reactions.heart}</span>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='py-12 text-center'>
            <MessageSquare className='mx-auto mb-4 h-12 w-12 text-gray-600' />
            <p className='text-sm text-gray-400'>No comments yet</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
