import api from './api';
import { GetMeResponse } from '@/lib/api/types';
import { getServerAuthHeaders } from '@/lib/auth/server-auth';

/**
 * Server-side version of getMe() that forwards cookies from request headers
 * Use this in server components and server actions
 *
 * This file is server-only and should not be imported in client components
 */
export const getMeServer = async (): Promise<GetMeResponse> => {
  // Get cookies from request headers to forward to API
  const authHeaders = await getServerAuthHeaders();

  const res = await api.get<{
    success: boolean;
    data: GetMeResponse;
    message?: string;
    timestamp: string;
    path?: string;
  }>('/me', {
    headers: authHeaders,
  });
  return res.data.data;
};

/**
 * Server-side version of getUserProfileByUsername() that forwards cookies from request headers
 * Use this in server components and server actions
 */
export const getUserProfileByUsernameServer = async (
  username: string
): Promise<GetMeResponse> => {
  // Get cookies from request headers to forward to API
  const authHeaders = await getServerAuthHeaders();

  const res = await api.get<{
    success: boolean;
    data: GetMeResponse;
    message?: string;
    timestamp: string;
    path?: string;
  }>(`/auth/profile/${username}`, {
    headers: authHeaders,
  });
  return res.data.data;
};
