'use client';

import { useParams, useSearchParams } from 'next/navigation';

import AiRegenerateControl from '@/components/ai/AiRegenerateControl';
import {
  useDraft,
  useRegenerateBountyDraftSection,
  type BountyDraftRegenSection,
  type BountyDraftWithAi,
} from '@/features/bounties';

interface RegenerateBountySectionButtonProps {
  /** Which AI section to regenerate (description | submission | reward). */
  section: BountyDraftRegenSection;
  /** Apply the regenerated values (wizard section shape) to the tab's form. */
  onApply: (data: Record<string, unknown>) => void;
  label?: string;
  /** Pre-fill the instructions box (e.g. after a mode change). */
  defaultInstruction?: string;
}

/**
 * Per-section "Regenerate with AI" for the bounty wizard. Derives the org +
 * draft from the route, renders only on AI-generated drafts, and delegates the
 * steerable + preview/accept-discard UX to the shared AiRegenerateControl.
 */
export default function RegenerateBountySectionButton({
  section,
  onApply,
  label,
  defaultInstruction,
}: RegenerateBountySectionButtonProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = (params?.id as string) ?? '';
  const draftId =
    (params?.draftId as string) ?? searchParams.get('draftId') ?? '';

  const { data: draft } = useDraft(organizationId, draftId || undefined);
  const regenerate = useRegenerateBountyDraftSection(organizationId);

  const aiGeneration = (draft as BountyDraftWithAi | undefined)?.aiGeneration;

  return (
    <AiRegenerateControl
      available={Boolean(draftId && aiGeneration)}
      isRunning={regenerate.isPending}
      label={label}
      defaultInstruction={defaultInstruction}
      onRun={instructions =>
        regenerate
          .mutateAsync({ draftId, body: { section, instructions } })
          .then(r => r.data as Record<string, unknown>)
      }
      onApply={onApply}
    />
  );
}
