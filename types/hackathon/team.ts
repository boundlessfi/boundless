// Team Formation Types
// Note: TeamRecruitmentPost, CreateTeamPostRequest, UpdateTeamPostRequest, and GetTeamPostsOptions
// are defined in lib/api/hackathons/teams.ts and exported from there

export interface AcceptTeamInvitationRequest {
  invitationToken: string;
}
