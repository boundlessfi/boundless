// Follow system types based on the API specification

export type EntityType =
  | 'USER'
  | 'PROJECT'
  | 'ORGANIZATION'
  | 'CROWDFUNDING_CAMPAIGN'
  | 'BOUNTY'
  | 'GRANT'
  | 'HACKATHON';

export interface Follow {
  id: string;
  followerId: string;
  entityType: EntityType;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowWithEntity extends Follow {
  followedAt: string;
  entity: {
    id: string;
    title?: string;
    tagline?: string;
    banner?: string;
    logo?: string;
    category?: string;
    status?: string;
    name?: string;
    username?: string;
    image?: string;
  };
}

export interface FollowStats {
  following: number;
  followers: number;
}

export interface FollowStatus {
  isFollowing: boolean;
}

export interface FollowButtonProps {
  entityType: EntityType;
  entityId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
  className?: string;
}

export interface FollowStatsProps {
  userId: string;
  className?: string;
}

export interface FollowingListProps {
  userId: string;
  entityType?: EntityType;
  className?: string;
}

export interface FollowersListProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
}

export interface EntityCardProps {
  entity: FollowWithEntity['entity'];
  entityType: EntityType;
  followedAt: string;
  className?: string;
}

export interface UserCardProps {
  user: FollowWithEntity['entity'];
  followedAt: string;
  className?: string;
}

// API Response types
export interface ApiFollowResponse {
  id: string;
  followerId: string;
  entityType: EntityType;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUnfollowResponse {
  success: boolean;
}

export interface ApiFollowListResponse {
  data: FollowWithEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiFollowStatsResponse extends FollowStats {}

export interface ApiFollowStatusResponse extends FollowStatus {}

// Error types
export interface FollowApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Hook types
export interface UseFollowReturn {
  isFollowing: boolean;
  isLoading: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  toggleFollow: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export interface UseFollowStatsReturn {
  stats: FollowStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseFollowingListReturn {
  following: FollowWithEntity[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseFollowersListReturn {
  followers: FollowWithEntity[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}
