'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, FileText, ShieldX, Trophy } from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { BoundlessButton } from '@/components/buttons';
import type { SubmissionStatus } from '@/lib/api/hackathons';

const STATUS_META: Record<
  SubmissionStatus,
  { label: string; className: string; Icon: typeof FileText }
> = {
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    Icon: FileText,
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    className: 'bg-primary/10 text-primary border-primary/20',
    Icon: Trophy,
  },
  DISQUALIFIED: {
    label: 'Disqualified',
    className: 'bg-red-500/10 text-red-300 border-red-500/20',
    Icon: ShieldX,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    Icon: CheckCircle2,
  },
};

export default function MySubmissionPanel() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const { currentHackathon } = useHackathonData();

  // The participant-scoped /my-submission endpoint requires auth. Gate the
  // hook on isAuthenticated so we don't trigger 401s for signed-out viewers.
  const { submission, isFetching } = useSubmission({
    hackathonSlugOrId: slug,
    autoFetch: isAuthenticated && !!slug,
  });

  if (!isAuthenticated || authLoading) return null;

  if (isFetching && !submission) {
    return (
      <div className='space-y-3 rounded-2xl border border-white/5 bg-linear-to-b from-[#1C1D1B] to-[#07090E] p-5'>
        <Skeleton className='h-3 w-24' />
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-lg' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const status = (submission.status ?? 'SUBMITTED') as SubmissionStatus;
  const meta = STATUS_META[status] ?? STATUS_META.SUBMITTED;
  const StatusIcon = meta.Icon;

  const deadline = currentHackathon?.submissionDeadline;
  const deadlinePassed = deadline
    ? Date.now() > new Date(deadline).getTime()
    : false;
  const hackathonClosed = [
    'COMPLETED',
    'JUDGING',
    'ARCHIVED',
    'CANCELLED',
  ].includes(currentHackathon?.status ?? '');
  // Withdrawn/disqualified submissions can't be resurrected from the form,
  // and edits aren't allowed once the deadline passes or the hackathon is in
  // judging/closed state.
  const canEdit =
    !deadlinePassed &&
    !hackathonClosed &&
    status !== 'DISQUALIFIED' &&
    status !== 'WITHDRAWN';

  const handleView = () => {
    window.open(
      `/projects/${submission.id}?type=submission`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleEdit = () => {
    router.push(`/hackathons/${slug}/submit`);
  };

  return (
    <div className='space-y-4 rounded-2xl border border-white/5 bg-linear-to-b from-[#1C1D1B] to-[#07090E] p-5'>
      <div className='flex items-center justify-between'>
        <p className='text-[11px] font-semibold tracking-widest text-gray-500 uppercase'>
          Your Submission
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
        >
          <StatusIcon className='h-3 w-3' />
          {meta.label}
        </span>
      </div>

      <div className='flex items-center gap-3'>
        {submission.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.logo}
            alt=''
            className='h-10 w-10 shrink-0 rounded-lg object-cover'
          />
        ) : (
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5'>
            <FileText className='h-4 w-4 text-gray-500' />
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-white'>
            {submission.projectName}
          </p>
          {submission.category && (
            <p className='truncate text-xs text-gray-500'>
              {submission.category}
            </p>
          )}
        </div>
      </div>

      <div className='flex gap-2'>
        <BoundlessButton
          variant='outline'
          size='sm'
          onClick={handleView}
          className='flex-1'
        >
          View
        </BoundlessButton>
        {canEdit && (
          <BoundlessButton
            variant='outline'
            size='sm'
            onClick={handleEdit}
            className='flex-1'
          >
            Edit
          </BoundlessButton>
        )}
      </div>
    </div>
  );
}
