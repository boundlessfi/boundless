'use client';

import { useState } from 'react';
import {
  Heart,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Flag,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CommentInput } from './comment-input';
import { ProjectComment } from '@/types/comment';

interface CommentItemProps {
  comment: ProjectComment;
  isReply?: boolean;
  onAddReply: (commentId: string, content: string) => void;
  onUpdate?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string, reason: string, description?: string) => void;
  currentUserId?: string;
  isRegistered?: boolean;
}

export function CommentItem({
  comment,
  isReply = false,
  onAddReply,
  onUpdate,
  onDelete,
  onReport,
  currentUserId,
  isRegistered = false,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');

  const hasReplies =
    (comment.replies && comment.replies.length > 0) || comment.replyCount > 0;
  const isOwner = currentUserId === comment.userId._id;
  const canEdit = isOwner && comment.status === 'active';
  const canDelete = isOwner;

  const handleReplySubmit = (content: string) => {
    onAddReply(comment._id, content);
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content && onUpdate) {
      onUpdate(comment._id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm('Are you sure you want to delete this comment?') &&
      onDelete
    ) {
      onDelete(comment._id);
    }
  };

  const handleReport = () => {
    if (reportReason && onReport) {
      onReport(comment._id, reportReason, reportDescription);
      setShowReportForm(false);
      setReportReason('');
      setReportDescription('');
    }
  };

  return (
    <div className={cn('flex gap-3', isReply && 'ml-12 md:ml-14')}>
      <Avatar className='size-8 shrink-0 md:size-10'>
        <AvatarImage
          src={comment.userId.profile.avatar || '/user-icon.png'}
          alt={comment.userId.profile.username}
        />
        <AvatarFallback>{comment.userId.profile.firstName[0]}</AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <button className='text-sm font-medium text-white underline-offset-2 hover:underline'>
                {comment.userId.profile.firstName}{' '}
                {comment.userId.profile.lastName}
              </button>
              <span className='text-xs text-zinc-400'>
                @{comment.userId.profile.username}
              </span>
              <span className='text-xs text-zinc-400'>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {comment.status === 'flagged' && (
                <span className='inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800'>
                  Under Review
                </span>
              )}
            </div>

            {isEditing ? (
              <div className='mt-2'>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className='w-full resize-none rounded-md border border-gray-300 bg-gray-900 p-2 text-white'
                  rows={3}
                  maxLength={2000}
                />
                <div className='mt-2 flex space-x-2'>
                  <Button
                    onClick={handleEdit}
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    variant='outline'
                    size='sm'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className='mt-1 text-sm break-words whitespace-pre-wrap text-white md:text-base'>
                {comment.content}
              </p>
            )}

            {comment.editHistory.length > 0 && (
              <p className='mt-1 text-xs text-zinc-400'>
                Edited {comment.editHistory.length} time(s)
              </p>
            )}
          </div>
        </div>

        <div className='mt-2 flex items-center gap-4'>
          <span className='text-xs text-zinc-400 md:text-sm'>
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {isRegistered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowReplyInput(!showReplyInput)}
              className='h-auto p-0 text-xs text-zinc-400 hover:bg-transparent hover:text-white md:text-sm'
            >
              Reply
            </Button>
          )}
          {canEdit && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsEditing(true)}
              className='h-auto p-0 text-xs text-zinc-400 hover:bg-transparent hover:text-white md:text-sm'
            >
              <Edit className='mr-1 size-3' />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleDelete}
              className='h-auto p-0 text-xs text-red-400 hover:bg-transparent hover:text-red-300 md:text-sm'
            >
              <Trash2 className='mr-1 size-3' />
              Delete
            </Button>
          )}
          {!isOwner && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowReportForm(!showReportForm)}
              className='h-auto p-0 text-xs text-orange-400 hover:bg-transparent hover:text-orange-300 md:text-sm'
            >
              <Flag className='mr-1 size-3' />
              Report
            </Button>
          )}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className='group flex items-center gap-1.5'
          >
            <Heart
              className={cn(
                'size-4 transition-colors',
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-zinc-400 group-hover:text-white'
              )}
            />
            <span className='text-xs text-zinc-400 group-hover:text-white md:text-sm'>
              {comment.totalReactions}
            </span>
          </button>
        </div>

        {showReplyInput && (
          <div className='mt-3 -ml-12 md:-ml-14'>
            <CommentInput
              onSubmit={handleReplySubmit}
              placeholder='Write a reply...'
              autoFocus
              onCancel={() => setShowReplyInput(false)}
              showCancel
            />
          </div>
        )}

        {showReportForm && (
          <div className='mt-3 rounded-md bg-gray-50 p-3'>
            <h4 className='mb-2 text-sm font-medium text-gray-900'>
              Report Comment
            </h4>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className='w-full rounded-md border border-gray-300 p-2 text-sm'
            >
              <option value=''>Select a reason</option>
              <option value='spam'>Spam</option>
              <option value='inappropriate'>Inappropriate Content</option>
              <option value='harassment'>Harassment</option>
              <option value='misinformation'>Misinformation</option>
              <option value='other'>Other</option>
            </select>
            <textarea
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              placeholder='Additional details (optional)'
              className='mt-2 w-full resize-none rounded-md border border-gray-300 p-2 text-sm'
              rows={2}
              maxLength={500}
            />
            <div className='mt-2 flex space-x-2'>
              <Button
                onClick={handleReport}
                disabled={!reportReason}
                size='sm'
                className='bg-orange-600 hover:bg-orange-700 disabled:opacity-50'
              >
                Submit Report
              </Button>
              <Button
                onClick={() => setShowReportForm(false)}
                variant='outline'
                size='sm'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {hasReplies && (
          <>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className='mt-3 flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-white md:text-sm'
            >
              <div className='h-px w-8 bg-zinc-700 md:w-12' />
              <span>
                {showReplies ? 'Hide' : 'Show'} replies (
                {comment.replies?.length || comment.replyCount})
              </span>
              {showReplies ? (
                <ChevronUp className='size-3.5' />
              ) : (
                <ChevronDown className='size-3.5' />
              )}
            </button>

            {showReplies && comment.replies && comment.replies.length > 0 && (
              <div className='mt-4 space-y-4'>
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    isReply
                    onAddReply={onAddReply}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReport={onReport}
                    currentUserId={currentUserId}
                    isRegistered={isRegistered}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
