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
  avatar?: string;
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
      avatar?: string;
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
      avatar?: string;
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
  votes: number | ParticipantVote[];
  comments: number | ParticipantComment[];
  submissionDate: string;
  status: 'submitted' | 'shortlisted' | 'disqualified';
  disqualificationReason?: string | null;
  reviewedBy?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  } | null;
  reviewedAt?: string | null;
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
      image?: string;
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
    avatar?: string;
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
  title: string;
  description: string;
  submitterName: string;
  submitterAvatar?: string;
  category?: string;
  categories?: string[];
  status?: 'Pending' | 'Approved' | 'Rejected';
  upvotes?: number;
  votes?: { current: number; total: number };
  comments?: number;
  submittedDate?: string;
  daysLeft?: number;
  score?: number;
  image?: string;
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
