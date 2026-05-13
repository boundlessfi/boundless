'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarClock, Gavel, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HackathonBanner } from '@/components/judge/HackathonBanner';
import { DeadlineBadge } from '@/components/judge/DeadlineBadge';
import {
  useAcceptJudgeInvitation,
  useDeclineJudgeInvitation,
  useJudgeInvitationPreview,
} from '@/hooks/judge/use-judge-queries';
import { formatJudgeDate } from '@/components/judge/utils';

export default function JudgeInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token ?? '';

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { data, isPending, isError, error } = useJudgeInvitationPreview(token);

  const accept = useAcceptJudgeInvitation(token);
  const decline = useDeclineJudgeInvitation(token);

  const [showDisplayName, setShowDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState('');

  if (isPending || sessionLoading) {
    return (
      <div className='mx-auto max-w-2xl'>
        <div className='h-40 animate-pulse rounded-2xl bg-white/5 sm:h-52' />
        <div className='mt-4 h-48 animate-pulse rounded-2xl bg-white/5' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <FailState
        title='Invitation not found'
        body={
          error instanceof Error
            ? error.message
            : 'This invitation link is no longer valid.'
        }
      />
    );
  }

  const isPending_ = data.status === 'PENDING' && !data.isExpired;
  const emailMismatch =
    !!session?.user?.email &&
    session.user.email.toLowerCase() !== data.email.toLowerCase();

  const authReturnPath = `/judge/invitations/${token}`;
  const signInHref = `/auth?mode=signin&callbackUrl=${encodeURIComponent(authReturnPath)}`;
  const signUpHref = `/auth?mode=signup&email=${encodeURIComponent(
    data.email
  )}&callbackUrl=${encodeURIComponent(authReturnPath)}`;

  const onAccept = () => {
    if (!session) {
      router.push(signInHref);
      return;
    }
    accept.mutate(displayName ? { displayName } : {}, {
      onSuccess: () => router.push(`/judge/${data.hackathon.id}`),
    });
  };

  const onDecline = () => {
    if (!session) {
      router.push(signInHref);
      return;
    }
    decline.mutate(undefined, {
      onSuccess: () => router.push('/judge'),
    });
  };

  return (
    <div className='mx-auto max-w-2xl'>
      <HackathonBanner
        banner={data.hackathon.banner}
        name={data.hackathon.name}
        heightClassName='h-44 sm:h-56'
      >
        <div>
          <p className='inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-[10px] tracking-wider text-white/90 uppercase backdrop-blur'>
            <Gavel className='h-3 w-3' />
            Judge invitation
          </p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
            {data.hackathon.name}
          </h1>
          {data.hackathon.organization?.name && (
            <p className='mt-1 text-sm text-white/80'>
              Hosted by {data.hackathon.organization.name}
            </p>
          )}
        </div>
      </HackathonBanner>

      <div className='mt-4 rounded-2xl border border-white/5 bg-[#101010] p-6'>
        {/* Inviter row */}
        {data.invitedBy && (
          <div className='flex items-center gap-3'>
            <Avatar className='h-9 w-9 border border-white/10'>
              <AvatarImage
                src={data.invitedBy.image ?? undefined}
                alt={data.invitedBy.name}
              />
              <AvatarFallback className='bg-white/5 text-[10px]'>
                {(data.invitedBy.name ?? '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className='text-sm text-gray-300'>
              <span className='font-medium text-white'>
                {data.invitedBy.name}
              </span>{' '}
              invited{' '}
              <span className='font-medium text-white'>{data.email}</span>
            </p>
          </div>
        )}

        {/* Optional message */}
        {data.message && (
          <blockquote className='border-primary/40 mt-5 rounded-r-md border-l-2 bg-white/[0.02] px-4 py-3 text-sm text-gray-300 italic'>
            &ldquo;{data.message}&rdquo;
          </blockquote>
        )}

        {/* Meta line */}
        <div className='mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
          <DeadlineBadge
            deadline={data.hackathon.judgingEnd}
            prefix='Judging ends'
          />
          <span className='inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5'>
            <CalendarClock className='h-3 w-3' />
            Invitation expires {formatJudgeDate(data.expiresAt)}
          </span>
        </div>

        {/* Email mismatch */}
        {emailMismatch && (
          <p className='mt-5 rounded-md border border-amber-800/40 bg-amber-950/30 p-3 text-xs text-amber-200'>
            You are signed in as <strong>{session?.user?.email}</strong>. This
            invitation was sent to <strong>{data.email}</strong>. Sign out and
            sign in with the invited email to accept.
          </p>
        )}

        {/* Action area */}
        {isPending_ ? (
          <div className='mt-6 space-y-3'>
            {!emailMismatch && (
              <>
                <div className='flex flex-col gap-2 sm:flex-row'>
                  <Button
                    onClick={onAccept}
                    disabled={accept.isPending}
                    className='bg-primary hover:bg-primary/90 text-primary-foreground h-11 flex-1 text-sm font-semibold'
                  >
                    {accept.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Accepting&hellip;
                      </>
                    ) : session ? (
                      'Accept and start judging'
                    ) : (
                      'Sign in to accept'
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={onDecline}
                    disabled={decline.isPending}
                    className='h-11 border-white/10 bg-transparent text-gray-300 hover:bg-white/5'
                  >
                    {decline.isPending ? 'Declining…' : 'Decline'}
                  </Button>
                </div>

                {!session ? (
                  <p className='text-center text-xs text-gray-500'>
                    New to Boundless?{' '}
                    <Link
                      href={signUpHref}
                      className='text-primary hover:underline'
                    >
                      Create an account
                    </Link>{' '}
                    with {data.email}.
                  </p>
                ) : showDisplayName ? (
                  <div className='rounded-lg border border-white/5 bg-black/40 p-3'>
                    <label className='mb-1.5 block text-[10px] tracking-wider text-gray-500 uppercase'>
                      Public display name (optional)
                    </label>
                    <input
                      type='text'
                      value={displayName}
                      maxLength={120}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={
                        data.displayName ?? session?.user?.name ?? ''
                      }
                      className='focus:border-primary/40 focus:ring-primary/30 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:ring-1 focus:outline-none'
                    />
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={() => setShowDisplayName(true)}
                    className='text-center text-xs text-gray-500 hover:text-gray-300'
                  >
                    Customise display name
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className='mt-6'>
            <p className='text-sm text-gray-400'>
              {data.isExpired
                ? 'This invitation has expired. Ask the organizer to send a new one.'
                : `This invitation is ${data.status.toLowerCase()} and cannot be acted on.`}
            </p>
            <Link
              href='/judge'
              className='text-primary mt-3 inline-block text-sm hover:underline'
            >
              Go to judge portal →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FailState({ title, body }: { title: string; body: string }) {
  return (
    <div className='mx-auto max-w-md rounded-2xl border border-white/5 bg-[#101010] p-8 text-center'>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <p className='mt-2 text-sm text-gray-500'>{body}</p>
      <Link
        href='/judge'
        className='text-primary mt-4 inline-block text-sm hover:underline'
      >
        Back to judge portal →
      </Link>
    </div>
  );
}
