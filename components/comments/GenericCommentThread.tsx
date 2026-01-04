'use client';

import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Trash2,
  Edit,
  MoreHorizontal,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Flag,
  MessageCircle,
  EyeOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Comment,
  CommentEntityType,
  ReactionType,
  ReportReason,
  CommentStatus,
  UseCommentsReturn,
  UseCreateCommentReturn,
  UseUpdateCommentReturn,
  UseDeleteCommentReturn,
  UseReportCommentReturn,
  UseReactionsReturn,
} from '@/types/comment';
import { getReactionSummary } from '@/lib/utils/reactions';
import {
  validateCommentContent,
  sanitizeCommentContent,
} from '@/lib/utils/comment-validation';
import { useCommentRealtime } from '@/hooks/use-comment-realtime';
import { toast } from 'sonner';

interface GenericCommentThreadProps {
  entityType: CommentEntityType;
  entityId: string;
  currentUser?: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    isModerator?: boolean;
  };
  // Hook instances passed from parent
  commentsHook: UseCommentsReturn;
  createCommentHook: UseCreateCommentReturn;
  updateCommentHook: UseUpdateCommentReturn;
  deleteCommentHook: UseDeleteCommentReturn;
  reportCommentHook: UseReportCommentReturn;
  reactionsHook: UseReactionsReturn;
  // Optional customization
  maxDepth?: number;
  showReactions?: boolean;
  showReporting?: boolean;
  showModeration?: boolean;
  className?: string;
}

