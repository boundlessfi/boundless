import api from './api';
import { GetMeResponse } from '@/lib/api/types';
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
