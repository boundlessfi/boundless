export type EarningSource =
  | 'hackathons'
  | 'grants'
  | 'crowdfunding'
  | 'bounties';

export interface EarningActivity {
  source: EarningSource;
  title: string;
  amount: number;
  currency: string;
  occurredAt: string;
}

export interface EarningsBreakdown {
  hackathons: number;
  grants: number;
  crowdfunding: number;
  bounties: number;
}

export interface PublicEarningsResponse {
  summary: {
    totalEarned: number;
  };
  breakdown: EarningsBreakdown;
  activities: EarningActivity[];
}
