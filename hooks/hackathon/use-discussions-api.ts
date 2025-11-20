'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/use-auth';
import {
  getHackathonDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  replyToDiscussion,
  reportDiscussion,
  type CreateDiscussionRequest,
  type UpdateDiscussionRequest,
  type ReportDiscussionRequest,
} from '@/lib/api/hackathons';
import { type Discussion } from '@/types/hackathon';

interface UseDiscussionsProps {
  hackathonSlugOrId: string;
  organizationId?: string;
  autoFetch?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalReactions';
  sortOrder?: 'asc' | 'desc';
}

export function useDiscussions({
  hackathonSlugOrId,
  organizationId,
  autoFetch = true,
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: UseDiscussionsProps) {
  const { isAuthenticated } = useAuthStatus();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNext: false,
    hasPrev: false,
  });

  const fetchDiscussions = useCallback(async () => {
    if (!hackathonSlugOrId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getHackathonDiscussions(hackathonSlugOrId, {
        page,
        limit,
        sortBy,
        sortOrder,
        organizationId,
      });

      if (response.success && response.data) {
        setDiscussions(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch discussions');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch discussions';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [hackathonSlugOrId, organizationId, page, limit, sortBy, sortOrder]);

  const addDiscussion = useCallback(
    async (content: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to post a discussion');
        throw new Error('Authentication required');
      }

      setIsCreating(true);
      setError(null);

      try {
        const data: CreateDiscussionRequest = { content };
        const response = await createDiscussion(
          hackathonSlugOrId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          setDiscussions(prev => [response.data, ...prev]);
          toast.success('Discussion posted successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create discussion');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to post discussion';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const addReply = useCallback(
    async (parentCommentId: string, content: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to reply');
        throw new Error('Authentication required');
      }

      setIsCreating(true);
      setError(null);

      try {
        const data: CreateDiscussionRequest = { content, parentCommentId };
        const response = await replyToDiscussion(
          hackathonSlugOrId,
          parentCommentId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          // Update the parent discussion to include the new reply
          setDiscussions(prev =>
            prev.map(discussion => {
              if (discussion._id === parentCommentId) {
                return {
                  ...discussion,
                  replies: [...(discussion.replies || []), response.data],
                  replyCount: (discussion.replyCount || 0) + 1,
                };
              }
              return discussion;
            })
          );
          toast.success('Reply posted successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to post reply');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to post reply';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const updateDiscussionItem = useCallback(
    async (commentId: string, content: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to update a discussion');
        throw new Error('Authentication required');
      }

      setIsUpdating(true);
      setError(null);

      try {
        const data: UpdateDiscussionRequest = { content };
        const response = await updateDiscussion(
          hackathonSlugOrId,
          commentId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          setDiscussions(prev =>
            prev.map(discussion => {
              if (discussion._id === commentId) {
                return response.data;
              }
              // Also update in replies
              if (discussion.replies) {
                return {
                  ...discussion,
                  replies: discussion.replies.map((reply: Discussion) =>
                    reply._id === commentId ? response.data : reply
                  ),
                };
              }
              return discussion;
            })
          );
          toast.success('Discussion updated successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update discussion');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update discussion';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const deleteDiscussionItem = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to delete a discussion');
        throw new Error('Authentication required');
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await deleteDiscussion(
          hackathonSlugOrId,
          commentId,
          organizationId
        );

        if (response.success) {
          setDiscussions(prev =>
            prev
              .filter(discussion => discussion._id !== commentId)
              .map(discussion => ({
                ...discussion,
                replies: (discussion.replies || []).filter(
                  (reply: Discussion) => reply._id !== commentId
                ),
                replyCount: Math.max(
                  0,
                  (discussion.replyCount || 0) -
                    (discussion.replies || []).filter(
                      (reply: Discussion) => reply._id === commentId
                    ).length
                ),
              }))
          );
          toast.success('Discussion deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete discussion');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete discussion';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const reportDiscussionItem = useCallback(
    async (commentId: string, reason: string, description?: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to report a discussion');
        throw new Error('Authentication required');
      }

      setError(null);

      try {
        const data: ReportDiscussionRequest = {
          reason: reason as ReportDiscussionRequest['reason'],
          description,
        };
        const response = await reportDiscussion(
          hackathonSlugOrId,
          commentId,
          data,
          organizationId
        );

        if (response.success) {
          toast.success('Discussion reported successfully');
        } else {
          throw new Error(response.message || 'Failed to report discussion');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to report discussion';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  useEffect(() => {
    if (autoFetch && hackathonSlugOrId) {
      fetchDiscussions();
    }
  }, [autoFetch, hackathonSlugOrId, fetchDiscussions]);

  return {
    discussions,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    pagination,
    fetchDiscussions,
    addDiscussion,
    addReply,
    updateDiscussion: updateDiscussionItem,
    deleteDiscussion: deleteDiscussionItem,
    reportDiscussion: reportDiscussionItem,
  };
}
