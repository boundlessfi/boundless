import api from '../api';
import { ApiResponse, PaginatedResponse, User } from '../types';
import { Hackathon, Participant } from '@/types/hackathon';

// Team Member Type
export interface TeamMember {
  userId: string;
  username: string;
  name: string;
  role: string;
  image?: string;
  joinedAt: string;
}

// Team Role Type (for tracking hired status)
export interface TeamRole {
  skill: string;
  hired: boolean;
}

// Role structure for recruitment posts
export interface LookingForRole {
  role: string;
  skills?: string[];
}

/**
 * Contact information for a team. Backend stores this as a sparse object
 * keyed by channel rather than a string + separate method enum. The
 * channel is implicit in whichever key is populated.
 */
export interface TeamContactInfo {
  telegram?: string;
  discord?: string;
  email?: string;
}

/**
 * Surface the active channel + raw string from a TeamContactInfo for UI
 * display. Returns null when no channel is populated.
 */
export function readTeamContact(
  info: TeamContactInfo | undefined | null
): { method: 'email' | 'telegram' | 'discord'; value: string } | null {
  if (!info) return null;
  if (info.email) return { method: 'email', value: info.email };
  if (info.telegram) return { method: 'telegram', value: info.telegram };
  if (info.discord) return { method: 'discord', value: info.discord };
  return null;
}

// Team Interface (Updated from TeamRecruitmentPost)
export interface Team {
  id: string;
  teamName: string;
  description: string;
  hackathonId: string;
  leader: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  // Backend always returns full TeamMember objects via the
  // TransformResponseInterceptor. The historical `string[]` arm of this
  // union was for an old endpoint that no longer exists.
  members: TeamMember[];
  memberCount: number;
  maxSize: number;
  lookingFor: LookingForRole[];
  rolesStatus?: TeamRole[]; // Track hired status for each role
  contactInfo?: TeamContactInfo;
  isOpen: boolean;
  organizationId?: string;
  views?: number;
  contactCount?: number;
  hasSubmission?: boolean;
  createdAt: string;
  updatedAt: string;
  posts?: Team[];
}

// Legacy alias to avoid breaking existing code
export type TeamRecruitmentPost = Team;

export interface CreateTeamRequest {
  teamName: string;
  description: string;
  lookingFor: LookingForRole[];
  maxSize?: number;
  contactInfo?: TeamContactInfo;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {
  isOpen?: boolean;
}

export interface GetTeamOptions {
  page?: number;
  limit?: number;
  openOnly?: boolean;
  search?: string;
  category?: string;
  role?: string;
}

export interface GetTeamsResponse extends ApiResponse<{
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  success: true;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  hackathon: Hackathon;
  invitee: User;
  inviter: User;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
}

export interface GetInvitationsResponse extends ApiResponse<{
  invitations: TeamInvitation[];
  total: number;
}> {
  success: true;
}

/**
 * Get hackathon teams
 */
export const getTeams = async (
  id: string,
  options?: GetTeamOptions
): Promise<GetTeamsResponse> => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.category) params.append('category', options.category);
  if (options?.role) params.append('role', options.role);
  if (options?.openOnly) params.append('openOnly', 'true');

  const res = await api.get(`/hackathons/${id}/teams?${params.toString()}`);
  return res.data;
};

// Legacy alias for compatibility
export const getTeamPosts = async (
  hackathonId: string,
  options?: GetTeamOptions
) => getTeams(hackathonId, options);

/**
 * Create a team
 */
export const createTeam = async (
  id: string,
  data: CreateTeamRequest
): Promise<ApiResponse<Team>> => {
  const res = await api.post(`/hackathons/${id}/teams`, data);
  return res.data;
};

// Legacy alias
export const createTeamPost = createTeam;

/**
 * Get team details
 */
export const getTeamDetails = async (
  id: string,
  teamId: string
): Promise<ApiResponse<Team>> => {
  const res = await api.get(`/hackathons/${id}/teams/${teamId}`);
  return res.data;
};

// Legacy alias
export const getTeamPostDetails = getTeamDetails;

/**
 * Update team
 */
export const updateTeam = async (
  id: string,
  teamId: string,
  data: UpdateTeamRequest
): Promise<ApiResponse<null>> => {
  const res = await api.patch(`/hackathons/${id}/teams/${teamId}`, data);
  return res.data;
};

// Legacy alias
export const updateTeamPost = async (
  id: string,
  teamId: string,
  data: UpdateTeamRequest
) => updateTeam(id, teamId, data);

/**
 * Join a team
 */
