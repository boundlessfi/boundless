import { api, ApiResponse } from './api';
import {
  EntityType,
  ApiFollowResponse,
  ApiUnfollowResponse,
  ApiFollowStatsResponse,
  ApiFollowStatusResponse,
  FollowWithEntity,
} from '@/types/follow';

// Follow an entity
export const followEntity = async (
  entityType: EntityType,
  entityId: string
): Promise<ApiResponse<ApiFollowResponse>> => {
  return api.post<ApiFollowResponse>(`/follows/${entityType}/${entityId}`);
};

// Unfollow an entity
export const unfollowEntity = async (
  entityType: EntityType,
  entityId: string
): Promise<ApiResponse<ApiUnfollowResponse>> => {
  return api.delete<ApiUnfollowResponse>(`/follows/${entityType}/${entityId}`);
};

// Get user's following list
export const getUserFollowing = async (
  userId: string,
  entityType?: EntityType,
  page = 1,
  limit = 20
): Promise<ApiResponse<FollowWithEntity[]>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (entityType) {
    params.append('entityType', entityType);
  }

  const url = `/follows/user/${userId}/following?${params.toString()}`;
  return api.get<FollowWithEntity[]>(url);
};

// Get entity followers
export const getEntityFollowers = async (
  entityType: EntityType,
  entityId: string,
  page = 1,
  limit = 20
): Promise<ApiResponse<FollowWithEntity[]>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `/follows/entity/${entityType}/${entityId}/followers?${params.toString()}`;
  return api.get<FollowWithEntity[]>(url);
};

// Get follow statistics
export const getFollowStats = async (
  userId: string
): Promise<ApiResponse<ApiFollowStatsResponse>> => {
  return api.get<ApiFollowStatsResponse>(`/follows/user/${userId}/stats`);
};

// Check follow status
export const checkFollowStatus = async (
  entityType: EntityType,
  entityId: string
): Promise<ApiResponse<ApiFollowStatusResponse>> => {
  return api.get<ApiFollowStatusResponse>(
    `/follows/${entityType}/${entityId}/check`
  );
};

// Follow API client object
export const followApi = {
  followEntity,
  unfollowEntity,
  getUserFollowing,
  getEntityFollowers,
  getFollowStats,
  checkFollowStatus,
};
