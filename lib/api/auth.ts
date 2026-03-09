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
 * Get user settings from backend. Unwraps { success, data } response.
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const res = await api.get<ApiResponse<UserSettings>>('/users/settings');
  const raw = res.data as ApiResponse<UserSettings>;
  const data = raw?.data ?? (res.data as unknown as UserSettings);
  return {
    notifications: data?.notifications ?? {},
    privacy: data?.privacy ?? {},
    appearance: data?.appearance ?? {},
    preferences: data?.preferences ?? {},
  };
};

export const updateAppearanceSettings = async (
  data: UserAppearance
): Promise<UserAppearance> => {
  const res = await api.put<ApiResponse<UserAppearance>>(
    '/users/settings/appearance',
    data
  );
  const raw = res.data as ApiResponse<UserAppearance>;
  const payload = raw?.data ?? (res.data as unknown as UserAppearance);
  return { theme: payload?.theme ?? 'light' };
};

export const updateNotificationsSettings = async (
  data: UserNotifications
): Promise<UpdateUserNotificationsResponse> => {
  const res = await api.put<ApiResponse<UserNotifications>>(
    '/users/settings/notifications',
    data
  );
  const raw = res.data as ApiResponse<UserNotifications>;
  const payload = raw?.data ?? (res.data as unknown as UserNotifications);
  return {
    emailNotifications: payload?.emailNotifications ?? true,
    pushNotifications: payload?.pushNotifications ?? true,
  };
};

export const updatePrivacySettings = async (
  data: UserPrivacy
): Promise<UserPrivacy> => {
  const res = await api.put<ApiResponse<UserPrivacy>>(
    '/users/settings/privacy',
    data
  );
  const raw = res.data as ApiResponse<UserPrivacy>;
  const payload = raw?.data ?? (res.data as unknown as UserPrivacy);
  return {
    publicProfile: payload?.publicProfile,
    emailVisibility: payload?.emailVisibility,
    locationVisibility: payload?.locationVisibility,
    companyVisibility: payload?.companyVisibility,
    websiteVisibility: payload?.websiteVisibility,
    socialLinksVisibility: payload?.socialLinksVisibility,
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
/**
 * Two-factor authentication interfaces
 */
export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
}

export interface GetTotpUriResponse {
  totpURI: string;
}

export interface VerifyTotpResponse {
  status: boolean;
}

export interface EnableTwoFactorResponse {
  totpURI: string;
  backupCodes: string[];
}

export interface GenerateBackupCodesResponse {
  status: boolean;
  backupCodes: string[];
}

/**
 * AXIOS-BASED 2FA HELPERS
 *
 * Note: These functions use direct axios-based API calls instead of the Better Auth client plugin.
 * They are preserved for use in internal tools, CLI scripts, or specific out-of-UI contexts
 * where the standard authClient plugins are not appropriate.
 *
 * For standard UI components, prefer using `authClient.twoFactor.*`.
 */

/**
 * Get TOTP URI for setup
  const res = await api.post<GetTotpUriResponse>(
    '/auth/two-factor/get-totp-uri',
    { password }
  );
  return res.data.totpURI;
};

export const verifyTotp = async (
  code: string,
  trustDevice: boolean | null = null
): Promise<boolean> => {
  const res = await api.post<VerifyTotpResponse>(
    '/auth/two-factor/verify-totp',
    { code, trustDevice }
  );
  return res.data.status;
};

export const sendTwoFactorOtp = async (): Promise<boolean> => {
  const res = await api.post<{ status: boolean }>('/auth/two-factor/send-otp');
  return res.data.status;
};

export const verifyTwoFactorOtp = async (
  code: string,
  trustDevice: boolean | null = null
): Promise<{ token: string; user: User }> => {
  const res = await api.post<{ token: string; user: User }>(
    '/auth/two-factor/verify-otp',
    { code, trustDevice }
  );
  return res.data;
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (
  code: string,
  trustDevice: boolean | null = null,
  disableSession: boolean | null = null
): Promise<{
  user: User;
  session: { id: string; userId: string; token: string; expiresAt: Date };
}> => {
  const res = await api.post<{
    user: User;
    session: { id: string; userId: string; token: string; expiresAt: Date };
  }>('/auth/two-factor/verify-backup-code', {
    code,
    trustDevice,
    disableSession,
  });
  return res.data;
};

export const generateBackupCodes = async (
  password: string
): Promise<string[]> => {
  const res = await api.post<GenerateBackupCodesResponse>(
    '/auth/two-factor/generate-backup-codes',
    { password }
  );
  return res.data.backupCodes;
};

export const enableTwoFactor = async (
  password: string,
  issuer: string | null = 'Boundless'
): Promise<EnableTwoFactorResponse> => {
  const res = await api.post<EnableTwoFactorResponse>(
    '/auth/two-factor/enable',
    {
      password,
      issuer: issuer || 'Boundless',
    }
  );
  return res.data;
};

export const disableTwoFactor = async (password: string): Promise<boolean> => {
  const res = await api.post<{ status: boolean }>('/auth/two-factor/disable', {
    password,
  });
  return res.data.status;
};
