import { api } from '../api';
import type { Schemas } from '../openapi';

export type EarningActivity = Schemas['EarningActivityDto'];

export type EarningsData = Schemas['EarningsResponseDto'];

export type GetEarningsResponse =
  | { success: true; data: EarningsData; message?: string }
  | { success: false; error: string; message?: string };

/**
 * Get user earnings data
 */
export const getUserEarnings = async (): Promise<GetEarningsResponse> => {
  const res = await api.get<GetEarningsResponse>('/users/earnings');
  return res.data;
};
