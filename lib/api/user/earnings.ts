import api from '../api';
import { ApiResponse, EarningsData } from '../types';

export interface GetUserEarningsResponse extends ApiResponse<EarningsData> {
  success: true;
  data: EarningsData;
  message: string;
}

export interface ClaimEarningData {
  activityId: string;
  status: string;
  transactionHash?: string;
}

export interface ClaimEarningResponse extends ApiResponse<ClaimEarningData> {
  success: boolean;
  message: string;
}

/**
 * Get user earnings summary, source breakdown, and activity feed
 */
export const getUserEarnings = async (): Promise<GetUserEarningsResponse> => {
  const res = await api.get('/user/earnings');
  return res.data;
};

/**
 * Claim a specific earning by activity ID
 */
export const claimEarning = async (
  activityId: string
): Promise<ClaimEarningResponse> => {
  const res = await api.post(`/user/earnings/${activityId}/claim`);
  return res.data;
};
