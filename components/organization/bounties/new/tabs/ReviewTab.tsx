import React from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
} from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import {
  PLATFORM_FEE,
  getBountyPlatformFee,
  getBountyPrizePool,
  getBountyTotalFunding,
} from '@/lib/utils/bounty-escrow';
import type { BountyFormData, StepKey } from '../constants';
import { computeBountyModeLabel } from './schemas/modeSchema';
import {
  CATEGORY_LABELS,
  CATEGORY_REPUTATION_BASELINE,
  scopeSchema,
} from './schemas/scopeSchema';
import { modeSchema } from './schemas/modeSchema';
import { makeSubmissionModelSchema } from './schemas/submissionModelSchema';
import { makeRewardSchema } from './schemas/rewardSchema';

interface ReviewTabProps {
  allData: BountyFormData;
  onEdit?: (step: StepKey) => void;
  onBack?: () => void;
  onPublish?: () => Promise<void> | void;
  onSaveDraft?: () => Promise<void>;
  isLoading?: boolean;
  isSavingDraft?: boolean;
}

interface SectionIssues {
  step: StepKey;
  label: string;
  valid: boolean;
}

/**
 * Validate every section against its schema (the same per-mode rules the
 * publish gate enforces). Returns per-section validity so the review step can
 * summarize what's left and block publish until all four pass.
 */
function validateAll(data: BountyFormData): {
  isValid: boolean;
  sections: SectionIssues[];
} {
  const sections: SectionIssues[] = [];

  sections.push({
    step: 'scope',
    label: 'Scope',
    valid: scopeSchema.safeParse(data.scope).success,
  });

  const modeOk = modeSchema.safeParse(data.mode).success;
  sections.push({ step: 'mode', label: 'Mode', valid: modeOk });

  sections.push({
    step: 'submission',
    label: 'Submission model',
    valid:
      modeOk && data.mode
        ? makeSubmissionModelSchema(
            data.mode.entryType,
            data.mode.claimType,
            data.scope?.category
              ? CATEGORY_REPUTATION_BASELINE[data.scope.category]
              : 0
          ).safeParse(data.submission).success
        : false,
  });

  sections.push({
    step: 'reward',
    label: 'Reward',
    valid:
      modeOk && data.mode
        ? makeRewardSchema(data.mode.claimType).safeParse(data.reward).success
        : false,
  });

  return { isValid: sections.every(s => s.valid), sections };
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className='flex items-center justify-between gap-4 text-sm'>
      <span className='text-zinc-400'>{label}</span>
      <span className='text-right text-white'>{value}</span>
    </div>
  );
}

