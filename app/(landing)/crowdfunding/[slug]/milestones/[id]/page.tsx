'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import { useCampaign, useMilestone } from '@/features/crowdfunding';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { milestoneState, TONE_PILL } from '@/lib/crowdfunding/status';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

interface MilestoneDetail {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  deliverable?: string | null;
  successCriteria?: string | null;
  fundingPercentage?: number | null;
  amount?: number | null;
  expectedDeliveryDate?: string | null;
  endDate?: string | null;
  startDate?: string | null;
  orderIndex?: number | null;
  reviewStatus?: string | null;
  submittedAt?: string | null;
  proofOfWorkFiles?: string[];
  proofOfWorkLinks?: string[];
  submissionNotes?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  rejectionFeedback?: string | null;
  resubmissionDeadline?: string | null;
  completedAt?: string | null;
  claimedAt?: string | null;
  isOverdue?: boolean;
  daysRemaining?: number | null;
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6'>
      <h2 className='mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase'>
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex flex-wrap items-start gap-2 py-2 text-sm'>
      <span className='w-36 flex-shrink-0 text-zinc-500'>{label}</span>
      <span className='flex-1 text-zinc-200'>{value}</span>
    </div>
  );
}

export default function PublicMilestoneDetailPage({ params }: PageProps) {
  const { slug, id } = use(params);
  const { data: campaign, isLoading: campaignLoading } = useCampaign(slug);
  const { data: milestoneRaw, isLoading: milestoneLoading } = useMilestone(
    campaign?.id ?? null,
    id
  );

  const isLoading = campaignLoading || (!!campaign?.id && milestoneLoading);

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-3xl px-4 py-20 text-center text-zinc-500'>
        Loading...
      </div>
    );
  }

  if (!campaign || !milestoneRaw) {
    return (
      <div className='container mx-auto max-w-3xl px-4 py-20 text-center text-zinc-500'>
        Milestone not found.
      </div>
    );
  }

  const m = milestoneRaw as MilestoneDetail;
  const milestones = campaign.milestones ?? [];
  const idx = milestones.findIndex(ms => ms.id === id);
  const orderNumber = idx >= 0 ? idx + 1 : null;

  const st = milestoneState(m.reviewStatus, m.claimedAt);
  const dueDate = formatDate(m.expectedDeliveryDate ?? m.endDate);
  const submittedAt = formatDate(m.submittedAt);
  const reviewedAt = formatDate(m.reviewedAt);

  const totalAmount = milestones.reduce((s, ms) => s + (ms.amount ?? 0), 0);
  const pct =
    totalAmount > 0 && m.amount != null
      ? Math.round((m.amount / totalAmount) * 100)
      : null;

  const hasEvidence =
    m.submittedAt ||
    (m.proofOfWorkLinks?.length ?? 0) > 0 ||
    (m.proofOfWorkFiles?.length ?? 0) > 0 ||
    m.submissionNotes;

  const hasReviewOutcome =
    m.reviewedAt || m.rejectionFeedback || m.rejectionReason || m.claimedAt;

  const isRejected =
    m.reviewStatus === 'REJECTED' || m.reviewStatus === 'RESUBMISSION_REQUIRED';

  return (
    <div className='min-h-screen bg-zinc-950'>
      {/* Nav bar */}
      <div className='border-b border-zinc-900'>
        <div className='container mx-auto max-w-3xl px-4 py-3'>
          <Link
            href={`/crowdfunding/${slug}/milestones`}
            className='inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300'
          >
            <ArrowLeft className='h-4 w-4' />
            All milestones
          </Link>
        </div>
      </div>

      <div className='container mx-auto max-w-3xl space-y-5 px-4 py-10'>
        {/* Header */}
        <div className='flex flex-wrap items-start gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600'>
              <span>{campaign.project.title}</span>
              {orderNumber && (
                <>
                  <span>/</span>
                  <span>Milestone {orderNumber}</span>
                </>
              )}
            </div>
            <h1 className='text-2xl font-bold text-white'>
              {m.title ?? m.name ?? 'Untitled milestone'}
            </h1>
          </div>
          <Badge
            variant='outline'
            className={cn('flex-shrink-0 text-xs', TONE_PILL[st.tone])}
          >
            {st.label}
          </Badge>
        </div>

        {/* Key facts */}
        <Section title='Overview'>
          <div className='divide-y divide-zinc-800/60'>
            {m.amount != null && (
              <MetaRow
                label='Amount'
                value={
                  <span>
                    ${m.amount.toLocaleString()} USDC
                    {pct != null && (
                      <span className='ml-2 text-zinc-500'>
                        {pct}% of total
                      </span>
                    )}
                  </span>
                }
              />
            )}
            {dueDate && (
              <MetaRow
                label='Due date'
                value={
                  <span className='flex items-center gap-1.5'>
                    <CalendarDays className='h-3.5 w-3.5 text-zinc-500' />
                    {dueDate}
                    {m.isOverdue && (
                      <span className='ml-1 text-xs text-red-400'>Overdue</span>
                    )}
                  </span>
                }
              />
            )}
            {submittedAt && (
              <MetaRow
                label='Submitted'
                value={
                  <span className='flex items-center gap-1.5'>
                    <Clock className='h-3.5 w-3.5 text-zinc-500' />
                    {submittedAt}
                  </span>
                }
              />
            )}
            {reviewedAt && (
              <MetaRow
                label='Reviewed'
                value={
                  <span className='flex items-center gap-1.5'>
                    <CheckCircle2 className='h-3.5 w-3.5 text-zinc-500' />
                    {reviewedAt}
                  </span>
                }
              />
            )}
          </div>
        </Section>

        {/* Description */}
        {m.description && (
          <Section title='Description'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-zinc-300'>
              {m.description}
            </p>
          </Section>
        )}

        {/* Deliverable */}
        {m.deliverable && (
          <Section title='Deliverable'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-zinc-300'>
              {m.deliverable}
            </p>
          </Section>
        )}

        {/* Success criteria */}
        {m.successCriteria && (
          <Section title='Success criteria'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-zinc-300'>
              {m.successCriteria}
            </p>
          </Section>
        )}

        {/* Evidence submitted by the builder */}
        {hasEvidence && (
          <Section title='Evidence submitted'>
            {m.submissionNotes && (
              <div className='mb-4'>
                <p className='mb-1 text-xs font-medium text-zinc-500'>Notes</p>
                <p className='text-sm leading-relaxed whitespace-pre-wrap text-zinc-300'>
                  {m.submissionNotes}
                </p>
              </div>
            )}

            {(m.proofOfWorkLinks?.length ?? 0) > 0 && (
              <div className='mb-4'>
                <p className='mb-2 text-xs font-medium text-zinc-500'>Links</p>
                <ul className='space-y-1.5'>
                  {m.proofOfWorkLinks!.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 hover:underline'
                      >
                        <ExternalLink className='h-3.5 w-3.5 flex-shrink-0' />
                        <span className='break-all'>{link}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(m.proofOfWorkFiles?.length ?? 0) > 0 && (
              <div>
                <p className='mb-2 text-xs font-medium text-zinc-500'>Files</p>
                <ul className='space-y-1.5'>
                  {m.proofOfWorkFiles!.map((file, i) => (
                    <li key={i}>
                      <a
                        href={file}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 hover:underline'
                      >
                        <FileText className='h-3.5 w-3.5 flex-shrink-0' />
                        <span className='break-all'>
                          {file.split('/').pop() ?? file}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {/* Review outcome */}
        {hasReviewOutcome && (
          <div>
            {m.claimedAt && (
              <div className='flex items-start gap-3 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-5'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400' />
                <div>
                  <p className='text-sm font-semibold text-emerald-300'>
                    Paid out
                  </p>
                  {m.amount != null && (
                    <p className='mt-0.5 text-lg font-bold text-white'>
                      ${m.amount.toLocaleString()} USDC
                    </p>
                  )}
                  {formatDate(m.claimedAt) && (
                    <p className='mt-1 text-xs text-emerald-300/60'>
                      {formatDate(m.claimedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isRejected && (m.rejectionReason || m.rejectionFeedback) && (
              <div className='flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-5'>
                <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400' />
                <div className='space-y-2'>
                  <p className='text-sm font-semibold text-amber-300'>
                    {m.reviewStatus === 'RESUBMISSION_REQUIRED'
                      ? 'Resubmission required'
                      : 'Not accepted'}
                  </p>
                  {m.rejectionReason && (
                    <p className='text-sm text-amber-200/80'>
                      {m.rejectionReason}
                    </p>
                  )}
                  {m.rejectionFeedback && (
                    <p className='text-sm leading-relaxed whitespace-pre-wrap text-amber-200/70'>
                      {m.rejectionFeedback}
                    </p>
                  )}
                  {m.resubmissionDeadline && (
                    <div className='flex items-center gap-1.5 text-xs text-amber-300/60'>
                      <RefreshCw className='h-3 w-3' />
                      Resubmit by {formatDate(m.resubmissionDeadline)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
