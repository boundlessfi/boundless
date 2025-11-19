'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getTeamPosts,
  createTeamPost,
  updateTeamPost,
  deleteTeamPost,
  trackContactClick,
  type TeamRecruitmentPost,
  type CreateTeamPostRequest,
  type UpdateTeamPostRequest,
  type GetTeamPostsOptions,
} from '@/lib/api/hackathons';

interface UseTeamPostsProps {
  hackathonSlugOrId: string;
  organizationId?: string;
  autoFetch?: boolean;
}

export function useTeamPosts({
  hackathonSlugOrId,
  organizationId,
  autoFetch = true,
}: UseTeamPostsProps) {
  const { isAuthenticated } = useAuthStatus();
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const [posts, setPosts] = useState<TeamRecruitmentPost[]>([]);
  const [myPosts, setMyPosts] = useState<TeamRecruitmentPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (options?: GetTeamPostsOptions) => {
      if (!hackathonSlugOrId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getTeamPosts(
          hackathonSlugOrId,
          options,
          organizationId
        );

        if (response.success && response.data) {
          setPosts(response.data);

          // Separate user's posts if authenticated
          if (isAuthenticated && currentUserId) {
            const userPosts = response.data.filter(
              post => post.createdBy.userId === currentUserId
            );
            setMyPosts(userPosts);
          } else {
            setMyPosts([]);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch team posts');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch team posts';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated, currentUserId]
  );

  const fetchMyPosts = useCallback(async () => {
    if (!hackathonSlugOrId || !isAuthenticated) {
      setMyPosts([]);
      return;
    }

    try {
      // Fetch all posts and filter client-side
      // Backend could provide a /team-posts/me endpoint for better performance
      const response = await getTeamPosts(
        hackathonSlugOrId,
        undefined,
        organizationId
      );

      if (response.success && response.data && currentUserId) {
        // Filter posts created by current user
        const userPosts = response.data.filter(
          post => post.createdBy.userId === currentUserId
        );
        setMyPosts(userPosts);
      } else {
        setMyPosts([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch my posts';
      setError(errorMessage);
    }
  }, [hackathonSlugOrId, organizationId, isAuthenticated, currentUserId]);

  const createPost = useCallback(
    async (data: CreateTeamPostRequest) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to create a team post');
        throw new Error('Authentication required');
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await createTeamPost(
          hackathonSlugOrId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          setPosts(prev => [response.data, ...prev]);
          setMyPosts(prev => [response.data, ...prev]);
          toast.success('Team post created successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create team post');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create team post';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const updatePost = useCallback(
    async (postId: string, data: UpdateTeamPostRequest) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to update a team post');
        throw new Error('Authentication required');
      }

      setIsUpdating(true);
      setError(null);

      try {
        const response = await updateTeamPost(
          hackathonSlugOrId,
          postId,
          data,
          organizationId
        );

        if (response.success && response.data) {
          setPosts(prev =>
            prev.map(post => (post._id === postId ? response.data : post))
          );
          setMyPosts(prev =>
            prev.map(post => (post._id === postId ? response.data : post))
          );
          toast.success('Team post updated successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update team post');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update team post';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to delete a team post');
        throw new Error('Authentication required');
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await deleteTeamPost(
          hackathonSlugOrId,
          postId,
          organizationId
        );

        if (response.success) {
          setPosts(prev => prev.filter(post => post._id !== postId));
          setMyPosts(prev => prev.filter(post => post._id !== postId));
          toast.success('Team post deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete team post');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete team post';
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated]
  );

  const trackContact = useCallback(
    async (postId: string) => {
      try {
        await trackContactClick(hackathonSlugOrId, postId, organizationId);
        // Silently track - no toast notification needed
      } catch {
        // Silently fail - analytics tracking shouldn't break the flow
      }
    },
    [hackathonSlugOrId, organizationId]
  );

  useEffect(() => {
    if (autoFetch && hackathonSlugOrId) {
      fetchPosts();
    }
  }, [autoFetch, hackathonSlugOrId, fetchPosts]);

  useEffect(() => {
    if (isAuthenticated && hackathonSlugOrId) {
      fetchMyPosts();
    } else {
      setMyPosts([]);
    }
  }, [isAuthenticated, hackathonSlugOrId, fetchMyPosts]);

  return {
    posts,
    myPosts,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchPosts,
    fetchMyPosts,
    createPost,
    updatePost,
    deletePost,
    trackContact,
  };
}
