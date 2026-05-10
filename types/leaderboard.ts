import type { ReputationTier } from '@/lib/utils/reputation-tier';

export type { ReputationTier };

export type LeaderboardTimeframe =
  | 'ALL_TIME'
  | 'THIS_MONTH'
  | 'THIS_WEEK'
  | 'THIS_DAY';

export interface LeaderboardContributorStats {
  totalCompleted: number;
  totalEarnings: number;
  earningsCurrency: string;
  completionRate: number;
  averageCompletionTime: number;
  currentStreak: number;
  longestStreak: number;
  nextTierThreshold?: number;
  currentTierPoints?: number;
}

export interface LeaderboardContributor {
  id: string;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddress?: string;
  totalScore?: number;
  tier: ReputationTier;
  stats: LeaderboardContributorStats;
  topTags: string[];
  lastActiveAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  rankChange?: number;
  contributor: LeaderboardContributor;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalCount: number;
  currentUserRank?: number;
  lastUpdatedAt?: string;
}

export interface LeaderboardQueryParams {
  page?: number;
  limit?: number;
  timeframe?: LeaderboardTimeframe;
  tier?: ReputationTier;
}
