import { Zap, Globe2Icon } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Hackathon, Participant } from '@/lib/api/hackathons';
import { ExtendedBadge } from '@/components/hackathons/ExtendedBadge';

type HackathonStatus = Hackathon['status'];

function getStatusLabel(
  status: HackathonStatus,
  startDate?: string,
  submissionDeadline?: string
) {
  switch (status) {
    case 'ACTIVE': {
      const now = Date.now();
      if (startDate && now < new Date(startDate).getTime()) return 'Upcoming';
      if (submissionDeadline && now > new Date(submissionDeadline).getTime())
        return 'Submissions Closed';
      return 'Submissions Open';
    }
    case 'JUDGING':
      return 'Judging';
    case 'UPCOMING':
      return 'Upcoming';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return 'Draft';
  }
}

function isSubmissionsOpen(
  status: HackathonStatus,
  startDate?: string,
  submissionDeadline?: string
) {
  if (status !== 'ACTIVE') return false;
  const now = Date.now();
  if (startDate && now < new Date(startDate).getTime()) return false;
  if (submissionDeadline && now > new Date(submissionDeadline).getTime())
    return false;
  return true;
}

interface TitleAndInfoProps {
  title?: string;
  status?: HackathonStatus;
  participantType?: 'INDIVIDUAL' | 'TEAM' | 'TEAM_OR_INDIVIDUAL';
  participantCount?: number;
  venueType?: 'VIRTUAL' | 'PHYSICAL';
  participants?: Participant[];
  startDate?: string;
  submissionDeadline?: string;
  submissionDeadlineOriginal?: string;
}

const TitleAndInfo = ({
  title = 'Boundless Global Hackathon',
  status = 'UPCOMING',
  participantType = 'INDIVIDUAL',
  participantCount = 0,
  venueType = 'VIRTUAL',
  participants = [],
  startDate,
  submissionDeadline,
  submissionDeadlineOriginal,
}: TitleAndInfoProps) => {
  const statusLabel = getStatusLabel(status, startDate, submissionDeadline);
  const isActive = isSubmissionsOpen(status, startDate, submissionDeadline);
  const venueLabel = venueType === 'PHYSICAL' ? 'Physical' : 'Virtual';
  const typeLabel =
    participantType === 'TEAM'
      ? 'Team'
      : participantType === 'TEAM_OR_INDIVIDUAL'
        ? 'Team / Individual'
        : 'Individual';

  const displayParticipants = participants.slice(0, 5);

  return (
    <div className='flex flex-col gap-3'>
      <h1 className='text-2xl font-bold tracking-tight text-white md:text-3xl'>
        {title}
      </h1>

      <div className='flex flex-wrap items-center gap-3 text-sm font-medium text-white md:gap-4'>
        <span
          className={`flex items-center gap-1.5 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-gray-500'}`}
          />
          {statusLabel}
          <ExtendedBadge
            className='ml-1'
            submissionDeadline={submissionDeadline}
            submissionDeadlineOriginal={submissionDeadlineOriginal}
          />
        </span>

        <div className='flex h-5 items-center'>
          <Separator className='bg-[#334155]' orientation='vertical' />
        </div>

        <span className='flex items-center gap-1.5'>
          <Zap className='h-4 w-4' />
          {typeLabel}
        </span>

        <div className='flex h-5 items-center'>
          <Separator className='bg-[#334155]' orientation='vertical' />
        </div>

        <span className='flex items-center gap-1.5'>
          <Globe2Icon className='h-4 w-4' />
          {venueLabel}
        </span>

        {participantCount > 0 && (
          <>
            <div className='flex h-5 items-center'>
              <Separator className='bg-[#334155]' orientation='vertical' />
            </div>
            <div className='flex items-center pt-1 md:pt-0'>
              <AvatarGroup>
                {displayParticipants.map((participant, i) => (
                  <Avatar
                    key={participant.id || i}
                    className='h-6 w-6 border-2 dark:border-[#111]'
                  >
                    <AvatarImage
                      src={participant.user.profile.image || ''}
                      alt={participant.user.profile.name || `participant-${i}`}
                    />
                    <AvatarFallback>
                      {participant.user.profile.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participantCount > 5 && (
                  <AvatarGroupCount className='h-6 min-w-6 px-1 text-xs dark:border-[#111]'>
                    +{(participantCount - 5).toLocaleString()}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TitleAndInfo;