export function GenericCommentThread({
  entityType,
  entityId,
  currentUser,
  commentsHook,
  createCommentHook,
  updateCommentHook,
  deleteCommentHook,
  reportCommentHook,
  reactionsHook,
  //   maxDepth = 3,
  showReactions = true,
  showReporting = true,
  showModeration = currentUser?.isModerator,
  className,
}: GenericCommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [commentValidation, setCommentValidation] = useState({
    isValid: true,
    errors: [] as string[],
  });

  // Real-time updates
  const { isConnected } = useCommentRealtime(
    { entityType, entityId, userId: currentUser?.id, enabled: true },
    {
      onCommentCreated: () => {
        commentsHook.refetch();
        toast.success('New comment added');
      },
      onCommentUpdated: () => {
        commentsHook.refetch();
      },
      onCommentDeleted: () => {
        commentsHook.refetch();
      },
      onReactionAdded: () => {
        commentsHook.refetch();
      },
      onReactionRemoved: () => {
        commentsHook.refetch();
      },
      onCommentStatusChanged: () => {
        commentsHook.refetch();
      },
    }
  );

  const handleSubmitComment = async () => {
    const sanitizedContent = sanitizeCommentContent(newComment);
    const validation = validateCommentContent(sanitizedContent);

    setCommentValidation(validation);

    if (!validation.isValid) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await createCommentHook.createComment({
        content: sanitizedContent,
        entityType,
        entityId,
      });
      setNewComment('');
      setCommentValidation({ isValid: true, errors: [] });
      toast.success('Comment posted successfully');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleCommentValidation = (content: string) => {
    const sanitized = sanitizeCommentContent(content);
    const validation = validateCommentContent(sanitized);
    setCommentValidation(validation);
    return validation;
  };

  if (commentsHook.loading && commentsHook.comments.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className='mr-2 h-6 w-6 animate-spin' />
        <span>Loading comments...</span>
      </div>
    );
  }

  if (commentsHook.error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className='mb-4 text-red-600'>
          Error loading comments: {commentsHook.error}
        </p>
        <Button onClick={commentsHook.refetch} variant='outline'>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Connection Status */}
      {!isConnected && (
        <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3'>
          <div className='flex items-center'>
            <AlertTriangle className='mr-2 h-4 w-4 text-yellow-600' />
            <span className='text-sm text-yellow-800'>
              Real-time updates unavailable. Changes may not appear immediately.
            </span>
          </div>
        </div>
      )}

      {/* Comment Input */}
      <div className='space-y-3'>
        <h3 className='font-medium text-white'>Comments</h3>
        <div className='flex space-x-3'>
          <Avatar className='h-8 w-8 flex-shrink-0'>
            <AvatarImage src={currentUser?.image} />
            <AvatarFallback className='bg-blue-500 text-xs text-white'>
              {currentUser?.name.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-2'>
            <Textarea
              placeholder='Add a comment...'
              value={newComment}
              onChange={e => {
                setNewComment(e.target.value);
                handleCommentValidation(e.target.value);
              }}
              className={cn(
                'min-h-[80px] resize-none border-[#2B2B2B] bg-[#212121] text-white placeholder:text-[#B5B5B5]',
                !commentValidation.isValid && 'border-red-500'
              )}
            />
            {!commentValidation.isValid && (
              <div className='text-sm text-red-400'>
                {commentValidation.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            <div className='flex justify-end'>
              <Button
                onClick={handleSubmitComment}
                disabled={
                  !newComment.trim() ||
                  !commentValidation.isValid ||
                  createCommentHook.loading
                }
                className='bg-[#04326B] px-4 py-2 text-white hover:bg-[#034592] disabled:opacity-50'
              >
                {createCommentHook.loading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Send className='mr-2 h-4 w-4' />
                )}
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className='space-y-4'>
        {commentsHook.comments.length === 0 ? (
          <div className='py-12 text-center'>
            <MessageCircle className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-white'>
              No comments yet
            </h3>
            <p className='text-gray-400'>
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          commentsHook.comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onAddReply={async (parentId, content) => {
                try {
                  await createCommentHook.createComment({
                    content: sanitizeCommentContent(content),
                    parentId,
                    entityType,
                    entityId,
                  });
                  toast.success('Reply posted successfully');
                } catch {
                  toast.error('Failed to post reply');
                }
              }}
              onUpdate={async (commentId, content) => {
                try {
                  await updateCommentHook.updateComment(commentId, {
                    content: sanitizeCommentContent(content),
                  });
                  toast.success('Comment updated');
                } catch {
                  toast.error('Failed to update comment');
                }
              }}
              onDelete={async commentId => {
                try {
                  await deleteCommentHook.deleteComment(commentId);
                  toast.success('Comment deleted');
                } catch {
                  toast.error('Failed to delete comment');
                }
              }}
              onReport={async (commentId, reason, description) => {
                try {
                  await reportCommentHook.reportComment(commentId, {
                    reason,
                    description,
                  });
                  toast.success('Comment reported');
                } catch {
                  toast.error('Failed to report comment');
                }
              }}
              onReaction={async (commentId, reactionType) => {
                try {
                  await reactionsHook.addReaction(commentId, reactionType);
                } catch {
                  toast.error('Failed to add reaction');
                }
              }}
              onRemoveReaction={async (commentId, reactionType) => {
                try {
                  await reactionsHook.removeReaction(commentId, reactionType);
                } catch {
                  toast.error('Failed to remove reaction');
                }
              }}
              showReactions={showReactions}
              showReporting={showReporting}
              showModeration={showModeration}
              //   reactionsHook={reactionsHook}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {commentsHook.pagination.hasNext && (
        <div className='text-center'>
          <Button
            onClick={commentsHook.loadMore}
            disabled={commentsHook.loading}
            variant='outline'
            className='border-[#2B2B2B] text-white hover:bg-[#2B2B2B]'
          >
            {commentsHook.loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual Comment Item Component
interface CommentItemProps {
  comment: Comment;
  currentUser?: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    isModerator?: boolean;
  };
  onAddReply: (parentId: string, content: string) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReport: (
    commentId: string,
    reason: ReportReason,
    description?: string
  ) => Promise<void>;
  onReaction: (commentId: string, reactionType: ReactionType) => Promise<void>;
  onRemoveReaction: (
    commentId: string,
    reactionType: ReactionType
  ) => Promise<void>;
  depth?: number;
  showReactions?: boolean;
  showReporting?: boolean;
  showModeration?: boolean;
}

function CommentItem({
  comment,
  currentUser,
  onAddReply,
  onUpdate,
  onDelete,
  onReport,
  onReaction,
  onRemoveReaction,
  depth = 0,
  showReactions = true,
  showReporting = true,
  showModeration = false,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | ''>('');
  const [reportDescription, setReportDescription] = useState('');

  const isOwner = currentUser?.id === comment.authorId;
  const canEdit = isOwner && comment.status === CommentStatus.ACTIVE;
  const canDelete = isOwner || showModeration;
  const canReply = comment.status === CommentStatus.ACTIVE;

  const reactionSummary = useMemo(() => {
    // For now, use a simple reaction summary based on reactionCount
    // In a full implementation, this would transform CommentReaction[] to the expected format
    const mockReactions =
      comment.reactionCount > 0
        ? [
            {
              type: ReactionType.LIKE as ReactionType,
              count: comment.reactionCount,
            },
          ]
        : [];
    return getReactionSummary(mockReactions, comment.userReaction);
  }, [comment.reactionCount, comment.userReaction]);

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleReply = async () => {
    if (replyContent.trim()) {
      await onAddReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
      setShowReplies(true);
    }
  };

  const handleReport = async () => {
    if (reportReason) {
      await onReport(comment.id, reportReason, reportDescription);
      setShowReportForm(false);
      setReportReason('');
      setReportDescription('');
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (comment.userReaction === reactionType) {
      await onRemoveReaction(comment.id, reactionType);
    } else {
      if (comment.userReaction) {
        await onRemoveReaction(comment.id, comment.userReaction);
      }
      await onReaction(comment.id, reactionType);
    }
  };

  // Don't render hidden/deleted comments unless user is moderator
  if (comment.status !== CommentStatus.ACTIVE && !showModeration) {
    return null;
  }

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8 md:ml-12')}>
      <Avatar className='h-8 w-8 flex-shrink-0'>
        <AvatarImage src={comment.author.image} />
        <AvatarFallback className='bg-blue-500 text-xs text-white'>
          {comment.author.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='mb-1 flex items-center gap-2'>
              <button className='text-sm font-medium text-white underline-offset-2 hover:underline'>
                {comment.author.name}
              </button>
              {comment.author.username && (
                <span className='text-xs text-zinc-400'>
                  @{comment.author.username}
                </span>
              )}
              <span className='text-xs text-zinc-400'>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {comment.isEdited && (
                <span className='text-xs text-zinc-400'>(edited)</span>
              )}
              {comment.status !== CommentStatus.ACTIVE && (
                <Badge
                  variant={
                    comment.status === CommentStatus.HIDDEN
                      ? 'secondary'
                      : 'destructive'
                  }
                  className='text-xs'
                >
                  {comment.status === CommentStatus.HIDDEN && (
                    <EyeOff className='mr-1 h-3 w-3' />
                  )}
                  {comment.status === CommentStatus.DELETED && (
                    <Trash2 className='mr-1 h-3 w-3' />
                  )}
                  {comment.status === CommentStatus.PENDING_MODERATION && (
                    <AlertTriangle className='mr-1 h-3 w-3' />
                  )}
                  {comment.status.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className='mt-2'>
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className='min-h-[80px] resize-none border-[#2B2B2B] bg-[#212121] text-white'
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
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='border-[#2B2B2B] bg-[#212121]'
            >
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className='text-white hover:bg-[#2B2B2B]'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className='text-red-400 hover:bg-red-900/20'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {showReporting && !isOwner && (
                <>
                  <DropdownMenuSeparator className='bg-[#2B2B2B]' />
                  <DropdownMenuItem
                    onClick={() => setShowReportForm(true)}
                    className='text-orange-400 hover:bg-orange-900/20'
                  >
                    <Flag className='mr-2 h-4 w-4' />
                    Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reactions */}
        {showReactions && (
          <div className='mt-3 flex items-center gap-2'>
            {reactionSummary.topReactions.map(reaction => {
              const config = reaction.config;
              return (
                <Button
                  key={config.type}
                  variant='ghost'
                  size='sm'
                  onClick={() => handleReaction(config.type)}
                  className={cn(
                    'flex h-8 items-center gap-1 px-2 text-xs',
                    reaction.isUserReaction
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:bg-[#2B2B2B] hover:text-white'
                  )}
                >
                  <span>{config.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              );
            })}
            <Button
              variant='ghost'
              size='sm'
              className='h-8 px-2 text-xs text-zinc-400 hover:bg-[#2B2B2B] hover:text-white'
              onClick={() => {
                // Open reaction picker (simplified - just show popular reactions)
                // In a real implementation, this would open a reaction picker
              }}
            >
              +
            </Button>
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <div className='mt-3 -ml-11 md:-ml-12'>
            <div className='flex gap-3'>
              <Avatar className='h-6 w-6 flex-shrink-0'>
                <AvatarImage src={currentUser?.image} />
                <AvatarFallback className='bg-blue-500 text-xs text-white'>
                  {currentUser?.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <Textarea
                  placeholder='Write a reply...'
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  className='min-h-[60px] resize-none border-[#2B2B2B] bg-[#212121] text-sm text-white'
                />
                <div className='mt-2 flex justify-end gap-2'>
                  <Button
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyContent('');
                    }}
                    variant='outline'
                    size='sm'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReply}
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='mt-2 flex items-center gap-4'>
          {canReply && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowReplyInput(!showReplyInput)}
              className='h-auto p-0 text-xs text-zinc-400 hover:bg-transparent hover:text-white'
            >
              Reply
            </Button>
          )}

          {comment._count.replies > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowReplies(!showReplies)}
              className='h-auto p-0 text-xs text-zinc-400 hover:bg-transparent hover:text-white'
            >
              {showReplies ? (
                <ChevronUp className='mr-1 h-3 w-3' />
              ) : (
                <ChevronDown className='mr-1 h-3 w-3' />
              )}
              {comment._count.replies}{' '}
              {comment._count.replies === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </div>

        {/* Report Form */}
        {showReportForm && (
          <div className='mt-3 rounded-md border border-[#2B2B2B] bg-[#1A1A1A] p-3'>
            <h4 className='mb-2 text-sm font-medium text-white'>
              Report Comment
            </h4>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value as ReportReason)}
              className='mb-2 w-full rounded-md border border-[#2B2B2B] bg-[#212121] p-2 text-sm text-white'
            >
              <option value=''>Select a reason</option>
              <option value={ReportReason.SPAM}>Spam</option>
              <option value={ReportReason.HARASSMENT}>Harassment</option>
              <option value={ReportReason.HATE_SPEECH}>Hate Speech</option>
              <option value={ReportReason.INAPPROPRIATE_CONTENT}>
                Inappropriate Content
              </option>
              <option value={ReportReason.COPYRIGHT_VIOLATION}>
                Copyright Violation
              </option>
              <option value={ReportReason.OTHER}>Other</option>
            </select>
            <Textarea
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              placeholder='Additional details (optional)'
              className='mb-2 w-full resize-none border-[#2B2B2B] bg-[#212121] text-sm text-white'
              rows={2}
            />
            <div className='flex space-x-2'>
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

        {/* Nested Replies */}
        {/* Note: Backend returns _count.replies instead of actual reply objects */}
        {/* To implement nested replies, you'd need to fetch replies separately */}
        {/* For now, we show the count but don't render nested replies */}
        {comment._count.replies > 0 && (
          <div className='mt-2 text-sm text-gray-400'>
            {comment._count.replies}{' '}
            {comment._count.replies === 1 ? 'reply' : 'replies'}
          </div>
        )}
      </div>
    </div>
  );
}
