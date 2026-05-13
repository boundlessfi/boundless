'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  UserPlus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EmptyState from '@/components/EmptyState';
import { InviteJudgeDialog } from './InviteJudgeDialog';
import {
  useCancelInvitation,
  useOrgJudgeInvitations,
  useResendInvitation,
} from '@/hooks/judge/use-organizer-invitations';
import type {
  JudgeInvitationStatus,
  OrganizerInvitationSummary,
} from '@/lib/api/judge';

interface CurrentJudge {
  id: string;
  userId?: string;
  name?: string;
  image?: string | null;
}

export function OrganizerJudgesPanel({
  organizationId,
  hackathonId,
  currentJudges,
  isRefreshingJudges,
  canManage,
  onRemoveJudge,
  onJudgesChanged,
}: {
  organizationId: string;
  hackathonId: string;
  currentJudges: CurrentJudge[];
  isRefreshingJudges?: boolean;
  canManage: boolean;
  onRemoveJudge: (userId: string) => void;
  /** Fired when the panel detects an invitation was just accepted by the
   *  invitee on another session — the parent page should re-fetch judges. */
  onJudgesChanged?: () => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [cancelTarget, setCancelTarget] =
    useState<OrganizerInvitationSummary | null>(null);

  const {
    data: invitations = [],
    isPending: invitationsLoading,
    isFetching: invitationsFetching,
    refetch: refetchInvitations,
  } = useOrgJudgeInvitations(organizationId, hackathonId);
  const resend = useResendInvitation(organizationId, hackathonId);
  const cancel = useCancelInvitation(organizationId, hackathonId);

  // Detect ACCEPTED transitions in the polled invitations list — when an
  // invitee accepts on another machine, ping the parent so the active
  // judges list refreshes without a manual reload.
  const previousAcceptedIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const accepted = new Set(
      invitations.filter(i => i.status === 'ACCEPTED').map(i => i.id)
    );
    const prev = previousAcceptedIdsRef.current;
    if (prev !== null) {
      let hasNew = false;
      accepted.forEach(id => {
        if (!prev.has(id)) hasNew = true;
      });
      if (hasNew) onJudgesChanged?.();
    }
    previousAcceptedIdsRef.current = accepted;
  }, [invitations, onJudgesChanged]);

  const pending = invitations.filter(
    (i: OrganizerInvitationSummary) => i.status === 'PENDING'
  );
  const history = invitations.filter(
    (i: OrganizerInvitationSummary) => i.status !== 'PENDING'
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h3 className='text-lg font-medium'>Judging panel</h3>
          <p className='text-sm text-gray-500'>
            Invite judges by email. They only see this hackathon, never your
            organization.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              refetchInvitations();
              onJudgesChanged?.();
            }}
            disabled={invitationsFetching}
            className='border-white/10 bg-transparent text-gray-300 hover:bg-white/5'
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${invitationsFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          {canManage && (
            <Button
              onClick={() => setInviteOpen(true)}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              <UserPlus className='mr-2 h-4 w-4' /> Invite judge
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Active judges */}
        <section className='rounded-2xl border border-white/5 bg-[#101010] p-6'>
          <h4 className='mb-4 flex items-center gap-2 text-xs font-medium tracking-wider text-gray-400 uppercase'>
            Active judges
            {isRefreshingJudges && (
              <Loader2 className='h-3.5 w-3.5 animate-spin text-gray-600' />
            )}
            <span className='ml-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300 normal-case'>
              {currentJudges.length}
            </span>
          </h4>
          {currentJudges.length === 0 ? (
            <EmptyState
              title='No judges yet'
              description={
                canManage
                  ? 'Invite your first judge by email.'
                  : 'Nobody has been added to this panel yet.'
              }
              type='compact'
              className='py-8'
            />
          ) : (
            <ul className='space-y-1.5'>
              {currentJudges.map(judge => (
                <li
                  key={judge.id}
                  className='flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.06]'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <Avatar className='h-8 w-8 border border-white/10'>
                      <AvatarImage
                        src={judge.image ?? undefined}
                        alt={judge.name ?? ''}
                      />
                      <AvatarFallback className='bg-white/5 text-[10px]'>
                        {(judge.name ?? '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium text-white'>
                        {judge.name}
                      </p>
                      <p className='text-[10px] tracking-wider text-emerald-400/70 uppercase'>
                        Active
                      </p>
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-red-300/80 hover:bg-red-400/10 hover:text-red-300'
                      onClick={() => onRemoveJudge(judge.userId ?? judge.id)}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pending invitations */}
        <section className='rounded-2xl border border-white/5 bg-[#101010] p-6'>
          <h4 className='mb-4 flex items-center gap-2 text-xs font-medium tracking-wider text-gray-400 uppercase'>
            Pending invitations
            <span className='ml-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-300 normal-case'>
              {pending.length}
            </span>
          </h4>

          {invitationsLoading ? (
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Loader2 className='h-4 w-4 animate-spin' /> Loading…
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              title='No pending invitations'
              description={
                canManage
                  ? 'Use “Invite judge” to send one by email.'
                  : 'No invitations are awaiting response.'
              }
              type='compact'
              className='py-8'
            />
          ) : (
            <ul className='space-y-2'>
              {pending.map(inv => (
                <PendingInvitationRow
                  key={inv.id}
                  invitation={inv}
                  canManage={canManage}
                  onResend={() => resend.mutate(inv.id)}
                  onCancel={() => setCancelTarget(inv)}
                  resending={resend.isPending && resend.variables === inv.id}
                />
              ))}
            </ul>
          )}

          {history.length > 0 && (
            <details className='mt-6 text-xs text-gray-500'>
              <summary className='cursor-pointer select-none hover:text-gray-300'>
                Show history ({history.length})
              </summary>
              <ul className='mt-3 space-y-1'>
                {history.map(inv => (
                  <li
                    key={inv.id}
                    className='flex items-center justify-between rounded-md border border-white/5 bg-black/30 p-2 text-xs'
                  >
                    <span className='truncate text-gray-400'>{inv.email}</span>
                    <StatusBadge status={inv.status} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      <InviteJudgeDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organizationId={organizationId}
        hackathonId={hackathonId}
      />

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={o => !o && setCancelTarget(null)}
      >
        <AlertDialogContent className='border-white/5 bg-[#101010] text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              The invitation link for{' '}
              <strong className='text-gray-200'>{cancelTarget?.email}</strong>{' '}
              will stop working immediately. They can be re-invited later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-white/10 bg-transparent text-gray-300 hover:bg-white/5'>
              Keep invitation
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => {
                if (cancelTarget) cancel.mutate(cancelTarget.id);
                setCancelTarget(null);
              }}
            >
              Cancel invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PendingInvitationRow({
  invitation,
  canManage,
  onResend,
  onCancel,
  resending,
}: {
  invitation: OrganizerInvitationSummary;
  canManage: boolean;
  onResend: () => void;
  onCancel: () => void;
  resending: boolean;
}) {
  const invitedRel = invitation.lastResentAt
    ? `Resent ${formatRel(invitation.lastResentAt)}`
    : `Invited ${formatRel(invitation.invitedAt)}`;
  return (
    <li className='flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.06]'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className='border-primary/30 bg-primary/10 text-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border'>
          <Mail className='h-3.5 w-3.5' />
        </span>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-white'>
            {invitation.email}
          </p>
          <p className='mt-0.5 text-xs text-gray-500'>
            {invitedRel}
            {invitation.resendCount > 0 && (
              <span className='ml-2'>· resent {invitation.resendCount}×</span>
            )}
          </p>
        </div>
      </div>
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-gray-400'
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='border-white/10 bg-[#101010] text-white'
          >
            <DropdownMenuItem
              onClick={onResend}
              disabled={resending}
              className='cursor-pointer'
            >
              {resending ? (
                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
              ) : (
                <RotateCcw className='mr-2 h-3.5 w-3.5' />
              )}
              Resend (rotates link)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className='cursor-pointer text-red-400 focus:text-red-300'
            >
              <X className='mr-2 h-3.5 w-3.5' />
              Cancel invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: JudgeInvitationStatus }) {
  const cls =
    status === 'ACCEPTED'
      ? 'border-emerald-800/40 bg-emerald-900/20 text-emerald-300'
      : status === 'DECLINED'
        ? 'border-red-900/40 bg-red-950/30 text-red-300'
        : status === 'EXPIRED'
          ? 'border-amber-800/40 bg-amber-950/30 text-amber-300'
          : 'border-white/10 bg-white/5 text-gray-400';
  return (
    <Badge
      className={`rounded border px-1.5 py-0.5 text-[9px] tracking-wider uppercase ${cls}`}
    >
      {status.toLowerCase()}
    </Badge>
  );
}

function formatRel(value: string): string {
  const d = new Date(value);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}
