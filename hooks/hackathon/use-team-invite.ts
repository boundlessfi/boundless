'use client';

import { useState, useCallback } from 'react';
import {
  createTeamPost,
  inviteUserToTeam,
  type CreateTeamPostRequest,
} from '@/lib/api/hackathons';
import { toast } from 'sonner';
import { reportError, reportMessage } from '@/lib/error-reporting';

interface UseTeamInviteOptions {
  hackathonSlugOrId: string;
  organizationId?: string;
  onSuccess?: (teamId: string) => void;
}

interface UseTeamInviteReturn {
  createTeamAndInvite: (
    teamData: CreateTeamPostRequest,
    invitees: string[]
  ) => Promise<string>;
  isCreatingTeam: boolean;
  error: string | null;
}

export const useTeamInvite = ({
  hackathonSlugOrId,
  organizationId,
  onSuccess,
}: UseTeamInviteOptions): UseTeamInviteReturn => {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeamAndInvite = useCallback(
    async (
      teamData: CreateTeamPostRequest,
      invitees: string[] // Array of user IDs or usernames
    ) => {
      setIsCreatingTeam(true);
      setError(null);

      try {
        // 1. Create Team
        const teamResponse = await createTeamPost(
          hackathonSlugOrId,
          teamData,
          organizationId
        );

        if (!teamResponse.success || !teamResponse.data) {
          throw new Error(teamResponse.message || 'Failed to create team');
        }

        const newTeamId = teamResponse.data.id;

        // 2. Invite Members
        let failedInvitesCount = 0;
        if (invitees.length > 0) {
          const results = await Promise.all(
            invitees.map(async invitee => {
              try {
                const res = await inviteUserToTeam(
                  hackathonSlugOrId,
                  newTeamId,
                  {
                    inviteeIdentifier: invitee,
                    message: 'Join my team for the hackathon!',
                  }
                );

                if (!res.success) {
                  reportMessage(
                    `Failed to invite ${invitee}: ${res.message}`,
                    'warning'
                  );
                }
                return res;
              } catch (err) {
                reportError(err, { context: 'team-invite', invitee });
                return null;
              }
            })
          );
          failedInvitesCount = results.filter(
            res => !res || !res.success
          ).length;
        }

        if (failedInvitesCount === 0) {
          toast.success('Team created successfully!');
          onSuccess?.(newTeamId);
        } else {
          const message =
            failedInvitesCount === invitees.length
              ? `Team created, but all ${failedInvitesCount} invites failed to send.`
              : `Team created, but ${failedInvitesCount} of ${invitees.length} invites failed.`;
          toast.error(message);
        }

        return newTeamId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create team';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsCreatingTeam(false);
      }
    },
    [hackathonSlugOrId, organizationId, onSuccess]
  );

  return {
    createTeamAndInvite,
    isCreatingTeam,
    error,
  };
};
