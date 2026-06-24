/**
 * React Query hooks for the hackathon detail page.
 *
 * Replaces the useEffect/useState fetching pattern inside hackathonProvider.
 * These hooks can be seeded with server-fetched `initialData` to avoid a
 * client-side loading state on first render.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getHackathon,
  getHackathonSubmissions,
  getHackathonWinners,
  getHackathonParticipants,
} from '@/lib/api/hackathon';
import {
  registerForHackathon,
  leaveHackathon,
} from '@/lib/api/hackathons/participants';
import { getExploreSubmissions } from '@/lib/api/hackathons';
import { listAnnouncements } from '@/lib/api/hackathons/index';
import { listTracks, type HackathonTrack } from '@/lib/api/hackathons/tracks';
import {
  getTeams,
  createTeam,
  getTeamDetails,
  updateTeam,
  joinTeam,
  leaveTeam,
  removeTeamMember,
  disbandTeam,
  getMyTeam,
  inviteToTeam,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  getTeamInvitations,
  toggleRoleHired,
  transferLeadership,
} from '@/lib/api/hackathons/teams';
import type { GetTeamOptions } from '@/lib/api/hackathons/teams';
import type { Hackathon, HackathonWinner } from '@/lib/api/hackathons';
import type { SubmissionCardProps, Participant } from '@/types/hackathon';

export interface ParticipantsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  type?: string;
  skill?: string;
}

export interface SubmissionsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────
// Centralised so any component can invalidate the right cache.

export const hackathonKeys = {
  all: ['hackathon'] as const,
  detail: (slug: string) => ['hackathon', 'detail', slug] as const,
  participants: (slug: string, params?: ParticipantsQueryParams) =>
    ['hackathon', 'participants', slug, params] as const,
  submissions: (slug: string) => ['hackathon', 'submissions', slug] as const,
  submissionsList: (slug: string, params?: SubmissionsQueryParams) =>
    ['hackathon', 'submissions', slug, params] as const,
  exploreSubmissions: (
    id: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      status?: string;
      sort?: string;
    }
  ) => ['hackathon', 'exploreSubmissions', id, params] as const,
  winners: (idOrSlug: string) => ['hackathon', 'winners', idOrSlug] as const,
  tracks: (idOrSlug: string) => ['hackathon', 'tracks', idOrSlug] as const,
  announcements: (idOrSlug: string) =>
    ['hackathon', 'announcements', idOrSlug] as const,
  teams: (idOrSlug: string, params?: GetTeamOptions) =>
    ['hackathon', 'teams', idOrSlug, params] as const,
  // Prefix-only form for invalidating every params-variant of `teams` in one
  // call. `teams(slug)` returns ['hackathon','teams',slug,undefined] which is
  // a 4-element key that does NOT prefix-match cached ['…',slug,{...params}].
  teamsBase: (idOrSlug: string) => ['hackathon', 'teams', idOrSlug] as const,
  myTeam: (idOrSlug: string) => ['hackathon', 'myTeam', idOrSlug] as const,
  team: (idOrSlug: string, teamId: string) =>
    ['hackathon', 'team', idOrSlug, teamId] as const,
  myInvitations: (idOrSlug: string, status?: string) =>
    ['hackathon', 'myInvitations', idOrSlug, status] as const,
  teamInvitations: (idOrSlug: string, teamId: string, status?: string) =>
    ['hackathon', 'teamInvitations', idOrSlug, teamId, status] as const,
};

// ─── Status Mapper ───────────────────────────────────────────────────────────

function mapSubmissionStatus(apiStatus: string): SubmissionCardProps['status'] {
  const normalized = apiStatus?.toUpperCase();
  switch (normalized) {
    case 'SHORTLISTED':
      return 'SHORTLISTED';
    case 'DISQUALIFIED':
    case 'WITHDRAWN':
      return 'DISQUALIFIED';
    case 'SUBMITTED':
    default:
      return 'SUBMITTED';
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a hackathon by slug.
 * Pass `initialData` from a Server Component to seed the cache and avoid a
 * loading state on first render.
 */
