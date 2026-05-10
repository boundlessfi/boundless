export type ReputationTier =
  | 'NEWCOMER'
  | 'CONTRIBUTOR'
  | 'ESTABLISHED'
  | 'EXPERT'
  | 'LEGEND';

export function getReputationTier(reputation: number): ReputationTier {
  if (reputation >= 10000) return 'LEGEND';
  if (reputation >= 5000) return 'EXPERT';
  if (reputation >= 2000) return 'ESTABLISHED';
  if (reputation >= 500) return 'CONTRIBUTOR';
  return 'NEWCOMER';
}

export const TIER_STYLES: Record<
  ReputationTier,
  { badge: string; label: string }
> = {
  NEWCOMER: {
    badge: 'border-zinc-500 bg-zinc-800/50 text-zinc-400',
    label: 'Newcomer',
  },
  CONTRIBUTOR: {
    badge: 'border-blue-500/50 bg-blue-900/20 text-blue-400',
    label: 'Contributor',
  },
  ESTABLISHED: {
    badge: 'border-purple-500/50 bg-purple-900/20 text-purple-400',
    label: 'Established',
  },
  EXPERT: {
    badge: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
    label: 'Expert',
  },
  LEGEND: {
    badge: 'border-yellow-400/50 bg-yellow-900/20 text-yellow-300',
    label: 'Legend',
  },
};

export const TIER_THRESHOLDS: Record<ReputationTier, string> = {
  NEWCOMER: '0 – 499',
  CONTRIBUTOR: '500 – 1,999',
  ESTABLISHED: '2,000 – 4,999',
  EXPERT: '5,000 – 9,999',
  LEGEND: '10,000+',
};
