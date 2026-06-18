'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Send, Pencil } from 'lucide-react';
import { feeBreakdown, money } from '../fee';
import type { CampaignWizardData } from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  /** True when resubmitting a previously rejected campaign. */
  isRevision?: boolean;
}

function Section({
  label,
  step,
  onEdit,
  children,
}: {
  label: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5'>
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
          {label}
        </p>
        <button
          onClick={() => onEdit(step)}
          className='flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300'
        >
          <Pencil className='h-3 w-3' />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className='flex justify-between gap-4 py-1 text-sm'>
      <span className='text-zinc-500'>{label}</span>
      <span className='text-right text-white'>{value}</span>
    </div>
  );
}

export default function ReviewStep({
  data,
  onEdit,
  isSubmitting,
  onSubmit,
  isRevision = false,
}: Props) {
  const isReady =
    data.title &&
    data.category &&
    data.vision &&
    data.fundingGoal > 0 &&
    data.milestones.length > 0 &&
    data.contactPrimary;

  const n = data.milestones.length;
  const splitPct = n > 0 ? 100 / n : 0;
  const splitLabel = Number.isInteger(splitPct)
    ? String(splitPct)
    : splitPct.toFixed(1);
  const { fee, net, feePercent } = feeBreakdown(data.fundingGoal);
  const splitAmount = n > 0 && net > 0 ? net / n : 0;

  return (
    <div className='space-y-5'>
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 text-sm text-zinc-400'>
        {isRevision
          ? 'Review your changes before resubmitting. Your campaign goes back to the Boundless team for another check. You will be notified by email with the outcome.'
          : 'Review everything before submitting. Once submitted, your campaign goes to the Boundless team for a quick check. You will be notified by email when it is approved or if changes are needed.'}
      </div>

      <Section label='Basics' step={1} onEdit={onEdit}>
        <Row label='Title' value={data.title} />
        <Row label='Tagline' value={data.tagline} />
        <Row label='Category' value={data.category} />
        {data.logoUrl && (
          <div className='mt-2 flex items-center gap-2 text-sm'>
            <span className='text-zinc-500'>Logo</span>
            <img
              src={data.logoUrl}
              alt='logo'
              className='h-8 w-8 rounded-lg object-cover'
            />
          </div>
        )}
      </Section>

      <Section label='Story' step={2} onEdit={onEdit}>
        <p className='line-clamp-4 text-sm text-zinc-300'>
          {data.vision || (
            <span className='text-zinc-600 italic'>No story written</span>
          )}
        </p>
      </Section>

      <Section label='Funding' step={3} onEdit={onEdit}>
        <Row
          label='Goal'
          value={
            data.fundingGoal
              ? `$${data.fundingGoal.toLocaleString()} USDC`
              : undefined
          }
        />
        <Row
          label={`Boundless fee (${feePercent}%)`}
          value={data.fundingGoal ? `- $${money(fee)}` : undefined}
        />
        <Row
          label='You receive'
          value={data.fundingGoal ? `$${money(net)} USDC` : undefined}
        />
        <Row label='Deadline' value='Set automatically after voting passes' />
      </Section>

      <Section
        label={`Milestones (${data.milestones.length})`}
        step={4}
        onEdit={onEdit}
      >
        {n === 0 ? (
          <p className='text-sm text-zinc-600 italic'>None added</p>
        ) : (
          <div className='space-y-2'>
            <p className='text-xs text-zinc-500'>
              Funds release equally, {splitLabel}% each
              {splitAmount > 0 && ` (≈ $${money(splitAmount)})`}.
            </p>
            {data.milestones.map((m, i) => (
              <div key={i} className='flex justify-between gap-4 text-sm'>
                <span className='text-zinc-300'>
                  {i + 1}. {m.title || 'Untitled milestone'}
                </span>
                <span className='flex-shrink-0 text-zinc-500'>
                  {splitLabel}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section label='Team and contact' step={5} onEdit={onEdit}>
        {data.teamMembers.filter(m => m.name.trim()).length === 0 ? (
          <p className='text-sm text-zinc-500'>Solo builder</p>
        ) : (
          <div className='space-y-1'>
            {data.teamMembers
              .filter(m => m.name.trim())
              .map((m, i) => (
                <div key={i} className='flex justify-between gap-4 text-sm'>
                  <span className='text-zinc-300'>{m.name}</span>
                  <span className='text-zinc-500'>{m.role || 'Member'}</span>
                </div>
              ))}
          </div>
        )}
        <div className='mt-2 border-t border-zinc-800/50 pt-2'>
          <Row label='Telegram' value={data.contactPrimary} />
          <Row label='Backup' value={data.contactBackup} />
        </div>
      </Section>

      <Section label='Links' step={6} onEdit={onEdit}>
        <Row label='GitHub' value={data.githubUrl} />
        <Row label='Website' value={data.websiteUrl} />
        <Row label='Demo video' value={data.demoVideoUrl} />
        {data.socialLinks.length > 0 && (
          <Row
            label='Social links'
            value={`${data.socialLinks.length} link${data.socialLinks.length !== 1 ? 's' : ''}`}
          />
        )}
      </Section>

      {!isReady && (
        <div className='rounded-xl border border-amber-800/50 bg-amber-950/30 p-4 text-sm text-amber-400'>
          Some required fields are missing. Go back and complete each step
          before submitting.
        </div>
      )}

      <div className='border-t border-zinc-800/50 pt-6'>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !isReady}
          size='lg'
          className='bg-primary hover:bg-primary/90 w-full gap-2 text-base'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin' />
              {isRevision ? 'Resubmitting...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send className='h-5 w-5' />
              {isRevision ? 'Resubmit for review' : 'Submit for review'}
            </>
          )}
        </Button>
        <p className='mt-3 text-center text-xs text-zinc-600'>
          You can edit your campaign after submitting if changes are requested.
        </p>
      </div>
    </div>
  );
}
