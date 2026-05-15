'use client';

import { useParams } from 'next/navigation';
import { Mail, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/use-auth';
import {
  useMyInvitations,
  useInvitationActions,
} from '@/hooks/hackathon/use-hackathon-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { BoundlessButton } from '@/components/buttons';
import type { TeamInvitation } from '@/lib/api/hackathons';

/**
 * Pending team invitations the current user has received for THIS hackathon.
 *
 * Renders only when authenticated AND the user has at least one pending
 * invite — quiet by default, visible exactly when it matters. Lives in
 * the sidebar above MySubmissionPanel so users who land on the hackathon
 * page after an email/notification can see and act on invitations
 * without having to navigate anywhere.
 *
 * Multi-invite flows (rare): the user has invitations from multiple
 * teams in the same hackathon. The backend's auto-accept on verify
 * skips this case deliberately, so this panel is the explicit-choice
 * surface for it. Each row has its own Accept/Reject pair with
 * spinner scoping so other rows don't all spin during a single action.
 */
export default function MyInvitationsPanel() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const { data: invitationsData, isFetching: isFetchingInvitations } =
    useMyInvitations(slug, 'pending', isAuthenticated && !!slug);
  // Backend wraps inconsistently across the codebase; pull defensively.
  const pendingInvitations: TeamInvitation[] = Array.isArray(
    (invitationsData as { invitations?: TeamInvitation[] } | undefined)
      ?.invitations
  )
    ? ((invitationsData as { invitations: TeamInvitation[] }).invitations ?? [])
    : [];

  const { acceptAction, rejectAction } = useInvitationActions(slug);

  if (!isAuthenticated || authLoading) return null;

  // Skeleton only on first fetch when there's nothing to show yet — once
  // we have data, refetches happen silently in the background and we
  // keep showing what we have.
  if (isFetchingInvitations && pendingInvitations.length === 0) {
    return (
      <div className='space-y-3 rounded-2xl border border-white/5 bg-linear-to-b from-[#1C1D1B] to-[#07090E] p-5'>
        <Skeleton className='h-3 w-32' />
        <Skeleton className='h-12 w-full rounded-xl' />
      </div>
    );
  }

  if (pendingInvitations.length === 0) return null;

  return (
    <div className='space-y-4 rounded-2xl border border-white/5 bg-linear-to-b from-[#1C1D1B] to-[#07090E] p-5'>
      <div className='flex items-center justify-between'>
        <p className='text-[11px] font-semibold tracking-widest text-gray-500 uppercase'>
          Team Invitations
        </p>
        <span className='inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300'>
          <Mail className='h-3 w-3' />
          {pendingInvitations.length}
        </span>
      </div>

      <div className='space-y-3'>
        {pendingInvitations.map(inv => {
          // Backend returns inviter as a flat { id, name, username, image }
          // (the FE type calls it Partial<Participant> but that's wrong).
          const inviter = inv.inviter as
            | { name?: string | null; username?: string | null }
            | null
            | undefined;
          const inviterName =
            inviter?.name || inviter?.username || 'A team leader';

          const expiresAt = inv.expiresAt ? new Date(inv.expiresAt) : null;
          const expiresInDays = expiresAt
            ? Math.max(
                0,
                Math.ceil(
                  (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              )
            : null;
          const isExpiringSoon = expiresInDays !== null && expiresInDays <= 1;

          const accepting =
            acceptAction.isPending && acceptAction.variables === inv.id;
          const rejecting =
            rejectAction.isPending && rejectAction.variables === inv.id;
          const anyActionInFlight = accepting || rejecting;

          return (
            <div
              key={inv.id}
              className='space-y-3 rounded-xl border border-white/5 bg-white/5 p-3'
            >
              <div>
                <p className='text-sm text-white'>
                  <span className='font-semibold'>{inviterName}</span>
                  <span className='text-gray-400'> invited you to a team</span>
                </p>
                {inv.message && (
                  <p className='mt-1.5 line-clamp-2 rounded-md border-l-2 border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-400 italic'>
                    "{inv.message}"
                  </p>
                )}
                <div className='mt-2 flex items-center gap-1.5 text-[11px] text-gray-500'>
                  <Clock
                    className={`h-3 w-3 ${isExpiringSoon ? 'text-amber-400' : ''}`}
                  />
                  <span
                    className={isExpiringSoon ? 'text-amber-400' : undefined}
                  >
                    {expiresInDays === null
                      ? 'No expiry set'
                      : expiresInDays === 0
                        ? 'Expires today'
                        : expiresInDays === 1
                          ? 'Expires tomorrow'
                          : `Expires in ${expiresInDays} days`}
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <BoundlessButton
                  size='sm'
                  className='flex-1 gap-1'
                  loading={accepting}
                  disabled={anyActionInFlight}
                  onClick={async () => {
                    try {
                      await acceptAction.mutateAsync(inv.id);
                      toast.success('Joined the team!');
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : 'Failed to accept invitation'
                      );
                    }
                  }}
                >
                  <Check className='h-3 w-3' />
                  Accept
                </BoundlessButton>
                <BoundlessButton
                  variant='outline'
                  size='sm'
                  className='flex-1 gap-1 border-white/10 text-gray-300 hover:text-white'
                  loading={rejecting}
                  disabled={anyActionInFlight}
                  onClick={async () => {
                    try {
                      await rejectAction.mutateAsync(inv.id);
                      toast.success('Invitation declined');
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : 'Failed to decline invitation'
                      );
                    }
                  }}
                >
                  <X className='h-3 w-3' />
                  Decline
                </BoundlessButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
