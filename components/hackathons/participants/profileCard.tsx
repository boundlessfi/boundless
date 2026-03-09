'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { ParticipantDisplay } from '@/lib/api/hackathons/index';
import Image from 'next/image';
import {
  MessageCircle,
  Users,
  CheckCircle2,
  UserPlus,
  Info,
  Loader2,
} from 'lucide-react';
import { useParticipants } from '@/hooks/hackathon/use-participants';
import Link from 'next/link';
import { useAuthStatus } from '@/hooks/use-auth';
import { useMessages } from '@/components/messages/MessagesProvider';
import { createConversation } from '@/lib/api/messages';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { InviteUserModal } from '../team-formation/InviteUserModal';
import { useFollow } from '@/hooks/use-follow';
import { useFollowStats } from '@/hooks/use-follow-stats';
import { getUserProfileByUsername } from '@/lib/api/auth';
import { reportError } from '@/lib/error-reporting';
import type { PublicUserProfile } from '@/features/projects/types';
import { toast } from 'sonner';

const BRAND_COLOR = '#a7f950';

interface ProfileCardProps {
  participant: ParticipantDisplay;
  onInviteClick?: () => void;
}

// Simple date formatter
const formatJoinDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export function ProfileCard({ participant, onInviteClick }: ProfileCardProps) {
  const [profileData, setProfileData] = useState<PublicUserProfile | null>(
    null
  );
  const [messageLoading, setMessageLoading] = useState(false);
  const { user } = useAuthStatus();
  const { openMessages } = useMessages();
  const {
    toggleFollow,
    isFollowing,
    isLoading: isFollowLoading,
  } = useFollow('USER', participant.userId);
  const { stats: followStats, refetch: refetchStats } = useFollowStats(
    participant.userId
  );

  const { participants, allParticipants, teams } = useParticipants();
  const isOwnProfile = user?.id === participant.userId;

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnProfile || messageLoading) return;
    setMessageLoading(true);
    try {
      const { conversation } = await createConversation(participant.userId);
      openMessages(conversation.id);
    } catch (err) {
      reportError(err, {
        context: 'profile-card-message',
        userId: participant.userId,
      });
      toast.error(
        err instanceof Error ? err.message : 'Failed to start conversation'
      );
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (participant.username) {
          const data = await getUserProfileByUsername(participant.username);
          setProfileData(data);
        }
      } catch (error) {
        reportError(error, {
          context: 'participant-profile',
          username: participant.username,
        });
      }
    };
    fetchProfile();
  }, [participant.username]);

  const teamMembers = useMemo(() => {
    if (participant.role === 'leader' && participant.teamId) {
      return participants.filter(
        p => p.teamId === participant.teamId && p.id !== participant.id
      );
    }
    return [];
  }, [participant, participants]);

  const isTeamLeader = participant.role === 'leader' && participant.teamId;

  const { currentHackathon } = useHackathonData();

  const currentUserParticipant = useMemo(() => {
    if (!user) return null;
    const currentUsername = user.username || (user.profile as any)?.username;
    const currentUserId = user.id || (user as any).userId;

    // Use allParticipants to find current user even if search filtering is active
    return allParticipants.find(
      p =>
        (currentUsername && p.username === currentUsername) ||
        (currentUserId && p.userId === currentUserId)
    );
  }, [user, allParticipants]);

  // Check if current user can invite this participant
  const canInvite = useMemo(() => {
    if (!user || !currentUserParticipant || !currentHackathon) {
      return false;
    }

    const currentUsername = user.username || (user.profile as any)?.username;
    const currentUserId = user.id || (user as any).userId;

    // 0. Only allow if hackathon allows teams
    if (currentHackathon.participantType === 'INDIVIDUAL') {
      return false;
    }

    // Don't invite yourself
    if (
      participant.id === currentUserParticipant.id ||
      (currentUsername && participant.username === currentUsername) ||
      (currentUserId && participant.userId === currentUserId)
    ) {
      return false;
    }

    // 1. Check leadership from participants list (enriched)
    const isEnrichedLeader =
      currentUserParticipant.role?.toLowerCase() === 'leader';

    // 2. Check leadership directly from teams list (fallback/backup)
    const isDirectLeader = teams.some(t => t.leaderId === currentUserId);

    const isLeader = isEnrichedLeader || isDirectLeader;

    return isLeader;
  }, [user, currentUserParticipant, participant, currentHackathon, teams]);

  return (
    <Card className='w-80 overflow-hidden border-zinc-800 bg-zinc-900 p-0 shadow-2xl'>
      {/* Header with gradient background and wave pattern */}
      <div
        className='relative overflow-hidden px-6 pt-6 pb-4'
        style={{
          background: `linear-gradient(135deg, ${BRAND_COLOR}15 0%, transparent 100%)`,
        }}
      >
        {/* Wave Background */}
        <div className='absolute top-0 right-0 -z-10 h-full w-full opacity-5'>
          <Image
            src='/wave.svg'
            alt=''
            fill
            className='object-cover'
            priority={false}
          />
        </div>

        <div className='flex items-start gap-4'>
          <Avatar
            className='h-16 w-16 border-2'
            style={{ borderColor: BRAND_COLOR }}
          >
            <AvatarImage src={participant.avatar} alt={participant.username} />
            <AvatarFallback className='bg-zinc-800 text-white'>
              {participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 pt-1'>
            <div className='mb-1 flex items-center gap-2'>
              <h3 className='text-lg font-bold text-white'>
                {participant.name}
              </h3>
              {participant.verified && (
                <CheckCircle2
                  className='h-4 w-4'
                  style={{ color: BRAND_COLOR }}
                />
              )}
            </div>
            <p className='text-sm text-zinc-400'>@{participant.username}</p>
            <p className='mt-0.5 text-xs text-zinc-500'>
              Joined {formatJoinDate(participant.joinedDate!)}
            </p>
          </div>
        </div>
      </div>

      <CardContent className='space-y-4 px-6 pb-6'>
        {/* Team Info */}
        {participant.teamName && (
          <div
            className='flex items-center gap-3 rounded-lg border border-zinc-800 p-3'
            style={{ backgroundColor: `${BRAND_COLOR}08` }}
          >
            <div
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'
              style={{ backgroundColor: `${BRAND_COLOR}20` }}
            >
              <Users className='h-4 w-4' style={{ color: BRAND_COLOR }} />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-white'>
                {participant.teamName}
              </p>
              <p className='text-xs text-zinc-400'>
                {isTeamLeader
                  ? `${teamMembers.length + 1} member${teamMembers.length + 1 !== 1 ? 's' : ''} • Team Leader`
                  : 'Team Member'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <Button
            onClick={async () => {
              await toggleFollow();
              refetchStats();
            }}
            disabled={isFollowLoading}
            className='flex-1 font-semibold transition-all'
            style={{
              backgroundColor: isFollowing ? '#27272a' : BRAND_COLOR,
              color: isFollowing ? '#ffffff' : '#000000',
            }}
            onMouseEnter={e => {
              if (!isFollowing) {
                e.currentTarget.style.backgroundColor = '#8ae63a';
              } else {
                e.currentTarget.style.backgroundColor = '#3f3f46';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = isFollowing
                ? '#27272a'
                : BRAND_COLOR;
            }}
          >
            {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Button>
          {!isOwnProfile && (
            <Button
              className='bg-zinc-800 text-white transition-colors hover:bg-zinc-700'
              size='icon'
              disabled={messageLoading}
              onClick={handleMessageClick}
              title='Message'
              aria-label='Message'
            >
              {messageLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <MessageCircle className='h-4 w-4' />
              )}
            </Button>
          )}
          {canInvite && (
            <Button
              className='bg-zinc-800 text-white transition-colors hover:bg-zinc-700'
              size='icon'
              onClick={e => {
                e.stopPropagation();
                onInviteClick?.();
              }}
              title='Invite to Team'
            >
              <UserPlus className='h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Team Members */}
        {isTeamLeader && teamMembers.length > 0 && (
          <div className='flex items-center gap-2'>
            <div className='flex -space-x-2'>
              {teamMembers.slice(0, 4).map(member => (
                <Link
                  href={`/profile/${member.username}`}
                  key={member.id}
                  target='_blank'
                >
                  <Avatar
                    className='h-8 w-8 border-2 border-zinc-900 transition-all hover:z-10 hover:border-[#a7f950]'
                    title={member.name}
                  >
                    <AvatarImage
                      src={member.avatar || '/placeholder.svg'}
                      alt={member.username}
                    />
                    <AvatarFallback className='bg-zinc-800 text-xs text-white'>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ))}
            </div>
            {teamMembers.length > 4 && (
              <span className='text-xs text-zinc-400'>
                +{teamMembers.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {participant.description && (
          <p className='line-clamp-3 text-sm leading-relaxed text-zinc-300'>
            {participant.description}
          </p>
        )}

        {/* Categories */}
        {participant.categories && participant.categories.length > 0 && (
          <div>
            <p className='mb-2 text-xs font-semibold text-zinc-400'>
              Interests
            </p>
            <div className='flex flex-wrap gap-2'>
              {participant.categories.map((category, index) => (
                <Badge
                  key={index}
                  variant='outline'
                  className='rounded-md border-zinc-800 bg-zinc-800/50 text-zinc-300 transition-colors hover:bg-zinc-800'
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className='bg-zinc-800' />

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <p className='text-lg font-bold text-white'>
              {profileData?.stats?.projectsCreated ?? participant.projects ?? 0}
            </p>
            <p className='text-xs text-zinc-400'>Projects</p>
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold text-white'>
              {followStats?.followers ?? participant.followers ?? 0}
            </p>
            <p className='text-xs text-zinc-400'>Followers</p>
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold text-white'>
              {followStats?.following ?? participant.following ?? 0}
            </p>
            <p className='text-xs text-zinc-400'>Following</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
