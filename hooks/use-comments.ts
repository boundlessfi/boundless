'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Comment,
  GetCommentsQuery,
  UseCommentsOptions,
  UseCommentsReturn,
  CreateCommentRequest,
  UpdateCommentRequest,
  ReportCommentRequest,
} from '@/types/comment';
import { getComments as getCommentsApi } from '@/lib/api/comment';

// Hook for fetching comments with new generic API
export const useComments = (options: UseCommentsOptions): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPollingPaused, setIsPollingPaused] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const query: GetCommentsQuery = {
        entityType: options.entityType,
        entityId: options.entityId,
        authorId: options.authorId,
        parentId: options.parentId,
        status: options.status,
        includeReactions: options.includeReactions ?? true,
        includeReports: options.includeReports ?? false,
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      };

      const response = await getCommentsApi(query);

      if (query.page === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }
      setPagination({
        currentPage: Math.floor(response.data.offset / response.data.limit) + 1,
        totalPages: Math.ceil(response.data.total / response.data.limit),
        totalItems: response.data.total,
        itemsPerPage: response.data.limit,
        hasNext:
          response.data.offset + response.data.limit < response.data.total,
        hasPrev: response.data.offset > 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [
    options.entityType,
    options.entityId,
    options.authorId,
    options.parentId,
    options.status,
    options.includeReactions,
    options.includeReports,
    options.page,
    options.limit,
    options.sortBy,
    options.sortOrder,
    options.enabled,
  ]);

  const loadMore = useCallback(async () => {
    if (pagination.hasNext && !loading) {
      const nextPage = pagination.currentPage + 1;
      setLoading(true);
      setError(null);

      try {
        const query: GetCommentsQuery = {
          entityType: options.entityType,
          entityId: options.entityId,
          authorId: options.authorId,
          parentId: options.parentId,
          status: options.status,
          includeReactions: options.includeReactions ?? true,
          includeReports: options.includeReports ?? false,
          page: nextPage,
          limit: options.limit || 20,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        };

        const response = await getCommentsApi(query);

        setComments(prev => [...prev, ...response.data.comments]);
        setPagination({
          currentPage:
            Math.floor(response.data.offset / response.data.limit) + 1,
          totalPages: Math.ceil(response.data.total / response.data.limit),
          totalItems: response.data.total,
          itemsPerPage: response.data.limit,
          hasNext:
            response.data.offset + response.data.limit < response.data.total,
          hasPrev: response.data.offset > 0,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load more comments'
        );
      } finally {
        setLoading(false);
      }
    }
  }, [
    options.entityType,
    options.entityId,
    options.authorId,
    options.parentId,
    options.status,
    options.includeReactions,
    options.includeReports,
    options.limit,
    options.sortBy,
    options.sortOrder,
    pagination.hasNext,
    pagination.currentPage,
    loading,
  ]);

  // Fetch comments on mount and when dependencies change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Auto-refresh every 30 seconds (unless paused)
  useEffect(() => {
    if (!options.enabled || isPollingPaused) return;

    const interval = setInterval(() => {
      fetchComments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchComments, options.enabled, isPollingPaused]);

  const refetch = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  const pausePolling = useCallback(() => {
    setIsPollingPaused(true);
  }, []);

  const resumePolling = useCallback(() => {
    setIsPollingPaused(false);
  }, []);

  return {
    comments,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
    pausePolling,
    resumePolling,
    isPolling: Boolean(options.enabled && !isPollingPaused),
  };
};

// Legacy hook for backward compatibility with project-specific comments
export const useCommentManagement = (projectId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = useCallback(async (data: CreateCommentRequest) => {
    setLoading(true);
    setError(null);
    try {
      throw new Error(
        'Legacy useCommentManagement.createComment is deprecated. Use the new comment system hooks instead.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComment = useCallback(
    async (commentId: string, data: UpdateCommentRequest) => {
      setLoading(true);
      setError(null);
      try {
        // This will be handled by individual hooks now
        throw new Error('Use useUpdateComment hook instead');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update comment'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string) => {
    setLoading(true);
    setError(null);
    try {
      // This will be handled by individual hooks now
      throw new Error('Use useDeleteComment hook instead');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reportComment = useCallback(
    async (commentId: string, data: ReportCommentRequest) => {
      setLoading(true);
      setError(null);
      try {
        // This will be handled by individual hooks now
        throw new Error('Use useReportComment hook instead');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to report comment'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createComment,
    updateComment,
    deleteComment,
    reportComment,
    loading,
    error,
  };
};
