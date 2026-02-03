import api from './api';
import { ApiResponse } from '@/lib/api/types';
import { authClient } from '@/lib/auth-client';
import { User } from '@/types/user';
import { PublicUserProfile } from '@/features/projects/types';
import { GetMeResponse } from '@/lib/api/types';

/**
 * Get current user profile from backend API
 * This is still needed for fetching full user profile data beyond what Better Auth provides
 *
 * For client-side usage, cookies are automatically sent via withCredentials
 * For server-side usage, use getMeServer() from '@/lib/api/auth-server' instead
 */
export const getMe = async (): Promise<GetMeResponse> => {
  const res = await api.get<ApiResponse<GetMeResponse>>('/users/me');
  return res.data.data as GetMeResponse;
};

/**
 * Get user profile by username from backend API
 *
 * For client-side usage, cookies are automatically sent via withCredentials
 * For server-side usage, use getUserProfileByUsernameServer() from '@/lib/api/auth-server' instead
 */
export const getUserProfileByUsername = async (
  username: string
): Promise<PublicUserProfile> => {
  const res = await api.get<ApiResponse<PublicUserProfile>>(
    `/users/${username}`
  );
  return res.data.data as PublicUserProfile;
};

/**
 * Enhanced auth utilities
 */
export const refreshUserData = async (): Promise<void> => {
  await getMe();
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const session = await authClient.getSession();
    return !!(session && 'user' in session && session.user);
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
 * Update user profile request interface - matches API payload specification
 */
export interface UpdateUserProfileRequest {
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    discord?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
}

/**
 * Update user profile response interface
 */
export interface UpdateUserProfileResponse {
  success: boolean;
  data: User;
  message?: string;
  timestamp?: string;
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> => {
  const res = await api.put<User>('/users/profile', data);
  return {
    success: true,
    data: res.data,
    message: 'Profile updated successfully',
  };
};

/**
 * User settings interfaces
 */
export interface UserNotifications {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UpdateUserNotificationsResponse {
  userId?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPrivacy {
  publicProfile?: boolean;
  emailVisibility?: boolean;
  locationVisibility?: boolean;
  companyVisibility?: boolean;
  websiteVisibility?: boolean;
  socialLinksVisibility?: boolean;
}

export interface UserAppearance {
  theme?: 'light' | 'dark' | 'auto';
}

export interface UserPreferences {
  language?: string | null;
  timezone?: string;
  categories?: string[];
  skills?: string[];
}

export interface UserSettings {
  notifications?: UserNotifications;
  privacy?: UserPrivacy;
  appearance?: UserAppearance;
  preferences?: UserPreferences;
}

export interface UpdateUserSettingsRequest {
  notifications?: UserNotifications;
  privacy?: UserPrivacy;
  appearance?: UserAppearance;
  preferences?: UserPreferences;
}

export interface UpdateUserNotificationsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
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
  const res = await api.get<UserSettings>('/users/settings');
  return res.data;
};

export const updateAppearanceSettings = async (
  data: UserAppearance
): Promise<UserAppearance> => {
  const res = await api.put<UserAppearance>('/users/settings/appearance', data);
  return {
    theme: res.data.theme,
  };
};

export const updateNotificationsSettings = async (
  data: UserNotifications
): Promise<UpdateUserNotificationsResponse> => {
  const res = await api.put<UserNotifications>(
    '/users/settings/notifications',
    data
  );
  return {
    emailNotifications: res.data.emailNotifications,
    pushNotifications: res.data.pushNotifications,
  };
};

export const updatePrivacySettings = async (
  data: UserPrivacy
): Promise<UserPrivacy> => {
  const res = await api.put<UserPrivacy>('/users/settings/privacy', data);
  return {
    publicProfile: res.data.publicProfile,
    emailVisibility: res.data.emailVisibility,
    locationVisibility: res.data.locationVisibility,
    companyVisibility: res.data.companyVisibility,
    websiteVisibility: res.data.websiteVisibility,
    socialLinksVisibility: res.data.socialLinksVisibility,
  };
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
  avatarUrl: string;
  message?: string;
}

/**
 * Update user avatar
 * @param file - The image file to upload
 */
export const updateUserAvatar = async (
  avatar: File
): Promise<UpdateUserAvatarResponse> => {
  const formData = new FormData();
  formData.append('avatar', avatar);

  // Use axiosInstance directly for FormData uploads
  // Follow the same pattern as upload service
  const axiosInstance = (await import('./api')).default;

  const axiosRes = await axiosInstance.post<{
    success: boolean;
    avatarUrl: string;
    message?: string;
    path?: string;
  }>('/users/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    success: axiosRes.data.success ?? true,
    avatarUrl: axiosRes.data.avatarUrl ?? '',
    message: axiosRes.data.message,
  };
};
