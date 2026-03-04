// Main Hackathon API - Barrel Export
// This is the new entry point for all hackathon API operations

// Re-export all types from types/hackathon
export type {
  // Core types
  Hackathon,
  HackathonVenue,
  Venue, // Alias for backward compatibility
  HackathonInformation,
  HackathonPhase,
  HackathonTimeline,
  SubmissionRequirements,
  TabVisibility,
  HackathonParticipation,
  PrizeTier,
  HackathonRewards,
  JudgingCriterion,
  HackathonJudging,
  SponsorPartner,
  HackathonCollaboration,
  HackathonResourceItem,
  HackathonResources,
  HackathonResourceDocument,
  HackathonStatistics,
  TimeSeriesDataPoint,
  HackathonTimeSeriesData,
  PublishHackathonRequest,
  UpdateHackathonRequest,
  // Draft types
  HackathonDraftData,
  HackathonDraft,
  CreateDraftRequest,
  UpdateDraftRequest,
  // Participant types
  ParticipantDisplay,
  ParticipantTeamMember,
  ParticipantVote,
  ParticipantComment,
  ParticipantSubmission,
  Participant,
  ParticipantsData,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  VoteSubmissionRequest,
  SubmissionCardProps,
  ParticipantsResponse,
  // Judging types
  CriterionScore,
  JudgeScore,
  JudgingSubmission,
  SubmissionScoresResponse,
  GradeSubmissionRequest,
  GradeSubmissionResponse,
  // Rewards types
  AssignRanksRequest,
  AssignRanksResponse,
  HackathonEscrowData,
  CreateWinnerMilestonesRequest,
  CreateWinnerMilestonesResponse,
  // Team types
  AcceptTeamInvitationRequest,
} from '@/types/hackathon';

// Re-export enums (these need special handling)
export {
  HackathonCategory,
  ParticipantType,
  VenueType,
} from '@/types/hackathon';

// Re-export all API functions and response types
export * from './core';
export * from './participants';
export * from './judging';
export * from './rewards';
export * from './teams';
export * from './resources';
export * from './announcements';
