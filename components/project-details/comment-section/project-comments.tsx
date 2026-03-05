'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { useCommentRealtime } from '@/hooks/use-comment-realtime';
import { CommentsSortDropdown } from './comments-sort-dropdown';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { CommentsEmptyState } from './comments-empty-state';
import { CommentEntityType, Comment } from '@/types/comment';
import { reportError } from '@/lib/error-reporting';

interface ProjectCommentsProps {
  projectId: string;
}

export function ProjectComments({ projectId }: ProjectCommentsProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Current user info
  const currentUserId = user?.id;
  const isRegistered = !!user;

  // Initialize the comment system for this project
  const commentSystem = useCommentSystem({
    entityType: CommentEntityType.PROJECT,
    entityId: projectId,
    page: 1,
    limit: 20,
    enabled: true,
  });

  // Real-time updates
  useCommentRealtime(
    {
      entityType: CommentEntityType.PROJECT,
      entityId: projectId,
      userId: currentUserId,
      enabled: true,
    },
    {
      onCommentCreated: comment => {
        // For replies, we might need to fetch the parent comment with replies
        // For now, refetch all comments to ensure proper nesting
        commentSystem.comments.refetch();
      },
      onCommentUpdated: comment => {
        commentSystem.comments.refetch();
      },
      onCommentDeleted: commentId => {
        commentSystem.comments.refetch();
      },
      onReactionAdded: data => {
        commentSystem.comments.refetch();
      },
      onReactionRemoved: data => {
        commentSystem.comments.refetch();
      },
      onCommentStatusChanged: data => {
        commentSystem.comments.refetch();
      },
    }
  );

  const handleAddComment = async (content: string) => {
    try {
      await commentSystem.createComment.createComment({
        content,
        entityType: CommentEntityType.PROJECT,
        entityId: projectId,
      });
    } catch (error) {
      reportError(error, { context: 'project-comment-create', projectId });
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      await commentSystem.createComment.createComment({
        content,
        parentId: parentCommentId,
        entityType: CommentEntityType.PROJECT,
        entityId: projectId,
      } as any);
    } catch (error) {
      reportError(error, { context: 'project-comment-reply', projectId });
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await commentSystem.updateComment.updateComment(commentId, { content });
    } catch (error) {
      reportError(error, { context: 'project-comment-update', projectId });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentSystem.deleteComment.deleteComment(commentId);
    } catch (error) {
      reportError(error, { context: 'project-comment-delete', projectId });
    }
  };

  const handleReportComment = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    try {
      await commentSystem.reportComment.reportComment(commentId, {
        reason: reason as any,
        description,
      });
    } catch (error) {
      reportError(error, { context: 'project-comment-report', projectId });
    }
  };

  const handleSortChange = (
    newSortBy: 'createdAt' | 'updatedAt' | 'totalReactions',
    newSortOrder: 'asc' | 'desc'
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // Refetch with new sorting
    commentSystem.comments.refetch();
  };

  // Function to nest comments based on parentId
  const nestComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: nest replies under their parents
    comments.forEach(comment => {
      if (comment.parentId) {
        // This is a reply, add it to its parent
        const parent = commentMap.get(comment.parentId);
        if (parent && parent.replies) {
          parent.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap.get(comment.id)!);
      }
    });

    return topLevelComments;
  };

  if (
    commentSystem.comments.loading &&
    commentSystem.comments.comments.length === 0
  ) {
    return (
      <div className='w-full'>
        <div className='flex items-center justify-center py-8'>
          <div className='text-gray-500'>Loading comments...</div>
        </div>
      </div>
    );
  }

  if (commentSystem.comments.error) {
    return (
      <div className='w-full'>
        <div className='py-4 text-center text-red-600'>
          Error loading comments: {commentSystem.comments.error}
        </div>
        <button
          onClick={() => commentSystem.comments.refetch()}
          className='mx-auto block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Retry
        </button>
      </div>
    );
  }

  if (commentSystem.comments.comments.length === 0) {
    return (
      <CommentsEmptyState
        onAddComment={handleAddComment}
        isRegistered={isRegistered}
      />
    );
  }

  return (
    <div className='w-full'>
      <div className='px-4 py-3 md:px-6 md:py-4'>
        <CommentsSortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      <div className='space-y-6 px-4 pb-6 md:px-6'>
        {nestComments(commentSystem.comments.comments).map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onAddReply={handleAddReply}
            onUpdate={handleUpdateComment}
            onDelete={handleDeleteComment}
            onReport={handleReportComment}
            currentUserId={currentUserId}
            isRegistered={isRegistered}
          />
        ))}
      </div>

      {commentSystem.comments.pagination.hasNext && (
        <div className='mt-6 px-4 text-center md:px-6'>
          <button
            onClick={() => commentSystem.comments.loadMore()}
            disabled={commentSystem.comments.loading}
            className='rounded-md bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
          >
            {commentSystem.comments.loading
              ? 'Loading...'
              : 'Load More Comments'}
          </button>
        </div>
      )}

      <CommentInput onSubmit={handleAddComment} />

      {commentSystem.createComment.error && (
        <div className='mx-4 mt-4 rounded-md border border-red-200 bg-red-50 p-3 md:mx-6'>
          <p className='text-sm text-red-600'>
            {commentSystem.createComment.error}
          </p>
        </div>
      )}
    </div>
  );
}
