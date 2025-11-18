/**
 * Notification Types
 * All notification types supported by the backend API
 */
export enum NotificationType {
  // Organization Notifications
  ORGANIZATION_CREATED = 'ORGANIZATION_CREATED',
  ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED',
  ORGANIZATION_DELETED = 'ORGANIZATION_DELETED',
  ORGANIZATION_INVITE_SENT = 'ORGANIZATION_INVITE_SENT',
  ORGANIZATION_INVITE_ACCEPTED = 'ORGANIZATION_INVITE_ACCEPTED',
  ORGANIZATION_MEMBER_ADDED = 'ORGANIZATION_MEMBER_ADDED',
  ORGANIZATION_MEMBER_REMOVED = 'ORGANIZATION_MEMBER_REMOVED',
  ORGANIZATION_ROLE_CHANGED = 'ORGANIZATION_ROLE_CHANGED',

  // Hackathon Notifications
  HACKATHON_CREATED = 'HACKATHON_CREATED',
  HACKATHON_UPDATED = 'HACKATHON_UPDATED',
  HACKATHON_STATUS_CHANGED = 'HACKATHON_STATUS_CHANGED',
  HACKATHON_PUBLISHED = 'HACKATHON_PUBLISHED',
  HACKATHON_ACTIVE = 'HACKATHON_ACTIVE',
  HACKATHON_COMPLETED = 'HACKATHON_COMPLETED',
  HACKATHON_CANCELLED = 'HACKATHON_CANCELLED',
  HACKATHON_REGISTERED = 'HACKATHON_REGISTERED',
  HACKATHON_SUBMISSION_SUBMITTED = 'HACKATHON_SUBMISSION_SUBMITTED',
  HACKATHON_SUBMISSION_SHORTLISTED = 'HACKATHON_SUBMISSION_SHORTLISTED',
  HACKATHON_SUBMISSION_DISQUALIFIED = 'HACKATHON_SUBMISSION_DISQUALIFIED',
  HACKATHON_WINNERS_ANNOUNCED = 'HACKATHON_WINNERS_ANNOUNCED',
  HACKATHON_DEADLINE_APPROACHING = 'HACKATHON_DEADLINE_APPROACHING',

  // Team Invitation Notifications
  TEAM_INVITATION_SENT = 'TEAM_INVITATION_SENT',
  TEAM_INVITATION_ACCEPTED = 'TEAM_INVITATION_ACCEPTED',
  TEAM_INVITATION_DECLINED = 'TEAM_INVITATION_DECLINED',
  TEAM_INVITATION_EXPIRED = 'TEAM_INVITATION_EXPIRED',
  TEAM_INVITATION_CANCELLED = 'TEAM_INVITATION_CANCELLED',

  // Project Status
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_VERIFIED = 'PROJECT_VERIFIED',
  PROJECT_APPROVED = 'PROJECT_APPROVED',
  PROJECT_REJECTED = 'PROJECT_REJECTED',
  PROJECT_FUNDED = 'PROJECT_FUNDED',
  PROJECT_COMPLETED = 'PROJECT_COMPLETED',
  PROJECT_CANCELLED = 'PROJECT_CANCELLED',

  // Funding Status
  FUNDING_RECEIVED = 'FUNDING_RECEIVED',
  FUNDING_GOAL_MET = 'FUNDING_GOAL_MET',
  FUNDING_FAILED = 'FUNDING_FAILED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  FUNDING_DEADLINE_APPROACHING = 'FUNDING_DEADLINE_APPROACHING',

  // Voting Status
  VOTING_STARTED = 'VOTING_STARTED',
  VOTING_ENDED = 'VOTING_ENDED',
  VOTE_RECEIVED = 'VOTE_RECEIVED',
  VOTING_THRESHOLD_MET = 'VOTING_THRESHOLD_MET',

  // Milestone Status
  MILESTONE_CREATED = 'MILESTONE_CREATED',
  MILESTONE_UPDATED = 'MILESTONE_UPDATED',
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
  MILESTONE_DEADLINE_APPROACHING = 'MILESTONE_DEADLINE_APPROACHING',
  MILESTONE_FUNDS_RELEASED = 'MILESTONE_FUNDS_RELEASED',

  // Interaction Notifications
  COMMENT_RECEIVED = 'COMMENT_RECEIVED',
  COMMENT_REPLY = 'COMMENT_REPLY',
  COMMENT_MENTION = 'COMMENT_MENTION',
  REACTION_RECEIVED = 'REACTION_RECEIVED',

  // Account Notifications
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

/**
 * Notification data structure matching backend API response
 */
export interface Notification {
  _id: string;
  userId: {
    type: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  data: {
    // Organization fields
    organizationId?: string;
    organizationName?: string;
    // Hackathon fields
    hackathonId?: string;
    hackathonName?: string;
    hackathonSlug?: string;
    // Team invitation fields
    teamInvitationId?: string;
    // Project fields
    projectId?: string;
    projectName?: string;
    // Member fields
    memberEmail?: string;
    role?: string;
    oldRole?: string;
    newRole?: string;
    // Submission fields
    submissionStatus?: string;
    deadlineType?: string;
    // Status change fields
    oldStatus?: string;
    newStatus?: string;
    isWinner?: boolean;
    // Existing fields
    commentId?: string;
    milestoneId?: string;
    amount?: number;
    transactionHash?: string;
    [key: string]: unknown;
  };
  read: boolean;
  readAt: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
}

/**
 * Paginated notifications response
 */
export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request body for marking notifications as read
 */
export interface MarkAsReadRequest {
  ids?: string[];
  all?: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

/**
 * Update notification preferences request
 */
export interface UpdatePreferencesRequest {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}
