export interface Participant {
  id: string | number;
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
}

export interface CommentUser {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  };
}

export interface CommentReactionCounts {
  LIKE: number;
  DISLIKE: number;
  HELPFUL: number;
}

export interface CommentEditHistory {
  content: string;
  editedAt: string;
}

export interface CommentReport {
  userId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
  createdAt: string;
}

export interface Discussion {
  _id: string;
  userId: CommentUser;
  projectId: string;
  content: string;
  parentCommentId?: string;
  status: 'active' | 'deleted' | 'flagged' | 'hidden';
  editHistory: CommentEditHistory[];
  reactionCounts: CommentReactionCounts;
  totalReactions: number;
  replyCount: number;
  replies: Discussion[];
  createdAt: string;
  updatedAt: string;
  isSpam: boolean;
  reports: CommentReport[];
}

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

export type ParticipantType = 'team' | 'individual' | 'team_or_individual';

export interface HackathonSubmissionRequirements {
  requireGithub?: boolean;
  requireDemoVideo?: boolean;
  requireOtherLinks?: boolean;
}

export interface HackathonTabVisibility {
  detailsTab?: boolean;
  participantsTab?: boolean;
  resourcesTab?: boolean;
  submissionTab?: boolean;
  announcementsTab?: boolean;
  discussionTab?: boolean;
  winnersTab?: boolean;
  sponsorsTab?: boolean;
  joinATeamTab?: boolean;
  rulesTab?: boolean;
}

export interface HackathonParticipationSettings {
  participantType?: ParticipantType;
  teamMin?: number;
  teamMax?: number;
  about?: string;
  submissionRequirements?: HackathonSubmissionRequirements;
  tabVisibility?: HackathonTabVisibility;
}

export interface Hackathon {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  slug?: string;
  imageUrl: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  participants: number;
  totalPrizePool: string;
  deadline: string;
  categories: string[];
  startDate: string;
  endDate: string;
  organizer: string;
  featured?: boolean;
  resources?: string[];
  participantType?: ParticipantType;
  tabVisibility?: Pick<HackathonTabVisibility, 'joinATeamTab'>;
  participation?: HackathonParticipationSettings;
}
