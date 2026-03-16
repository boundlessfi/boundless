export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
  username?: string;
}

export interface Voter {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
  votedAt?: string;
  voteType?: 'positive' | 'negative';
}

export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar?: string | null;
  };
  createdAt: string;
  reactions?: {
    thumbsUp?: number;
    heart?: number;
  };
}

export interface Submission {
  id: string;
  projectName: string;
  category: string;
  description: string;
  votes: number;
  comments: number;
  submissionDate?: string;
  videoUrl?: string;
  introduction?: string;
  logo?: string;
  teamMembers?: TeamMember[];
  links?: Array<{ type: string; url: string }>;
  voters?: Voter[];
  commentsList?: Comment[];
}

export interface ReviewSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissions?: Submission[];
  currentIndex?: number;
  organizationId?: string;
  hackathonId?: string;
  participantId?: string;
  onSuccess?: () => void;
  onShortlist?: (submissionId: string) => void;
  onDisqualify?: (submissionId: string) => void;
}
