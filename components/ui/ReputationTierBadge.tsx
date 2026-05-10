import { cn } from '@/lib/utils';
import {
  getReputationTier,
  TIER_STYLES,
  type ReputationTier,
} from '@/lib/utils/reputation-tier';
import { Badge } from './badge';

interface ReputationTierBadgeProps {
  /** Pass either a raw reputation score OR the tier directly */
  reputation?: number;
  tier?: ReputationTier;
  className?: string;
  showScore?: boolean;
}

export function ReputationTierBadge({
  reputation,
  tier: tierProp,
  className,
  showScore = false,
}: ReputationTierBadgeProps) {
  const tier = tierProp ?? getReputationTier(reputation ?? 0);
  const { badge, label } = TIER_STYLES[tier];

  return (
    <Badge
      variant='outline'
      className={cn(
        badge,
        'text-[11px] font-semibold tracking-wide',
        className
      )}
    >
      {label}
      {showScore && reputation !== undefined && (
        <span className='ml-1 opacity-70'>· {reputation.toLocaleString()}</span>
      )}
    </Badge>
  );
}
