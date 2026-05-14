'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/use-auth';
import { leaveHackathonTeam } from '@/lib/api/hackathons';
import { hackathonKeys } from '@/hooks/hackathon/use-hackathon-queries';

interface UseLeaveTeamOptions {
  hackathonSlugOrId: string;
  teamId: string;
  organizationId?: string;
  onSuccess?: () => void;
}

export function useLeaveTeam({
  hackathonSlugOrId,
  teamId,
  organizationId,
  onSuccess,
}: UseLeaveTeamOptions) {
  const { isAuthenticated } = useAuthStatus();
  const queryClient = useQueryClient();
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const leaveTeam = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to leave a team');
      return;
    }

    if (!hackathonSlugOrId || !teamId) {
      toast.error('Hackathon ID and Team ID are required');
      return;
    }

    setIsLeaving(true);
    setLeaveError(null);

    try {
      const response = await leaveHackathonTeam(
        hackathonSlugOrId,
        teamId,
        organizationId
      );

      if (response.success) {
        toast.success('Successfully left the team');
        // Refresh every consumer of myTeam (sidebar, submission form, MyTeamView)
        // and the team-list pages so they reflect the change without a reload.
        queryClient.invalidateQueries({
          queryKey: hackathonKeys.myTeam(hackathonSlugOrId),
        });
        queryClient.invalidateQueries({
          queryKey: hackathonKeys.teamsBase(hackathonSlugOrId),
        });
        onSuccess?.();
      } else {
        throw new Error(response.message || 'Failed to leave team');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to leave team';
      setLeaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLeaving(false);
    }
  }, [
    hackathonSlugOrId,
    teamId,
    organizationId,
    isAuthenticated,
    onSuccess,
    queryClient,
  ]);

  return {
    leaveTeam,
    isLeaving,
    leaveError,
  };
}
