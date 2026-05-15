'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  inviteUserToTeam,
  getMyTeamInvitations,
  acceptTeamInvitation,
  rejectTeamInvitation,
  cancelTeamInvitation,
  getTeamInvitations,
  type TeamInvitation,
  type InvitationStatus,
  type InviteUserToTeamRequest,
} from '@/lib/api/hackathons';
import { hackathonKeys } from '@/hooks/hackathon/use-hackathon-queries';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UseTeamInvitationsOptions {
  hackathonId: string;
  teamId?: string;
  autoFetch?: boolean;
}

// Backend's TransformResponseInterceptor wraps every response in
// { success, message, data, meta }, so the canonical wire shape is the
// wrapped one. Older code defended against a flat `{ invitations, total }`
// shape too — that path is dead in production.
function unwrapInvitations(response: unknown): TeamInvitation[] {
  if (!response || typeof response !== 'object') return [];
  const wrapped = response as {
    data?: { invitations?: TeamInvitation[] };
  };
  return wrapped.data?.invitations ?? [];
}

/**
 * Hook for managing a team's sent invitations (Leader only)
 */
export function useTeamInvitations({
  hackathonId,
  teamId,
  autoFetch = true,
}: UseTeamInvitationsOptions) {
  const { isAuthenticated } = useAuthStatus();
  const queryClient = useQueryClient();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(
    async (status?: InvitationStatus) => {
      if (!isAuthenticated || !hackathonId || !teamId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await getTeamInvitations(hackathonId, teamId, status);
        setInvitations(unwrapInvitations(response));
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to fetch team invitations';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [hackathonId, teamId, isAuthenticated]
  );

  const invalidateAfterInviteChange = useCallback(() => {
    if (!hackathonId || !teamId) return;
    queryClient.invalidateQueries({
      queryKey: hackathonKeys.teamInvitations(hackathonId, teamId),
    });
    // The team's member roster may change too (e.g. when an accept fires
    // server-side via a different client). Refresh myTeam so MyTeamView and
    // the SubmissionForm panel stay in sync.
    queryClient.invalidateQueries({
      queryKey: hackathonKeys.myTeam(hackathonId),
    });
  }, [queryClient, hackathonId, teamId]);

  const inviteUser = useCallback(
    async (data: InviteUserToTeamRequest) => {
      if (!hackathonId || !teamId) return;

      setIsInviting(true);
      setError(null);
      try {
        const response = await inviteUserToTeam(hackathonId, teamId, data);
        if (response.success) {
          toast.success('Invitation sent successfully!');
          fetchInvitations();
          invalidateAfterInviteChange();
          return response.data;
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Failed to send invitation';
        toast.error(msg);
        throw err;
      } finally {
        setIsInviting(false);
      }
    },
    [hackathonId, teamId, fetchInvitations, invalidateAfterInviteChange]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      if (!hackathonId) return;

      setIsCancelling(true);
      try {
        const response = await cancelTeamInvitation(hackathonId, inviteId);
        if (response.success) {
          toast.success('Invitation cancelled');
          fetchInvitations();
          invalidateAfterInviteChange();
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to cancel invitation'
        );
        throw err;
      } finally {
        setIsCancelling(false);
      }
    },
    [hackathonId, fetchInvitations, invalidateAfterInviteChange]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchInvitations();
    }
  }, [autoFetch, fetchInvitations]);

  return {
    invitations,
    isLoading,
    isInviting,
    isCancelling,
    error,
    fetchInvitations,
    inviteUser,
    cancelInvite,
  };
}

/**
 * Hook for managing current user's received invitations
 */
export function useMyTeamInvitations(hackathonId: string, autoFetch = true) {
  const { isAuthenticated } = useAuthStatus();
  const queryClient = useQueryClient();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyInvitations = useCallback(
    async (status?: InvitationStatus) => {
      if (!isAuthenticated || !hackathonId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await getMyTeamInvitations(hackathonId, status);
        setInvitations(unwrapInvitations(response));
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to fetch your invitations';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [hackathonId, isAuthenticated]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      if (!hackathonId) return;

      setIsProcessing(true);
      try {
        const response = await acceptTeamInvitation(hackathonId, inviteId);
        if (response.success) {
          toast.success('Successfully joined the team!');
          fetchMyInvitations();
          // Crucial: the user just joined a team, so MySubmissionPanel,
          // SubmissionForm, MyTeamView, and the sidebar all need to flip
          // from "no team" to "your team". Without these invalidations the
          // user has to reload to see the change.
          queryClient.invalidateQueries({
            queryKey: hackathonKeys.myTeam(hackathonId),
          });
          queryClient.invalidateQueries({
            queryKey: hackathonKeys.myInvitations(hackathonId),
          });
          return response.data;
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to accept invitation'
        );
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [hackathonId, fetchMyInvitations, queryClient]
  );

  const rejectInvite = useCallback(
    async (inviteId: string) => {
      if (!hackathonId) return;

      setIsProcessing(true);
      try {
        const response = await rejectTeamInvitation(hackathonId, inviteId);
        if (response.success) {
          toast.success('Invitation declined');
          fetchMyInvitations();
          queryClient.invalidateQueries({
            queryKey: hackathonKeys.myInvitations(hackathonId),
          });
          return response.data;
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to decline invitation'
        );
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [hackathonId, fetchMyInvitations, queryClient]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchMyInvitations();
    }
  }, [autoFetch, fetchMyInvitations]);

  return {
    invitations,
    isLoading,
    isProcessing,
    error,
    fetchMyInvitations,
    acceptInvite,
    rejectInvite,
  };
}
