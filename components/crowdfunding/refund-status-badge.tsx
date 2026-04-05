import { Badge } from '@/components/ui/badge';
import { RefundStatus } from '@/features/projects/types';

const CONFIG: Record<RefundStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Refund Pending',
    className: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'border-blue-500/40 bg-blue-500/15 text-blue-400',
  },
  PROCESSED: {
    label: 'Refunded',
    className: 'border-green-500/40 bg-green-500/15 text-green-400',
  },
};

interface RefundStatusBadgeProps {
  status: RefundStatus;
  className?: string;
}

export function RefundStatusBadge({
  status,
  className = '',
}: RefundStatusBadgeProps) {
  const { label, className: baseClass } = CONFIG[status];
  return (
    <Badge
      variant='outline'
      className={`shrink-0 text-xs ${baseClass} ${className}`}
    >
      {label}
    </Badge>
  );
}