export function useHackathon(slug: string, initialData?: Hackathon) {
  return useQuery({
    queryKey: hackathonKeys.detail(slug),
    queryFn: async () => {
      const response = await getHackathon(slug);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Hackathon not found');
      }
      return response.data;
    },
    initialData,
    // SSR runs anonymously, so the seeded payload's user-scoped fields
    // (isParticipant, etc.) are stale on arrival — refetch on mount with
    // the user's cookies attached.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch participants for a hackathon.
 */
export function useHackathonParticipants(
  slug: string,
  params: ParticipantsQueryParams = {
    page: 1,
    limit: 12,
  }
) {
  return useQuery({
    queryKey: hackathonKeys.participants(slug, params),
    queryFn: async () => {
      const response = await getHackathonParticipants(slug, params);
      if (!response.success || !response.data) {
        return {
          participants: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 12,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          availableSkills: [],
        };
      }
      return {
        participants: response.data.participants,
        pagination: response.data.pagination,
        availableSkills: response.data.availableSkills ?? [],
      };
    },
    enabled: !!slug,
  });
}

/**
 * Fetch submissions for a hackathon.
 */
export function useHackathonSubmissions(
  slug: string,
  params: SubmissionsQueryParams = {
    page: 1,
    limit: 12,
  }
) {
  return useQuery({
    queryKey: hackathonKeys.submissionsList(slug, params),
    queryFn: async (): Promise<SubmissionCardProps[]> => {
      const response = await getHackathonSubmissions(slug, params);
      if (!response.success || !response.data) return [];
      return response.data.submissions;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch explore-style submissions (with participant profile mapping).
 */
export function useExploreSubmissions(
  hackathonId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  } = { page: 1, limit: 12 },
  enabled = true
) {
  return useQuery({
    queryKey: hackathonKeys.exploreSubmissions(hackathonId, params),
    queryFn: async () => {
      const response = await getExploreSubmissions(
        hackathonId,
        params.page,
        params.limit,
        {
          search: params.search,
          category: params.category,
          status: params.status,
          sort: params.sort,
        }
      );
      if (!response.success || !response.data) {
        return {
          submissions: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 12,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        submissions: response.data.submissions,
        pagination: response.data.pagination,
      };
    },
    enabled: !!hackathonId && enabled,
  });
}

/**
 * Fetch winners for a hackathon.
 *
 * Returns the legacy `HackathonWinner[]` shape for backward compatibility
 * via the array-typed callers. Use `useHackathonWinnersWithTracks` when
 * you also need the track-based prize winners.
 */
export function useHackathonWinners(idOrSlug: string, enabled = true) {
  return useQuery<HackathonWinner[]>({
    queryKey: hackathonKeys.winners(idOrSlug),
    queryFn: async () => {
      const response = await getHackathonWinners(idOrSlug);
      if (!response.success || !response.data) return [];
      return response.data.winners;
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Fetch winners + track winners for a hackathon. Used by the public
 * winners view to render both the overall podium and per-track prizes.
 */
export function useHackathonWinnersWithTracks(
  idOrSlug: string,
  enabled = true
) {
  return useQuery<{
    winners: HackathonWinner[];
    trackWinners: import('@/lib/api/hackathons').HackathonTrackWinner[];
  }>({
    queryKey: [...hackathonKeys.winners(idOrSlug), 'with-tracks'],
    queryFn: async () => {
      const response = await getHackathonWinners(idOrSlug);
      if (!response.success || !response.data) {
        return { winners: [], trackWinners: [] };
      }
      return {
        winners: response.data.winners ?? [],
        trackWinners:
          (
            response.data as {
              trackWinners?: import('@/lib/api/hackathons').HackathonTrackWinner[];
            }
          ).trackWinners ?? [],
      };
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Public list of tracks for a hackathon. Returns only active (non-archived)
 * tracks. Used by the public detail page to render Track Prizes and the
 * submission form to populate the track picker.
 */
export function useHackathonTracks(idOrSlug: string, enabled = true) {
  return useQuery<HackathonTrack[]>({
    queryKey: hackathonKeys.tracks(idOrSlug),
    queryFn: async () => {
      try {
        return await listTracks(idOrSlug);
      } catch {
        // Best-effort: a 404 / network error shouldn't kill the page.
        return [];
      }
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Fetch announcements for a hackathon (public, non-draft only).
 */
export function useHackathonAnnouncements(idOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: hackathonKeys.announcements(idOrSlug),
    queryFn: async () => {
      const data = await listAnnouncements(idOrSlug);
      return data.filter(a => !a.isDraft);
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Fetch teams for a hackathon.
 */
export function useHackathonTeams(
  idOrSlug: string,
  params: GetTeamOptions = { page: 1, limit: 12 },
  enabled = true
) {
  return useQuery({
    queryKey: hackathonKeys.teams(idOrSlug, params),
    queryFn: async () => {
      const response = await getTeams(idOrSlug, params);
      return response;
    },
    enabled: !!idOrSlug && enabled,
  });
}

// Legacy alias
export const useTeamPosts = useHackathonTeams;

/**
 * Fetch a single team by id.
 */
export function useTeam(idOrSlug: string, teamId: string, enabled = true) {
  return useQuery({
    queryKey: hackathonKeys.team(idOrSlug, teamId),
    queryFn: async () => {
      const response = await getTeamDetails(idOrSlug, teamId);
      return response.data;
    },
    enabled: !!idOrSlug && !!teamId && enabled,
  });
}

/**
 * Fetch current user's team.
 */
export function useMyTeam(idOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: hackathonKeys.myTeam(idOrSlug),
    queryFn: async () => {
      const response = await getMyTeam(idOrSlug);
      return response.data;
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Fetch current user's invitations.
 */
export function useMyInvitations(
  idOrSlug: string,
  status?: string,
  enabled = true
) {
  return useQuery({
    queryKey: hackathonKeys.myInvitations(idOrSlug, status),
    queryFn: async () => {
      const response = await getMyInvitations(idOrSlug, status);
      return response.data;
    },
    enabled: !!idOrSlug && enabled,
  });
}

/**
 * Fetch invitations sent by a team (Leader only).
 */
export function useTeamInvitations(
  idOrSlug: string,
  teamId: string,
  status?: string,
  enabled = true
) {
  return useQuery({
    queryKey: hackathonKeys.teamInvitations(idOrSlug, teamId, status),
    queryFn: async () => {
      const response = await getTeamInvitations(idOrSlug, teamId, status);
      return response.data;
    },
    enabled: !!idOrSlug && !!teamId && enabled,
  });
}

/**
 * Mutation to join a hackathon.
 */
export function useJoinHackathon(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => registerForHackathon(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.detail(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.participants(slug),
      });
    },
  });
}

/**
 * Mutation to leave a hackathon. Backend cascades: removes the user from
 * their team (auto-promoting a remaining member if they were the leader,
 * or deleting the team if they were solo) and invalidates their submission.
 */
export function useLeaveHackathon(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveHackathon(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.detail(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.participants(slug),
      });
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: ['hackathon', 'teams', slug],
      });
      queryClient.invalidateQueries({
        queryKey: ['hackathon', 'submissions', slug],
      });
      queryClient.invalidateQueries({
        queryKey: ['hackathon', 'exploreSubmissions'],
      });
    },
  });
}

/**
 * Mutation to join a team.
 */
export function useJoinTeam(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, message }: { teamId: string; message?: string }) =>
      joinTeam(slug, teamId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamsBase(slug),
      });
    },
  });
}

/**
 * Mutation to leave a team.
 */
export function useLeaveTeam(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => leaveTeam(slug, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamsBase(slug),
      });
    },
  });
}

/**
 * Mutation for the team leader to remove a specific member.
 */
export function useRemoveTeamMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(slug, teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamsBase(slug),
      });
    },
  });
}

