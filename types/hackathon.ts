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

export interface Hackathon {
  id: string;
  title: string;
  tagline: string;
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
}
