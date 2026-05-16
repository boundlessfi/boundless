// Participant and Submission Types

// Display/UI Participant interface (for UI components)
export interface ParticipantDisplay {
  id: string | number;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  joinedDate?: string;
  role?: string;
  description?: string;
  categories?: string[];
  projects?: number;
  followers?: number;
  following?: number;
  hasSubmitted?: boolean;
  teamId?: string | null;
  teamName?: string | null;
  isIndividual?: boolean;
}

export interface ParticipantTeamMember {
  userId: string;
  name: string;
  username: string;
  role: string;
  avatar?: string | null;
}

export interface ParticipantVote {
  id: string;
  userId: string;
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string | null;
    };
    email: string;
  };
  value: number;
  createdAt: string;
}

export interface ParticipantComment {
  id: string;
  userId: string;
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string | null;
    };
    email: string;
  };
  content: string;
  reactionCounts?: {
    LIKE?: number;
    DISLIKE?: number;
    HELPFUL?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantSubmission {
  id: string;
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links?: Array<{ type: string; url: string }>;
  votes?: number | ParticipantVote[];
  comments?: number | ParticipantComment[];
  submissionDate?: string;
  status: 'submitted' | 'shortlisted' | 'disqualified' | string;
  disqualificationReason?: string | null;
  reviewedBy?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string | null;
    };
    email: string;
  } | null;
  reviewedAt?: string | null;
  /** Track entries on this submission. Populated by the backend when the
   *  submitter opts into tracks; wonRank is stamped at publish time. */
  trackEntries?: SubmissionTrackEntry[];
  /** Overall placement (1, 2, 3...). Null until results are published. */
  rank?: number | null;

  // ── Phase A submission polish ──
  tagline?: string;
  builtWith?: string[];
  screenshots?: string[];
  license?: string;
  /** ISO timestamp set when the submitter ticked the originality attestation. */
  codeAttestedAt?: string | null;
}

export interface Participant {
  id: string;
  userId: string;
  hackathonId: string;
  organizationId: string;
  user: {
    id: string;
    profile: {
      name: string;
      username: string;
      image?: string | null;
      skills?: string[];
    };
    email: string;
  };
  socialLinks?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
  participationType: 'individual' | 'team';
  teamId?: string;
  teamName?: string;
  teamMembers?: ParticipantTeamMember[];
  submission?: ParticipantSubmission;
  registeredAt: string;
  submittedAt?: string;
}

export interface ParticipantsData {
  participants: Participant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  availableSkills?: string[];
}

export interface CreateSubmissionRequest {
  hackathonId: string;
  organizationId: string;
  projectId?: string;
  participationType: 'INDIVIDUAL' | 'TEAM';
  teamId?: string;
  teamName?: string;
  teamMembers?: Array<{
    userId: string;
    name: string;
    username?: string;
    role: string;
    avatar?: string | null;
  }>;
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links: Array<{ type: string; url: string }>;
  socialLinks?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
  /** Optional track opt-in. Capped by the hackathon's tracksMaxPerSubmission. */
  trackIds?: string[];

  /** Per-track answers (Phase B). Keyed by trackId. */
  trackAnswers?: Record<
    string,
    {
      promptAnswer?: string;
      customAnswers?: Record<string, string>;
      artifacts?: Record<string, string>;
    }
  >;

  // ── Phase A submission polish ──
  /** Short elevator pitch (~160 chars). */
  tagline?: string;
  /** Free-form tech-stack chips. */
  builtWith?: string[];
  /** Up to 5 screenshot URLs. */
  screenshots?: string[];
  /** License code (MIT / Apache-2.0 / GPL-3.0 / BSD-3 / PROPRIETARY / OTHER). */
  license?: string;
  /** True when the submitter has ticked the originality attestation. */
  codeAttested?: boolean;
}

export interface SubmissionTrackEntry {
  trackId: string;
  trackSlug: string;
  trackName: string;
  wonRank: number | null;
}

export interface UpdateSubmissionRequest extends CreateSubmissionRequest {
  submissionId: string;
}

export interface VoteSubmissionRequest {
  value: 1 | -1; // 1 for upvote, -1 for downvote
}

// UI Component Types
export interface SubmissionCardProps {
  _id?: string;
  projectName: string;
  description: string;
  submitterName: string;
  submitterAvatar?: string | null;
  category?: string;
  categories?: string[];
  status?: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED';
  upvotes?: number;
  votes?: { current: number; total: number };
  comments?: number;
  submittedDate?: string;
  daysLeft?: number;
  score?: number;
  logo?: string;
  onViewClick?: () => void;
  onUpvoteClick?: () => void;
  onCommentClick?: () => void;
  hasUserUpvoted?: boolean;
}

export interface ParticipantsResponse {
  success: boolean;
  data: ParticipantsData;
  message: string;
  timestamp?: string;
  path?: string;
}
