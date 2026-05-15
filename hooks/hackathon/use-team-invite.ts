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

export interface InviteResult {
  /** Identifier (email/username/userId) the leader entered. */
  invitee: string;
  status: 'sent' | 'failed';
  /** Failure reason from the backend, present when status === 'failed'. */
  error?: string;
}

interface UseTeamInviteReturn {
  createTeamAndInvite: (
    teamData: CreateTeamPostRequest,
    invitees: string[]
  ) => Promise<{ teamId: string; invites: InviteResult[] }>;
  isCreatingTeam: boolean;
  error: string | null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const candidate =
      (err as { response?: { data?: { message?: string } } }).response?.data
        ?.message ?? (err as { message?: string }).message;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return fallback;
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
      invitees: string[] // Array of user IDs, usernames, or emails
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

        // 2. Invite members in parallel. Promise.allSettled instead of
        //    Promise.all so a single rejection doesn't poison the rest of
        //    the batch — we want every invite attempt to be reported.
        const invites: InviteResult[] = [];
        if (invitees.length > 0) {
          const settled = await Promise.allSettled(
            invitees.map(invitee =>
              inviteUserToTeam(hackathonSlugOrId, newTeamId, {
                inviteeIdentifier: invitee,
                message: 'Join my team for the hackathon!',
              }).then(res => ({ invitee, res }))
            )
          );

          for (let i = 0; i < settled.length; i += 1) {
            const result = settled[i];
            const invitee = invitees[i];
            if (result.status === 'fulfilled') {
              const { res } = result.value;
              if (res?.success) {
                invites.push({ invitee, status: 'sent' });
              } else {
                const reason = res?.message ?? 'Invite failed';
                reportMessage(
                  `Failed to invite ${invitee}: ${reason}`,
                  'warning'
                );
                invites.push({ invitee, status: 'failed', error: reason });
              }
            } else {
              const reason = getErrorMessage(result.reason, 'Invite failed');
              reportError(result.reason, { context: 'team-invite', invitee });
              invites.push({ invitee, status: 'failed', error: reason });
            }
          }
        }

        const failed = invites.filter(i => i.status === 'failed');

        if (failed.length === 0) {
          toast.success('Team created — all invites sent.');
          onSuccess?.(newTeamId);
        } else {
          // Surface WHO failed and WHY, not just the count. The leader
          // needs both pieces to decide whether to fix the address and
          // retry, or invite a different person via MyTeamView.
          const summary =
            failed.length === invitees.length
              ? `Team created, but all ${failed.length} invites failed.`
              : `Team created. ${invites.length - failed.length} of ${invites.length} invites sent.`;
          // Cap the description so very large failure lists don't dominate
          // the screen; the rest is in the returned `invites` array for the
          // caller to render properly.
          const detail = failed
            .slice(0, 5)
            .map(f => `• ${f.invitee}: ${f.error ?? 'unknown error'}`)
            .join('\n');
          const more =
            failed.length > 5 ? `\n…and ${failed.length - 5} more` : '';
          toast.error(summary, { description: `${detail}${more}` });
          // Still call onSuccess: the team exists, the modal should close
          // and the leader can re-invite via MyTeamView using the returned
          // `invites` list as a starting point.
          onSuccess?.(newTeamId);
        }

        return { teamId: newTeamId, invites };
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'Failed to create team');
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