/**
 * Mutation for the team leader to disband the team. Backend refuses if
 * the team has an existing submission.
 */
export function useDisbandTeam(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => disbandTeam(slug, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamsBase(slug),
      });
    },
  });
}

/**
 * Mutations for invitation actions (accept/reject/cancel).
 */
export function useInvitationActions(slug: string) {
  const queryClient = useQueryClient();

  const acceptAction = useMutation({
    mutationFn: (inviteId: string) => acceptInvitation(slug, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.myInvitations(slug),
      });
    },
  });

  const rejectAction = useMutation({
    mutationFn: (inviteId: string) => rejectInvitation(slug, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.myInvitations(slug),
      });
    },
  });

  const cancelAction = useMutation({
    mutationFn: ({ teamId, inviteId }: { teamId: string; inviteId: string }) =>
      cancelInvitation(slug, inviteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamInvitations(slug, variables.teamId),
      });
    },
  });

  return { acceptAction, rejectAction, cancelAction };
}

/**
 * Mutation to transfer leadership.
 */
export function useTransferLeadership(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      teamId: string;
      newLeaderId: string;
      reason?: string;
    }) =>
      transferLeadership(
        slug,
        params.teamId,
        params.newLeaderId,
        params.reason
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamsBase(slug),
      });
    },
  });
}

/**
 * Mutation to invite a user to join team.
 */
export function useInviteToTeam(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      teamId: string;
      inviteeIdentifier: string;
      message?: string;
    }) =>
      inviteToTeam(
        slug,
        params.teamId,
        params.inviteeIdentifier,
        params.message
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: hackathonKeys.teamInvitations(slug, variables.teamId),
      });
      toast.success(
        `Invitation sent to ${variables.inviteeIdentifier.replace(/^@/, '')}`
      );
    },
  });
}

/**
 * Mutation to toggle role hired status.
 */
export function useToggleRoleHired(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { teamId: string; skill: string }) =>
      toggleRoleHired(slug, params.teamId, params.skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(slug) });
    },
  });
}

/**
 * Utility to manually refresh hackathon data (e.g. after joining/leaving).
 */
export function useRefreshHackathon(slug: string) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: hackathonKeys.detail(slug),
    });
    await queryClient.invalidateQueries({
      queryKey: hackathonKeys.participants(slug),
    });
    await queryClient.invalidateQueries({
      queryKey: hackathonKeys.submissions(slug),
    });
    await queryClient.invalidateQueries({
      queryKey: hackathonKeys.winners(slug),
    });
    await queryClient.invalidateQueries({
      queryKey: hackathonKeys.myTeam(slug),
    });
  };
}
