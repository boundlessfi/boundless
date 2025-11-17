import api from './api';
import { GetMeResponse, ApiResponse } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Get current user profile from backend API
 * This is still needed for fetching full user profile data beyond what Better Auth provides
 *
 * For client-side usage, cookies are automatically sent via withCredentials
 * For server-side usage, use getMeServer() from '@/lib/api/auth-server' instead
 */
export const getMe = async (): Promise<GetMeResponse> => {
  const res = await api.get<{
    success: boolean;
    data: GetMeResponse;
    message?: string;
    timestamp: string;
    path?: string;
  }>('/me');
  return res.data.data;
};

/**
 * Get user profile by username from backend API
 *
 * For client-side usage, cookies are automatically sent via withCredentials
 * For server-side usage, use getUserProfileByUsernameServer() from '@/lib/api/auth-server' instead
 */
export const getUserProfileByUsername = async (
  username: string
): Promise<GetMeResponse> => {
  const res = await api.get<{
    success: boolean;
    data: GetMeResponse;
    message?: string;
    timestamp: string;
    path?: string;
  }>(`/auth/profile/${username}`);
  return res.data.data;
};

/**
 * Enhanced auth utilities
 */
export const refreshUserData = async (): Promise<void> => {
  const authStore = useAuthStore.getState();
  await authStore.refreshUser();
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const authStore = useAuthStore.getState();
    const { isAuthenticated } = authStore;

    if (!isAuthenticated) {
      return false;
    }

    // Try to refresh user data to verify session is still valid
    // Better Auth handles session validation via cookies
    await authStore.refreshUser();
    return true;
  } catch {
    return false;
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  // Better Auth handles authentication via cookies automatically
  // No need to return Authorization headers
  return {};
};

/**
 * Update user profile request interface
 */
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
}

/**
 * Update user profile response interface
 */
export interface UpdateUserProfileResponse {
  success: boolean;
  data: GetMeResponse;
  message?: string;
  timestamp?: string;
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> => {
  const res = await api.put<ApiResponse<GetMeResponse>>('/users/profile', data);
  return {
    success: res.data.success ?? true,
    data: res.data.data ?? (res.data as unknown as GetMeResponse),
    message: res.data.message,
  };
};

/**
 * User settings interfaces
 */
export interface UserNotifications {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}

export interface UserPrivacy {
  profileVisibility?: 'PUBLIC' | 'PRIVATE';
  showWalletAddress?: boolean;
  showContributions?: boolean;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  theme?: 'LIGHT' | 'DARK';
}

export interface UserSettings {
  notifications?: UserNotifications;
  privacy?: UserPrivacy;
  preferences?: UserPreferences;
}

export interface UpdateUserSettingsRequest {
  notifications?: UserNotifications;
  privacy?: UserPrivacy;
  preferences?: UserPreferences;
}

export interface UpdateUserSettingsResponse {
  success: boolean;
  data: UserSettings;
  message?: string;
  timestamp?: string;
}

/**
 * Get user settings
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const res = await api.get<ApiResponse<UserSettings>>('/users/settings');
  return res.data.data ?? {};
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  data: UpdateUserSettingsRequest
): Promise<UpdateUserSettingsResponse> => {
  const res = await api.put<ApiResponse<UserSettings>>('/users/settings', data);
  return {
    success: res.data.success ?? true,
    data: res.data.data ?? {},
    message: res.data.message,
  };
};

/**
 * Security settings interfaces
 */
export interface UpdateUserSecurityRequest {
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
  twoFactorCode?: string;
}

export interface UpdateUserSecurityResponse {
  success: boolean;
  data: { message: string };
  message?: string;
  timestamp?: string;
}

/**
 * Update user security settings
 */
export const updateUserSecurity = async (
  data: UpdateUserSecurityRequest
): Promise<UpdateUserSecurityResponse> => {
  const res = await api.put<ApiResponse<{ message: string }>>(
    '/users/security',
    data
  );
  return {
    success: res.data.success ?? true,
    data: res.data.data ?? {
      message: 'Security settings updated successfully',
    },
    message: res.data.message,
  };
};

/**
 * Update user avatar response interface
 */
export interface UpdateUserAvatarResponse {
  success: boolean;
  data: GetMeResponse;
  message?: string;
  timestamp?: string;
}

/**
 * Update user avatar
 * @param file - The image file to upload
 */
export const updateUserAvatar = async (
  file: File
): Promise<UpdateUserAvatarResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);

  // Use axiosInstance directly for FormData uploads
  // Follow the same pattern as upload service
  const axiosInstance = (await import('./api')).default;

  const axiosRes = await axiosInstance.put<{
    success: boolean;
    data: GetMeResponse;
    message?: string;
    timestamp: string;
    path?: string;
  }>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    success: axiosRes.data.success ?? true,
    data: axiosRes.data.data ?? (axiosRes.data as unknown as GetMeResponse),
    message: axiosRes.data.message,
    timestamp: axiosRes.data.timestamp,
  };
};
