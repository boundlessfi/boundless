import { Badge } from '@/components/ui/badge';
import { DisputeResolution, DisputeStatus } from '@/features/projects/types';

const CONFIG: Record<DisputeStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Dispute Open',
    className: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'border-blue-500/40 bg-blue-500/15 text-blue-400',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'border-green-500/40 bg-green-500/15 text-green-400',
  },
  ESCALATED: {
    label: 'Escalated',
    className: 'border-purple-500/40 bg-purple-500/15 text-purple-400',
  },
};

const RESOLUTION_LABEL: Record<DisputeResolution, string> = {
  CREATOR_FAVORED: 'Creator favored',
  BACKER_FAVORED: 'Backer favored',
  SPLIT: 'Split decision',
};

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  resolution?: DisputeResolution;
  className?: string;
}

export function DisputeStatusBadge({
  status,
  resolution,
  className = '',
}: DisputeStatusBadgeProps) {
  const config = CONFIG[status];
  const label =
    status === 'RESOLVED' && resolution
      ? `Resolved — ${RESOLUTION_LABEL[resolution]}`
      : config.label;

  return (
    <Badge
      variant='outline'
      className={`shrink-0 text-xs ${config.className} ${className}`}
    >
      {label}
    </Badge>
  );
}
