'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UseTeamInvitationsOptions {
  hackathonId: string;
  teamId?: string;
  autoFetch?: boolean;
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
        // Handle both flat and wrapped response structures
        const data = (response as any).invitations
          ? response
          : (response as any).data;
        if (data && Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch team invitations');
      } finally {
        setIsLoading(false);
      }
    },
    [hackathonId, teamId, isAuthenticated]
  );

  const inviteUser = useCallback(
    async (data: InviteUserToTeamRequest) => {
      if (!hackathonId || !teamId) return;

      setIsInviting(true);
      setError(null);
      try {
        const response = await inviteUserToTeam(hackathonId, teamId, data);
        if (response.success) {
          toast.success('Invitation sent successfully!');
          fetchInvitations(); // Refresh list
          return response.data;
        }
      } catch (err: any) {
        const msg = err?.message || 'Failed to send invitation';
        toast.error(msg);
        throw err;
      } finally {
        setIsInviting(false);
      }
    },
    [hackathonId, teamId, fetchInvitations]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      if (!hackathonId) return;

      setIsCancelling(true);
      try {
        const response = await cancelTeamInvitation(hackathonId, inviteId);
        if (response.success) {
          toast.success('Invitation cancelled');
          fetchInvitations(); // Refresh list
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to cancel invitation');
        throw err;
      } finally {
        setIsCancelling(false);
      }
    },
    [hackathonId, fetchInvitations]
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

        // Handle both flat and wrapped response structures
        const data = (response as any).invitations
          ? response
          : (response as any).data;

        if (data && Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        } else {
          setInvitations([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch your invitations');
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
          return response.data;
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to accept invitation');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [hackathonId, fetchMyInvitations]
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
          return response.data;
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to decline invitation');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [hackathonId, fetchMyInvitations]
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