function SummaryCard({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: StepKey;
  onEdit?: (step: StepKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-white'>{title}</h3>
        {onEdit && (
          <button
            type='button'
            onClick={() => onEdit(step)}
            className='flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-white'
          >
            <Pencil className='h-3.5 w-3.5' />
            Edit
          </button>
        )}
      </div>
      <div className='space-y-2'>{children}</div>
    </div>
  );
}

export default function ReviewTab({
  allData,
  onEdit,
  onBack,
  onPublish,
  onSaveDraft,
  isLoading = false,
  isSavingDraft = false,
}: ReviewTabProps) {
  const { isValid, sections } = validateAll(allData);
  const currency = allData.reward?.rewardCurrency || 'USDC';
  const prizePool = getBountyPrizePool(allData.reward);
  const platformFee = getBountyPlatformFee(allData.reward);
  const totalFunding = getBountyTotalFunding(allData.reward);

  const modeLabel = allData.mode
    ? computeBountyModeLabel(
        allData.mode.entryType,
        allData.mode.claimType,
        allData.mode.winnerCount ?? 1
      )
    : undefined;

  const handlePublish = async () => {
    if (!onPublish) return;
    try {
      await onPublish();
    } catch {
      // The publish flow surfaces its own errors.
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    try {
      await onSaveDraft();
    } catch {
      toast.error('Failed to save draft. Please try again.');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Validation summary */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
        <div className='mb-3 flex items-center gap-2'>
          {isValid ? (
            <CheckCircle2 className='h-5 w-5 text-emerald-500' />
          ) : (
            <AlertTriangle className='h-5 w-5 text-amber-500' />
          )}
          <h3 className='text-sm font-semibold text-white'>
            {isValid
              ? 'Everything looks good — ready to publish'
              : 'Some sections still need attention'}
          </h3>
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {sections.map(s => (
            <button
              key={s.step}
              type='button'
              onClick={() => onEdit?.(s.step)}
              className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-left text-sm transition-colors hover:border-zinc-700'
            >
              <span className='text-zinc-300'>{s.label}</span>
              {s.valid ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-500' />
              ) : (
                <span className='text-xs text-amber-500'>Incomplete</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <SummaryCard title='Scope' step='scope' onEdit={onEdit}>
        <Row label='Title' value={allData.scope?.title} />
        <Row label='Description' value={allData.scope?.description} />
        <Row
          label='Category'
          value={
            allData.scope?.category
              ? CATEGORY_LABELS[allData.scope.category]
              : undefined
          }
        />
        <Row label='Country' value={allData.scope?.country} />
        <Row label='GitHub issue' value={allData.scope?.githubIssueUrl} />
      </SummaryCard>

      <SummaryCard title='Mode' step='mode' onEdit={onEdit}>
        <Row label='Mode' value={modeLabel} />
        <Row label='Winners' value={allData.mode?.winnerCount} />
      </SummaryCard>

      <SummaryCard title='Submission model' step='submission' onEdit={onEdit}>
        <Row
          label='Submission deadline'
          value={allData.submission?.submissionDeadline}
        />
        <Row
          label='Application window closes'
          value={allData.submission?.applicationWindowCloseAt}
        />
        <Row label='Max applicants' value={allData.submission?.maxApplicants} />
        <Row label='Shortlist size' value={allData.submission?.shortlistSize} />
        <Row
          label='Reputation minimum'
          value={allData.submission?.reputationMinimum}
        />
        <Row
          label='Submission visibility'
          value={
            allData.submission?.submissionVisibility === 'HIDDEN_UNTIL_DEADLINE'
              ? 'Hidden until deadline'
              : allData.submission?.submissionVisibility === 'ORGANIZER_ONLY'
                ? 'Organizer only'
                : undefined
          }
        />
      </SummaryCard>

      <SummaryCard title='Reward' step='reward' onEdit={onEdit}>
        <Row label='Currency' value={currency} />
        {(allData.reward?.prizeTiers ?? []).map((tier, i) => (
          <Row
            key={tier.position ?? i}
            label={`Position ${tier.position ?? i + 1}`}
            value={`${tier.amount || '0'} ${currency}`}
          />
        ))}
        <div className='mt-2 space-y-2 border-t border-zinc-800 pt-3'>
          <Row
            label='Prize pool'
            value={`${prizePool.toLocaleString()} ${currency}`}
          />
          <Row
            label={`Platform fee (${PLATFORM_FEE}%)`}
            value={`${platformFee.toLocaleString()} ${currency}`}
          />
          <Row
            label='Total to fund'
            value={`${totalFunding.toLocaleString()} ${currency}`}
          />
        </div>
      </SummaryCard>

      {(allData.resources?.resources?.length ?? 0) > 0 && (
        <SummaryCard title='Resources' step='resources' onEdit={onEdit}>
          {allData.resources?.resources?.map((r, i) => (
            <Row
              key={r.id ?? i}
              label={r.description || r.file?.name || `Resource ${i + 1}`}
              value={r.link || r.file?.name || '—'}
            />
          ))}
        </SummaryCard>
      )}

      {/* Publish CTA — disabled until every section is valid. */}
      <div className='flex items-center justify-between gap-3 pt-2'>
        {onBack ? (
          <BoundlessButton
            type='button'
            variant='outline'
            size='lg'
            onClick={onBack}
            disabled={isLoading || isSavingDraft}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </BoundlessButton>
        ) : (
          <span />
        )}
        <div className='flex gap-3'>
          {onSaveDraft && (
            <BoundlessButton
              type='button'
              variant='outline'
              size='lg'
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? 'Saving...' : 'Save draft'}
            </BoundlessButton>
          )}
          <BoundlessButton
            type='button'
            size='lg'
            className='min-w-32'
            onClick={handlePublish}
            disabled={!isValid || isLoading || !onPublish}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
}
