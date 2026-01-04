// Enums matching backend specification
export enum CommentEntityType {
  PROJECT = 'PROJECT',
  BOUNTY = 'BOUNTY',
  CROWDFUNDING_CAMPAIGN = 'CROWDFUNDING_CAMPAIGN',
  GRANT = 'GRANT',
  GRANT_APPLICATION = 'GRANT_APPLICATION',
  HACKATHON = 'HACKATHON',
  HACKATHON_SUBMISSION = 'HACKATHON_SUBMISSION',
}

export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
  PENDING_MODERATION = 'PENDING_MODERATION',
}

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  CELEBRATE = 'CELEBRATE',
  INSIGHTFUL = 'INSIGHTFUL',
  DISLIKE = 'DISLIKE',
  LAUGH = 'LAUGH',
  THUMBS_UP = 'THUMBS_UP',
  THUMBS_DOWN = 'THUMBS_DOWN',
  FIRE = 'FIRE',
  ROCKET = 'ROCKET',
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  COPYRIGHT_VIOLATION = 'COPYRIGHT_VIOLATION',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

// Base interfaces
export interface CommentUser {
  id: string;
  name: string;
  username?: string;
  image?: string;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: string;
}

export interface CommentReport {
  id: string;
  commentId: string;
  reportedBy: string;
  reporter: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewer?: {
    id: string;
    name: string;
    image?: string;
  };
  reviewedAt?: string;
  resolution?: string;
  createdAt: string;
}

// Main Comment interface matching actual backend API response
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  entityType: CommentEntityType;
  entityId: string;
  projectId?: string | null; // Legacy field, can be null
  bountyId?: string | null; // Legacy field, can be null
  parentId?: string | null;
  status: CommentStatus;
  moderatedAt?: string | null;
  moderatedBy?: string | null;
  moderationReason?: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  reactionCount: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  author: CommentUser;
  reactions: CommentReaction[]; // Actual reactions array
  reports: CommentReport[]; // Actual reports array
  _count: {
    replies: number;
    reactions: number;
    reports: number;
  };
  // Computed fields for UI (not in API response)
  userReaction?: ReactionType; // Current user's reaction (computed)
  replies?: Comment[]; // Nested replies (fetched separately)
}

// Legacy ProjectComment interface for backward compatibility
export interface ProjectComment {
  id: string;
  author: CommentUser;
  projectId: string;
  content: string;
  parentCommentId?: string;
  status: 'active' | 'deleted' | 'flagged' | 'hidden';
  isEdited: boolean;
  editedAt: string | null;
  // editHistory: {
  //   content: string;
  //   editedAt: string;
  // }[];
  reactionCounts: {
    LIKE: number;
    DISLIKE: number;
    HELPFUL: number;
  };
  totalReactions: number;
  replyCount: number;
  replies?: ProjectComment[]; // Nested replies
  createdAt: string;
  updatedAt: string;
  isSpam: boolean;
  reports: {
    userId: string;
    reason:
      | 'spam'
      | 'inappropriate'
      | 'harassment'
      | 'misinformation'
      | 'other';
    description?: string;
    createdAt: string;
  }[];
}

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
}

// Request/Response interfaces matching backend API
export interface CreateCommentRequest {
  content: string;
  entityType: CommentEntityType;
  entityId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface ReportCommentRequest {
  reason: ReportReason;
  description?: string;
}

export interface GetCommentsQuery {
  entityType?: CommentEntityType;
  entityId?: string;
  authorId?: string;
  parentId?: string;
  status?: CommentStatus;
  includeReactions?: boolean;
  includeReports?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddReactionRequest {
  reactionType: ReactionType;
}

export interface ModerationUpdateRequest {
  status: CommentStatus;
}

export interface ReportResolutionRequest {
  resolution: string;
  action: 'approve' | 'hide' | 'delete';
}

// Response Types matching backend API

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateCommentResponse {
  success: boolean;
  data: {
    comment: Comment;
    moderationResult: ModerationResult;
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface GetCommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    total: number;
    limit: number;
    offset: number;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface GetSingleCommentResponse {
  success: boolean;
  data: {
    comment: Comment;
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface UpdateCommentResponse {
  success: boolean;
  data: {
    comment: Comment;
    moderationResult: ModerationResult;
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  data: null;
  message: string;
  timestamp: string;
  path: string;
}

export interface AddReactionResponse {
  success: boolean;
  data: {
    reaction: CommentReaction;
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface RemoveReactionResponse {
  success: boolean;
  data: null;
  message: string;
  timestamp: string;
  path: string;
}

export interface ReportCommentResponse {
  success: boolean;
  data: {
    report: CommentReport;
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface GetReactionsResponse {
  success: boolean;
  data: {
    reactions: CommentReaction[];
  };
  message: string;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export type CommentApiResponse =
  | CreateCommentResponse
  | GetCommentsResponse
  | GetSingleCommentResponse
  | UpdateCommentResponse
  | DeleteCommentResponse
  | AddReactionResponse
  | RemoveReactionResponse
  | ReportCommentResponse
  | GetReactionsResponse
  | ApiErrorResponse;

// Hook Types for React/Next.js
export interface UseCommentsOptions {
  entityType: CommentEntityType;
  entityId: string;
  authorId?: string;
  parentId?: string;
  status?: CommentStatus;
  includeReactions?: boolean;
  includeReports?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export interface UseCommentsReturn {
  comments: Comment[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  pausePolling: () => void;
  resumePolling: () => void;
  isPolling: boolean;
}

export interface UseCreateCommentReturn {
  createComment: (data: CreateCommentRequest) => Promise<CreateCommentResponse>;
  loading: boolean;
  error: string | null;
}

export interface UseUpdateCommentReturn {
  updateComment: (
    commentId: string,
    data: UpdateCommentRequest
  ) => Promise<UpdateCommentResponse>;
  loading: boolean;
  error: string | null;
}

export interface UseDeleteCommentReturn {
  deleteComment: (commentId: string) => Promise<DeleteCommentResponse>;
  loading: boolean;
  error: string | null;
}

export interface UseReportCommentReturn {
  reportComment: (
    commentId: string,
    data: ReportCommentRequest
  ) => Promise<ReportCommentResponse>;
  loading: boolean;
  error: string | null;
}

export interface UseReactionsReturn {
  addReaction: (
    commentId: string,
    reactionType: ReactionType
  ) => Promise<AddReactionResponse>;
  removeReaction: (
    commentId: string,
    reactionType: ReactionType
  ) => Promise<RemoveReactionResponse>;
  getReactions: (commentId: string) => Promise<GetReactionsResponse>;
  loading: boolean;
  error: string | null;
}

// Validation and Content Filtering
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ContentValidationRules {
  minLength: number;
  maxLength: number;
  maxLinks: number;
  prohibitedPatterns: RegExp[];
}
