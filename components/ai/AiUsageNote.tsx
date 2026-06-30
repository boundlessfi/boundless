'use client';

import { useAiUsage } from '@/hooks/use-ai-usage';

interface AiUsageNoteProps {
  organizationId: string;
  className?: string;
}

/**
 * "N of 50 AI generations left this month" + spend, for the Generate dialogs.
 * Renders nothing for unlimited tiers or before usage loads. Shared by both
 * wizards. Turns amber when running low.
 */
export default function AiUsageNote({
  organizationId,
  className,
}: AiUsageNoteProps) {
  const { data } = useAiUsage(organizationId);
  if (!data || data.limit === null || data.remaining === null) return null;

  const cost = Number(data.costUsdThisMonth || '0');
  const low = data.remaining <= Math.max(3, Math.ceil(data.limit * 0.1));

  return (
    <p
      className={[
        'text-xs',
        low ? 'text-amber-400' : 'text-muted-foreground',
        className ?? '',
      ].join(' ')}
    >
      {data.remaining} of {data.limit} AI generations left this month
      {cost > 0 ? ` · $${cost.toFixed(2)} spent` : ''}
    </p>
  );
}
