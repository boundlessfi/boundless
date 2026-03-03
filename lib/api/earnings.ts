import { api, ApiResponse } from './api';
import { PublicEarningsResponse } from '@/types/earnings';

export interface GetPublicEarningsParams {
  username: string;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

export const getPublicEarnings = async ({
  username,
  limit = 100,
  offset = 0,
  signal,
}: GetPublicEarningsParams): Promise<ApiResponse<PublicEarningsResponse>> => {
  if (typeof username !== 'string') {
    throw new Error('Username is required and must be a string');
  }
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new Error('Username is required and must be a string');
  }

  const sanitizedLimit = Math.max(1, Math.min(limit, 100));
  const sanitizedOffset = Math.max(0, offset);

  const params = new URLSearchParams({
    username: trimmedUsername,
    limit: sanitizedLimit.toString(),
    offset: sanitizedOffset.toString(),
  });

  return api.get<PublicEarningsResponse>(
    `/users/earnings/public?${params.toString()}`,
    { signal }
  );
};
