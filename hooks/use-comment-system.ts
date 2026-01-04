'use client';

// import { useMemo } from 'react';
import {
  CommentEntityType,
  //   UseCommentsOptions,
  UseCommentsReturn,
  UseCreateCommentReturn,
  UseUpdateCommentReturn,
  UseDeleteCommentReturn,
  UseReportCommentReturn,
  UseReactionsReturn,
} from '@/types/comment';
import { useComments } from './use-comments';
import { useCreateComment } from './use-create-comment';
import { useUpdateComment } from './use-update-comment';
import { useDeleteComment } from './use-delete-comment';
import { useReportComment } from './use-report-comment';
import { useCommentReactions } from './use-comment-reactions';

interface UseCommentSystemOptions {
  entityType: CommentEntityType;
  entityId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseCommentSystemReturn {
  comments: UseCommentsReturn;
  createComment: UseCreateCommentReturn;
  updateComment: UseUpdateCommentReturn;
  deleteComment: UseDeleteCommentReturn;
  reportComment: UseReportCommentReturn;
  reactions: UseReactionsReturn;
  // Utility methods
  refreshAll: () => void;
}

/**
 * Comprehensive hook that combines all comment-related functionality
 * for use with GenericCommentThread component
 */
export function useCommentSystem(
  options: UseCommentSystemOptions
): UseCommentSystemReturn {
  const {
    entityType,
    entityId,
    page = 1,
    limit = 20,
    enabled = true,
  } = options;

  // Comments hook
  const commentsHook = useComments({
    entityType,
    entityId,
    page,
    limit,
    enabled,
  });

  // Create comment hook
  const createCommentHook = useCreateComment();

  // Update comment hook
  const updateCommentHook = useUpdateComment();

  // Delete comment hook
  const deleteCommentHook = useDeleteComment();

  // Report comment hook
  const reportCommentHook = useReportComment();

  // Reactions hook
  const reactionsHook = useCommentReactions();

  // Refresh all data
  const refreshAll = () => {
    commentsHook.refetch();
  };

  return {
    comments: commentsHook,
    createComment: createCommentHook,
    updateComment: updateCommentHook,
    deleteComment: deleteCommentHook,
    reportComment: reportCommentHook,
    reactions: reactionsHook,
    refreshAll,
  };
}
