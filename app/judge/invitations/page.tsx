'use client';

import Link from 'next/link';
import { CalendarClock, ChevronRight, Mail } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyJudgeInvitations } from '@/hooks/judge/use-judge-queries';
import { formatJudgeDate } from '@/components/judge/utils';

export default function JudgeInvitationsListPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin'>
      <InvitationsList />
    </AuthGuard>
  );
}

function InvitationsList() {
  const { data, isPending, isError } = useMyJudgeInvitations();

  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Pending invitations
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Invitations sent to your email that have not been accepted or
          declined.
        </p>
      </header>

      {isPending && (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='h-20 animate-pulse rounded-2xl bg-white/5'
            />
          ))}
        </div>
      )}

      {isError && (
        <p className='text-sm text-red-400'>Failed to load invitations.</p>
      )}

      {!isPending && !isError && (data?.length ?? 0) === 0 && (
        <div className='rounded-2xl border border-dashed border-white/10 bg-[#0c0c0c] p-12 text-center'>
          <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-gray-500'>
            <Mail className='h-5 w-5' />
          </span>
          <h2 className='mt-4 text-base font-medium text-white'>
            No pending invitations
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            Invitations from organizers will land here.
          </p>
        </div>
      )}

      {!isPending && data && data.length > 0 && (
        <ul className='space-y-3'>
          {data.map(inv => (
            <li key={inv.id}>
              <Link
                href={`/judge/invitations/${inv.token}`}
                className='hover:border-primary/30 group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#101010] px-5 py-4 transition-colors hover:bg-[#0e1311]'
              >
                <Avatar className='h-10 w-10 rounded-lg border border-white/10'>
                  <AvatarImage
                    src={inv.hackathon.organization?.logo ?? undefined}
                    alt={inv.hackathon.organization?.name ?? ''}
                    className='rounded-lg'
                  />
                  <AvatarFallback className='rounded-lg bg-white/5 text-[11px]'>
                    {(inv.hackathon.organization?.name ?? inv.hackathon.name)
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-white'>
                    {inv.hackathon.name}
                  </p>
                  <p className='mt-0.5 truncate text-xs text-gray-500'>
                    {inv.hackathon.organization?.name && (
                      <span>{inv.hackathon.organization.name}</span>
                    )}
                  </p>
                </div>
                <span className='hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-400 sm:inline-flex'>
                  <CalendarClock className='h-3 w-3' />
                  Expires {formatJudgeDate(inv.expiresAt)}
                </span>
                <ChevronRight className='h-4 w-4 shrink-0 text-gray-700 group-hover:text-gray-400' />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
