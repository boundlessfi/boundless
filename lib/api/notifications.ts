import api from './api';
import { ApiResponse, ErrorResponse } from './types';
import type {
  NotificationsResponse,
  MarkAsReadRequest,
  UpdatePreferencesRequest,
  NotificationPreferences,
} from '@/types/notifications';

/**
 * Get paginated list of notifications for the authenticated user
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 10
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get<NotificationsResponse>(
    `/notifications?${params.toString()}`
  );

  // Backend returns { data, total, page, limit } directly
  // The api.get wrapper returns ApiResponse<T>, so res.data is the actual response
  if (res.data && 'data' in res.data) {
    return res.data as NotificationsResponse;
  }

  // Fallback: if the response structure is different, return as-is
  return res.data as NotificationsResponse;
};

/**
 * Mark one or more notifications as read
 */
export const markAsRead = async (options: MarkAsReadRequest): Promise<void> => {
  const res = await api.put<{ message: string }>(
    '/notifications/read',
    options
  );
  // Backend returns { message: string } or wrapped in ApiResponse
  if (
    !res.data ||
    (typeof res.data === 'object' && 'success' in res.data && !res.data.success)
  ) {
    throw new Error('Failed to mark notifications as read');
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  const res = await api.put<{ message: string }>('/notifications/read', {
    all: true,
  });
  // Backend returns { message: string } or wrapped in ApiResponse
  if (
    !res.data ||
    (typeof res.data === 'object' && 'success' in res.data && !res.data.success)
  ) {
    throw new Error('Failed to mark all notifications as read');
  }
};

/**
 * Update user notification preferences
 */
export const updatePreferences = async (
  preferences: UpdatePreferencesRequest
): Promise<void> => {
  const res = await api.put<{ message: string }>(
    '/notifications/preference',
    preferences
  );
  // Backend returns { message: string } or wrapped in ApiResponse
  if (
    !res.data ||
    (typeof res.data === 'object' && 'success' in res.data && !res.data.success)
  ) {
    throw new Error('Failed to update notification preferences');
  }
};

/**
 * Get user notification preferences
 */
export const getPreferences = async (): Promise<NotificationPreferences> => {
  const res = await api.get<
    NotificationPreferences | ApiResponse<NotificationPreferences>
  >('/notifications/preference');
  // Backend returns NotificationPreferences directly or wrapped
  if (res.data && typeof res.data === 'object') {
    // If wrapped in ApiResponse, extract data
    if (
      'data' in res.data &&
      'success' in res.data &&
      'timestamp' in res.data
    ) {
      const apiResponse = res.data as ApiResponse<NotificationPreferences>;
      if (apiResponse.data) {
        return apiResponse.data;
      }
    }
    // If direct response (NotificationPreferences)
    if ('email' in res.data && 'push' in res.data && 'inApp' in res.data) {
      return res.data as NotificationPreferences;
    }
  }
  throw new Error('Invalid preferences response format');
};

// Error handling utilities
export const isNotificationError = (error: unknown): error is ErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'statusCode' in error
  );
};

export const handleNotificationError = (error: unknown): never => {
  if (isNotificationError(error)) {
    throw new Error(`${error.message} (${error.statusCode})`);
  }
  throw new Error('An unexpected error occurred');
};