export const joinTeam = async (
  id: string,
  teamId: string,
  message?: string
): Promise<ApiResponse<null>> => {
  const res = await api.post(`/hackathons/${id}/teams/${teamId}/join`, {
    message,
  });
  return res.data;
};

/**
 * Leave a team
 */
export const leaveTeam = async (
  id: string,
  teamId: string
): Promise<ApiResponse<null>> => {
  const res = await api.post(`/hackathons/${id}/teams/${teamId}/leave`);
  return res.data;
};

/**
 * Remove a member from the team (leader only).
 */
export const removeTeamMember = async (
  id: string,
  teamId: string,
  userId: string
): Promise<ApiResponse<{ message: string }>> => {
  const res = await api.delete(
    `/hackathons/${id}/teams/${teamId}/members/${userId}`
  );
  return res.data;
};

/**
 * Disband a team (leader only). Refused server-side if the team has an
 * existing submission.
 */
export const disbandTeam = async (
  id: string,
  teamId: string
): Promise<ApiResponse<{ message: string }>> => {
  const res = await api.delete(`/hackathons/${id}/teams/${teamId}`);
  return res.data;
};

/**
 * Get current user's team for a hackathon
 */
export const getMyTeam = async (
  id: string
): Promise<ApiResponse<Team | null>> => {
  const res = await api.get(`/hackathons/${id}/my-team`);
  return res.data;
};

/**
 * Invite a user to join team
 */
export const inviteToTeam = async (
  id: string,
  teamId: string,
  inviteeIdentifier: string,
  message?: string
): Promise<ApiResponse<TeamInvitation>> => {
  const res = await api.post(`/hackathons/${id}/teams/${teamId}/invite`, {
    inviteeIdentifier,
    message,
  });
  return res.data;
};

/**
 * Get current user's team invitations
 */
export const getMyInvitations = async (
  id: string,
  status?: string
): Promise<GetInvitationsResponse> => {
  let url = `/hackathons/${id}/my-invitations`;
  if (status) url += `?status=${status}`;
  const res = await api.get(url);
  return res.data;
};

/**
 * Accept team invitation
 */
export const acceptInvitation = async (
  id: string,
  inviteId: string
): Promise<
  ApiResponse<{ message: string; teamId: string; invitation: TeamInvitation }>
> => {
  const res = await api.post(
    `/hackathons/${id}/invitations/${inviteId}/accept`
  );
  return res.data;
};

/**
 * Reject team invitation
 */
export const rejectInvitation = async (
  id: string,
  inviteId: string
): Promise<
  ApiResponse<{ message: string; teamId: string; invitation: TeamInvitation }>
> => {
  const res = await api.post(
    `/hackathons/${id}/invitations/${inviteId}/reject`
  );
  return res.data;
};

/**
 * Cancel team invitation (Leader only)
 */
export const cancelInvitation = async (
  id: string,
  inviteId: string
): Promise<ApiResponse<null>> => {
  const res = await api.delete(`/hackathons/${id}/invitations/${inviteId}`);
  return res.data;
};

/**
 * Get invitations sent by a team (Leader only)
 */
export const getTeamInvitations = async (
  id: string,
  teamId: string,
  status?: string
): Promise<GetInvitationsResponse> => {
  let url = `/hackathons/${id}/teams/${teamId}/invitations`;
  if (status) url += `?status=${status}`;
  const res = await api.get(url);
  return res.data;
};

/**
 * Toggle role hired status (Leader only)
 */
export const toggleRoleHired = async (
  id: string,
  teamId: string,
  skill: string
): Promise<ApiResponse<null>> => {
  const res = await api.patch(
    `/hackathons/${id}/teams/${teamId}/roles/toggle-hired`,
    { skill }
  );
  return res.data;
};

/**
 * Transfer team leadership
 */
export const transferLeadership = async (
  id: string,
  teamId: string,
  newLeaderId: string,
  reason?: string
): Promise<ApiResponse<{ message: string; team: Team }>> => {
  const res = await api.post(
    `/hackathons/${id}/teams/${teamId}/transfer-leadership`,
    {
      newLeaderId,
      reason,
    }
  );
  return res.data;
};

// --- Legacy Support Functions ---

export const trackContactClick = async (
  hackathonSlugOrId: string,
  postId: string,
  organizationId?: string
): Promise<ApiResponse<null>> => {
  return { success: true, data: null, message: 'Tracking click' };
};

export const deleteTeamPost = async (
  hackathonSlugOrId: string,
  postId: string,
  organizationId?: string
): Promise<ApiResponse<null>> => {
  return { success: true, data: null, message: 'Deleted' };
};
