'use client';

import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Shield,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Milestone } from '@/features/projects/types';
import { DisputeStatusBadge } from './DisputeStatusBadge';

interface DisputeDetailPanelProps {
  milestone: Milestone;
  milestoneIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimelineEvent {
  icon: React.ReactNode;
  label: string;
  date?: string;
  className: string;
}

export function DisputeDetailPanel({
  milestone,
  milestoneIndex,
  open,
  onOpenChange,
}: DisputeDetailPanelProps) {
  const { disputeStatus, disputeResolution } = milestone;

  const events: TimelineEvent[] = [];

  if (milestone.disputeFiledAt) {
    events.push({
      icon: <AlertTriangle className='h-3.5 w-3.5' />,
      label: 'Dispute filed',
      date: milestone.disputeFiledAt,
      className: 'bg-amber-500/20 text-amber-400',
    });
  }

  if (
    disputeStatus === 'UNDER_REVIEW' ||
    disputeStatus === 'RESOLVED' ||
    disputeStatus === 'ESCALATED'
  ) {
    events.push({
      icon: <Clock className='h-3.5 w-3.5' />,
      label: 'Under review',
      date: undefined,
      className: 'bg-blue-500/20 text-blue-400',
    });
  }

  if (disputeStatus === 'ESCALATED') {
    events.push({
      icon: <Shield className='h-3.5 w-3.5' />,
      label: 'Escalated to senior review',
      date: undefined,
      className: 'bg-purple-500/20 text-purple-400',
    });
  }

  if (disputeStatus === 'RESOLVED' && milestone.disputeResolvedAt) {
    events.push({
      icon: <CheckCircle2 className='h-3.5 w-3.5' />,
      label: 'Dispute resolved',
      date: milestone.disputeResolvedAt,
      className: 'bg-green-500/20 text-green-400',
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-[480px]'>
        <SheetHeader className='mb-6'>
          <SheetTitle className='flex items-center gap-2 text-white'>
            <AlertTriangle className='h-5 w-5 text-red-400' />
            Dispute Details
          </SheetTitle>
          <SheetDescription>
            Milestone #{milestoneIndex + 1} — {milestone.title}
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6'>
          {/* Status */}
          {disputeStatus && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-white/60'>Status</span>
              <DisputeStatusBadge
                status={disputeStatus}
                resolution={disputeResolution}
              />
            </div>
          )}

          <Separator className='bg-border/20' />

          {/* Dispute reason */}
          {milestone.disputeReason && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm font-medium text-white'>
                <MessageSquare className='h-4 w-4 text-white/50' />
                Reason Filed
              </div>
              <p className='rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white/80'>
                {milestone.disputeReason}
              </p>
              {milestone.disputeFiledAt && (
                <p className='text-xs text-white/40'>
                  Filed on{' '}
                  {format(new Date(milestone.disputeFiledAt), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Evidence links */}
          {milestone.disputeEvidenceLinks &&
            milestone.disputeEvidenceLinks.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-white'>
                  <ExternalLink className='h-4 w-4 text-white/50' />
                  Evidence Links
                </div>
                <ul className='space-y-1.5'>
                  {milestone.disputeEvidenceLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 truncate rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-blue-400 transition-colors hover:bg-white/10'
                      >
                        <ExternalLink className='h-3 w-3 shrink-0' />
                        <span className='truncate'>{link}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Evidence files */}
          {milestone.disputeEvidenceFiles &&
            milestone.disputeEvidenceFiles.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-white'>
                  <FileText className='h-4 w-4 text-white/50' />
                  Evidence Documents
                </div>
                <ul className='space-y-1.5'>
                  {milestone.disputeEvidenceFiles.map((url, i) => {
                    const fileName =
                      url.split('/').pop() ?? `Document ${i + 1}`;
                    return (
                      <li key={i}>
                        <a
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10'
                        >
                          <FileText className='h-3.5 w-3.5 shrink-0 text-white/40' />
                          <span className='flex-1 truncate'>{fileName}</span>
                          <ExternalLink className='h-3 w-3 shrink-0 text-white/40' />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          {/* Admin response */}
          {milestone.disputeAdminResponse && (
            <>
              <Separator className='bg-border/20' />
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-white'>
                  <Shield className='h-4 w-4 text-white/50' />
                  Admin Response
                </div>
                <p className='rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm leading-relaxed text-white/80'>
                  {milestone.disputeAdminResponse}
                </p>
              </div>
            </>
          )}

          {/* Resolution outcome */}
          {disputeStatus === 'RESOLVED' && disputeResolution && (
            <div className='rounded-lg border border-green-500/20 bg-green-500/10 p-4'>
              <p className='mb-1 text-sm font-medium text-green-400'>
                Resolution Outcome
              </p>
              <p className='text-sm text-white/70'>
                {disputeResolution === 'CREATOR_FAVORED' &&
                  'The decision was in favor of the project creator. Funds have been released as planned.'}
                {disputeResolution === 'BACKER_FAVORED' &&
                  'The decision was in favor of the backer. A refund has been initiated.'}
                {disputeResolution === 'SPLIT' &&
                  'A split decision was reached. Funds were partially released and partially refunded.'}
              </p>
              {milestone.disputeResolvedAt && (
                <p className='mt-2 text-xs text-white/40'>
                  {format(
                    new Date(milestone.disputeResolvedAt),
                    'MMM dd, yyyy'
                  )}
                </p>
              )}
            </div>
          )}

          {/* On-chain transaction */}
          {milestone.disputeTransactionHash && (
            <>
              <Separator className='bg-border/20' />
              <div className='flex items-center justify-between text-sm'>
                <span className='text-white/60'>On-chain record</span>
                <a
                  href={`https://stellar.expert/explorer/public/tx/${milestone.disputeTransactionHash}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-blue-400 transition-opacity hover:opacity-70'
                >
                  {milestone.disputeTransactionHash.slice(0, 8)}…
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            </>
          )}

          {/* Timeline */}
          {events.length > 0 && (
            <>
              <Separator className='bg-border/20' />
              <div className='space-y-2'>
                <p className='text-sm font-medium text-white'>Timeline</p>
                <ol className='space-y-3'>
                  {events.map((event, i) => (
                    <li key={i} className='flex items-start gap-3'>
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${event.className}`}
                      >
                        {event.icon}
                      </div>
                      <div>
                        <p className='text-sm text-white/80'>{event.label}</p>
                        {event.date && (
                          <p className='text-xs text-white/40'>
                            {format(new Date(event.date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {/* Pending state */}
          {!milestone.disputeReason &&
            !milestone.disputeAdminResponse &&
            events.length === 0 && (
              <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center'>
                <Clock className='mx-auto mb-2 h-8 w-8 text-amber-400' />
                <p className='text-sm font-medium text-amber-400'>
                  Dispute Pending
                </p>
                <p className='mt-1 text-xs text-white/50'>
                  Details will appear here once the dispute is processed.
                </p>
              </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
