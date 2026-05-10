import api from './api';
import type {
  LeaderboardResponse,
  LeaderboardQueryParams,
} from '@/types/leaderboard';

export async function getLeaderboard(
  params: LeaderboardQueryParams = {}
): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.timeframe) query.set('timeframe', params.timeframe);
  if (params.tier) query.set('tier', params.tier);

  const url = `/leaderboard${query.toString() ? `?${query}` : ''}`;
  const response = await api.get(url);

  // response.data = { success, message, data: LeaderboardResponse, meta }
  const envelope = response?.data as
    | { success?: boolean; data?: LeaderboardResponse }
    | undefined;
  if (
    envelope?.data &&
    typeof envelope.data === 'object' &&
    'entries' in envelope.data
  ) {
    return envelope.data;
  }
  // fallback: response.data already is the payload
  return response?.data as LeaderboardResponse;
}
