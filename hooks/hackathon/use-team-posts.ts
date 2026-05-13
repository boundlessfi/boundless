'use client';

import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStatus } from '@/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getTeamPosts,
  createTeamPost,
  updateTeamPost,
  deleteTeamPost,
  getMyTeam,
  trackContactClick,
  type Team as TeamRecruitmentPost,
  type CreateTeamRequest as CreateTeamPostRequest,
  type UpdateTeamRequest as UpdateTeamPostRequest,
  type GetTeamOptions as GetTeamPostsOptions,
} from '@/lib/api/hackathons/teams';
import { hackathonKeys } from '@/hooks/hackathon/use-hackathon-queries';
import { reportError } from '@/lib/error-reporting';

function getErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response?.data?.message != null) {
    return String(err.response.data.message);
  }
  if (err instanceof Error) return err.message;
  return defaultMessage;
}

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
  const queryClient = useQueryClient();
  // After a team mutation, the React Query–backed pages (FindTeam,
  // MyTeamView) need to refetch — this hook's internal setState only
  // updates this hook's instance, not the cached queries those pages read.
  const invalidateTeamQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: hackathonKeys.teamsBase(hackathonSlugOrId),
    });
    queryClient.invalidateQueries({
      queryKey: hackathonKeys.myTeam(hackathonSlugOrId),
    });
  }, [queryClient, hackathonSlugOrId]);
  const [posts, setPosts] = useState<TeamRecruitmentPost[]>([]);
  const [myTeam, setMyTeam] = useState<TeamRecruitmentPost | null>(null);
  const [myPosts, setMyPosts] = useState<TeamRecruitmentPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMyTeam, setIsLoadingMyTeam] = useState(false);
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
        const response = await getTeamPosts(hackathonSlugOrId, options);

        if (response.success && response.data) {
          const teams = response.data.teams || [];
          setPosts(teams);

          // Separate user's posts if authenticated
          if (isAuthenticated && currentUserId) {
            const userPosts = teams.filter(
              post => post.leader?.id === currentUserId
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
        // Removed toast.error to avoid false positive error messages on page load
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
      const response = await getTeamPosts(hackathonSlugOrId, undefined);

      if (response.success && response.data && currentUserId) {
        // Filter posts created by current user
        const teams = response.data.teams || [];
        const userPosts = teams.filter(
          post => post.leader?.id === currentUserId
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

  const fetchMyTeam = useCallback(async () => {
    if (!hackathonSlugOrId || !isAuthenticated) {
      setMyTeam(null);
      return;
    }

    setIsLoadingMyTeam(true);
    try {
      const response = await getMyTeam(hackathonSlugOrId);
      if (response.success && response.data) {
        setMyTeam(response.data);
      } else {
        setMyTeam(null);
      }
    } catch (err) {
      reportError(err, {
        context: 'team-posts-fetchMyTeam',
        hackathonSlugOrId,
      });
      setMyTeam(null);
    } finally {
      setIsLoadingMyTeam(false);
    }
  }, [hackathonSlugOrId, organizationId, isAuthenticated]);

  const createPost = useCallback(
    async (data: CreateTeamPostRequest) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to create a team post');
        throw new Error('Authentication required');
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await createTeamPost(hackathonSlugOrId, data);

        if (response.success && response.data) {
          setPosts(prev => [response.data!, ...prev]);
          setMyPosts(prev => [response.data!, ...prev]);
          setMyTeam(prev =>
            prev
              ? { ...prev, posts: [response.data!, ...(prev.posts || [])] }
              : {
                  ...response.data!,
                  posts: [response.data!],
                }
          );
          invalidateTeamQueries();
          toast.success('Team post created successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create team post');
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, 'Failed to create team post');
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated, invalidateTeamQueries]
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
        const response = await updateTeamPost(hackathonSlugOrId, postId, data);

        if (response.success && response.data) {
          setPosts(prev =>
            prev.map(post => (post.id === postId ? response.data! : post))
          );
          setMyPosts(prev =>
            prev.map(post => (post.id === postId ? response.data! : post))
          );
          setMyTeam(prev =>
            prev
              ? {
                  ...prev,
                  posts: (prev.posts || []).map(p =>
                    p.id === postId ? response.data! : p
                  ),
                }
              : null
          );
          invalidateTeamQueries();
          toast.success('Team post updated successfully');
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update team post');
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, 'Failed to update team post');
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated, invalidateTeamQueries]
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
          setPosts(prev => prev.filter(post => post.id !== postId));
          setMyPosts(prev => prev.filter(post => post.id !== postId));
          invalidateTeamQueries();
          toast.success('Team post deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete team post');
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, 'Failed to delete team post');
        setError(errorMessage);
        toast.error('Error', { description: errorMessage });
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [hackathonSlugOrId, organizationId, isAuthenticated, invalidateTeamQueries]
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
      fetchMyTeam();
    } else {
      setMyPosts([]);
      setMyTeam(null);
    }
  }, [isAuthenticated, hackathonSlugOrId, fetchMyPosts, fetchMyTeam]);

  return {
    posts,
    myPosts,
    myTeam,
    isLoading,
    isLoadingMyTeam,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchPosts,
    fetchMyPosts,
    fetchMyTeam,
    createPost,
    updatePost,
    deletePost,
    trackContact,
  };
}
