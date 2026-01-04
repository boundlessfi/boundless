'use client';

import { useState, useMemo } from 'react';
import { CommentsSortDropdown } from '@/components/project-details/comment-section/comments-sort-dropdown';
import { CommentItem } from '@/components/project-details/comment-section/comment-item';
import { CommentInput } from '@/components/project-details/comment-section/comment-input';
import { CommentsEmptyState } from '@/components/project-details/comment-section/comments-empty-state';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType, Comment, ReportReason } from '@/types/comment';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface HackathonDiscussionsProps {
  hackathonId: string;
  organizationId?: string;
  isRegistered?: boolean;
}

// Adapter function to convert Comment to ProjectComment for CommentItem
const commentToProjectComment = (comment: Comment): Comment => {
  return {
    ...comment,
    replies: comment.replies?.map(commentToProjectComment),
  };
};

export function HackathonDiscussions({
  hackathonId,
  isRegistered = false,
}: HackathonDiscussionsProps) {
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { user } = useAuth(false);

  // Use the generic comment system
  const {
    comments: commentsHook,
    createComment: createCommentHook,
    updateComment: updateCommentHook,
    deleteComment: deleteCommentHook,
    reportComment: reportCommentHook,
  } = useCommentSystem({
    entityType: CommentEntityType.HACKATHON,
    entityId: hackathonId,
    page: 1,
    limit: 100,
    enabled: true,
  });

  // Build nested comment structure and sort
  const sortedComments = useMemo(() => {
    // Separate top-level comments and replies
    const topLevelComments = commentsHook.comments.filter(
      comment => !comment.parentId
    );
    const repliesMap = new Map<string, Comment[]>();

    // Group replies by parent ID
    commentsHook.comments.forEach(comment => {
      if (comment.parentId) {
        const replies = repliesMap.get(comment.parentId) || [];
        replies.push(comment);
        repliesMap.set(comment.parentId, replies);
      }
    });

    // Attach replies to parent comments
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }));

    // Sort top-level comments
    return commentsWithReplies.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'updatedAt') {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison = (a.reactionCount || 0) - (b.reactionCount || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [commentsHook.comments, sortBy, sortOrder]);

  const handleAddComment = async (content: string) => {
    try {
      await createCommentHook.createComment({
        content,
        entityType: CommentEntityType.HACKATHON,
        entityId: hackathonId,
      });
      commentsHook.refetch();
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      await createCommentHook.createComment({
        content,
        entityType: CommentEntityType.HACKATHON,
        entityId: hackathonId,
        parentId: parentCommentId,
      });
      commentsHook.refetch();
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await updateCommentHook.updateComment(commentId, { content });
      commentsHook.refetch();
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentHook.deleteComment(commentId);
      commentsHook.refetch();
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleReportComment = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    try {
      // Convert string reason to ReportReason enum
      const reportReason = reason.toUpperCase() as keyof typeof ReportReason;
      await reportCommentHook.reportComment(commentId, {
        reason: ReportReason[reportReason] || ReportReason.OTHER,
        description,
      });
    } catch {
      // Error is already handled in the hook
    }
  };

  const loading = commentsHook.loading && commentsHook.comments.length === 0;

  if (loading)
    return (
      <div className='flex w-full items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
        <span className='ml-3 text-gray-400'>Loading discussions...</span>
      </div>
    );

  if (commentsHook.error && commentsHook.comments.length === 0)
    return (
      <div className='w-full py-4 text-center'>
        <p className='mb-4 text-red-400'>
          Error loading discussions: {commentsHook.error}
        </p>
        <button
          onClick={() => commentsHook.refetch()}
          className='rounded-md bg-[#a7f950] px-4 py-2 text-black hover:bg-[#8fd93f]'
        >
          Retry
        </button>
      </div>
    );

  if (commentsHook.comments.length === 0)
    return (
      <CommentsEmptyState
        onAddComment={handleAddComment}
        isRegistered={isRegistered}
      />
    );

  return (
    <div className='w-full'>
      <div className='justify-left mb-4 flex'>
        <CommentsSortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        />
      </div>

      <div className='space-y-6 text-left font-normal'>
        {sortedComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={commentToProjectComment(comment)}
            onAddReply={handleAddReply}
            onUpdate={handleUpdateComment}
            onDelete={handleDeleteComment}
            onReport={handleReportComment}
            currentUserId={user?.id}
            isRegistered={isRegistered}
          />
        ))}
      </div>

      {isRegistered && (
        <div className='mt-10 px-4 md:px-0'>
          <CommentInput onSubmit={handleAddComment} />
        </div>
      )}

      {!isRegistered && commentsHook.comments.length > 0 && (
        <div className='mt-8 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-6 text-center md:px-6'>
          <p className='text-sm text-gray-400'>
            Register for this hackathon to join the discussion
          </p>
        </div>
      )}

      {commentsHook.error && commentsHook.comments.length > 0 && (
        <div className='mx-4 mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 md:mx-0'>
          <p className='text-sm text-red-400'>{commentsHook.error}</p>
        </div>
      )}

      {(createCommentHook.loading ||
        updateCommentHook.loading ||
        deleteCommentHook.loading) && (
        <div className='mx-4 mt-4 flex items-center gap-2 text-sm text-gray-400 md:mx-0'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>
            {createCommentHook.loading && 'Posting...'}
            {updateCommentHook.loading && 'Updating...'}
            {deleteCommentHook.loading && 'Deleting...'}
          </span>
        </div>
      )}
    </div>
  );
}
