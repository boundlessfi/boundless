'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { BoundlessButton } from '@/components/buttons';
import EmptyState from '@/components/EmptyState';
import {
  useBountyApplications,
  useDeclineApplication,
  useSelectApplication,
  useShortlistApplications,
  type BountyOperateOverview,
  type OrganizerApplication,
} from '@/features/bounties';

const STATUS_CLASS: Record<string, string> = {
  SUBMITTED: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  SHORTLISTED: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  SELECTED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  DECLINED: 'border-red-500/30 bg-red-500/10 text-red-400',
  WITHDRAWN: 'border-zinc-700 bg-zinc-800/60 text-zinc-300',
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
};

function shortAddr(a: string): string {
  return a.length > 12 ? `${a.slice(0, 5)}…${a.slice(-4)}` : a;
}

export default function BountyApplicationsPanel({
  organizationId,
  bountyId,
  overview,
}: {
  organizationId: string;
  bountyId: string;
  overview: BountyOperateOverview;
}) {
  const isCompetition = overview.claimType === 'COMPETITION';

  const { data, isLoading, error } = useBountyApplications(
    organizationId,
    bountyId
  );
  const select = useSelectApplication(organizationId, bountyId);
  const shortlist = useShortlistApplications(organizationId, bountyId);
  const decline = useDeclineApplication(organizationId, bountyId);

  const [checked, setChecked] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12'>
        <EmptyState
          title="Couldn't load applications"
          description='Try again in a moment.'
          type='compact'
        />
      </div>
    );
  }

  const applications = data ?? [];

  if (applications.length === 0) {
    return (
      <div className='py-12'>
        <EmptyState
          title='No applications yet'
          description='Applications to this bounty will appear here to review.'
          type='compact'
        />
      </div>
    );
  }

  const actionable = (a: OrganizerApplication) =>
    a.applicationStatus === 'SUBMITTED';
  const busy = select.isPending || shortlist.isPending || decline.isPending;

  // `checked` can hold ids that have since left SUBMITTED (e.g. a checked
  // application was declined, unmounting its checkbox), so derive the
  // effective selection from the live list: the sticky-bar count and the
  // shortlist payload must never include a non-actionable application.
  const selectedIds = [...checked].filter(id =>
    applications.some(a => a.id === id && actionable(a))
  );

  const toggleCheck = (id: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSelect = (a: OrganizerApplication) =>
    select.mutate(
      { applicationId: a.id },
      {
        onSuccess: () => toast.success('Applicant selected.'),
        onError: e => toast.error((e as Error).message || 'Failed to select.'),
      }
    );

  const onShortlist = () => {
    const applicationIds = selectedIds;
    if (
      overview.shortlistSize != null &&
      applicationIds.length > overview.shortlistSize
    ) {
      toast.error(`Shortlist can hold at most ${overview.shortlistSize}.`);
      return;
    }
    shortlist.mutate(
      { applicationIds },
      {
        onSuccess: () => {
          toast.success('Shortlist approved.');
          setChecked(new Set());
        },
        onError: e =>
          toast.error((e as Error).message || 'Failed to shortlist.'),
      }
    );
  };

  return (
    <div className='space-y-4'>
      {applications.map(a => (
        <ApplicationCard
          key={a.id}
          app={a}
          isCompetition={isCompetition}
          actionable={actionable(a)}
          checked={checked.has(a.id)}
          onToggleCheck={() => toggleCheck(a.id)}
          onSelect={() => onSelect(a)}
          onDecline={reason =>
            decline.mutate(
              { appId: a.id, body: { reason } },
              {
                onSuccess: () => toast.success('Application declined.'),
                onError: e =>
                  toast.error((e as Error).message || 'Failed to decline.'),
              }
            )
          }
          busy={busy}
        />
      ))}

      {isCompetition && (
        <div className='sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 backdrop-blur'>
          <span className='text-sm text-zinc-400'>
            {selectedIds.length} selected
            {overview.shortlistSize != null
              ? ` (max ${overview.shortlistSize})`
              : ''}
          </span>
          <BoundlessButton
            disabled={selectedIds.length === 0 || busy}
            onClick={onShortlist}
          >
            {shortlist.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              `Approve shortlist (${selectedIds.length})`
            )}
          </BoundlessButton>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app: a,
  isCompetition,
  actionable,
  checked,
  onToggleCheck,
  onSelect,
  onDecline,
  busy,
}: {
  app: OrganizerApplication;
  isCompetition: boolean;
  actionable: boolean;
  checked: boolean;
  onToggleCheck: () => void;
  onSelect: () => void;
  onDecline: (reason: string) => void;
  busy: boolean;
}) {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const status = a.applicationStatus ?? 'SUBMITTED';

  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          {isCompetition && actionable && (
            <Checkbox checked={checked} onCheckedChange={onToggleCheck} />
          )}
          <div>
            <p className='font-mono text-sm text-white'>
              {shortAddr(a.applicantAddress)}
            </p>
            <p className='text-xs text-zinc-500'>
              Applied {new Date(a.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge
          variant='outline'
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_CLASS[status] ??
            'border-zinc-700 bg-zinc-800/60 text-zinc-300'
          }`}
        >
          {STATUS_LABEL[status] ?? status}
        </Badge>
      </div>

      {/* Proposal */}
      {(a.proposalShort || a.proposalFull) && (
        <p className='mt-3 text-sm whitespace-pre-wrap text-zinc-300'>
          {a.proposalFull || a.proposalShort}
        </p>
      )}
      {a.qualifications && (
        <div className='mt-3'>
          <p className='text-xs font-medium text-zinc-500'>Qualifications</p>
          <p className='text-sm text-zinc-300'>{a.qualifications}</p>
        </div>
      )}

      {/* Meta */}
      <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400'>
        {a.estimatedDays != null && (
          <span className='inline-flex items-center gap-1'>
            <Calendar className='h-3.5 w-3.5' />
            {a.estimatedDays} days
          </span>
        )}
        {a.videoIntroUrl && (
          <a
            href={a.videoIntroUrl}
            target='_blank'
            rel='noreferrer'
            className='text-primary inline-flex items-center gap-1 hover:underline'
          >
            <Video className='h-3.5 w-3.5' />
            Video intro
            <ExternalLink className='h-3 w-3' />
          </a>
        )}
      </div>
      {a.portfolioLinks.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {a.portfolioLinks.map(url => (
            <a
              key={url}
              href={url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-700'
            >
              <Link2 className='h-3 w-3' />
              Portfolio
              <ExternalLink className='h-3 w-3 opacity-60' />
            </a>
          ))}
        </div>
      )}

      {a.declineReason && status === 'DECLINED' && (
        <p className='mt-3 text-xs text-red-400'>Reason: {a.declineReason}</p>
      )}

      {/* Actions */}
      {actionable &&
        (declining ? (
          <div className='mt-4 space-y-2 border-t border-zinc-800 pt-4'>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Optional reason for the applicant…'
              className='min-h-[70px] border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            />
            <div className='flex justify-end gap-2'>
              <BoundlessButton
                variant='outline'
                size='sm'
                onClick={() => setDeclining(false)}
                disabled={busy}
              >
                Cancel
              </BoundlessButton>
              <BoundlessButton
                size='sm'
                className='bg-red-500 text-white hover:bg-red-600'
                onClick={() => onDecline(reason.trim())}
                disabled={busy}
              >
                Confirm decline
              </BoundlessButton>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex items-center justify-end gap-2 border-t border-zinc-800 pt-4'>
            <BoundlessButton
              variant='outline'
              size='sm'
              className='text-red-400 hover:bg-red-500/10 hover:text-red-300'
              onClick={() => setDeclining(true)}
              disabled={busy}
            >
              Decline
            </BoundlessButton>
            {!isCompetition && (
              <BoundlessButton size='sm' onClick={onSelect} disabled={busy}>
                <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
                Select
              </BoundlessButton>
            )}
          </div>
        ))}
    </div>
  );
}
