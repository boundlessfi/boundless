'use client';

import { useParams, useRouter } from 'next/navigation';
import { BoundlessButton } from '@/components/buttons';
import { IconUsers, IconUserPlus, IconLogout } from '@tabler/icons-react';
import {
  useHackathon,
  useMyTeam,
  useJoinHackathon,
  useLeaveHackathon,
} from '@/hooks/hackathon/use-hackathon-queries';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useAuth } from '@/hooks/use-auth';
import SharePopover from '@/components/common/SharePopover';
import { toast } from 'sonner';

const ActionButtons = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { currentHackathon: hackathon, refreshCurrentHackathon } =
    useHackathonData();
  const { data: myTeam } = useMyTeam(slug);

  const joinMutation = useJoinHackathon(slug);
  const leaveMutation = useLeaveHackathon(slug);

  const isParticipant = user
    ? !!hackathon?.isParticipant ||
      (hackathon?.participants || []).some((p: any) => p.userId === user.id)
    : false;

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync();
      await refreshCurrentHackathon();
      toast.success('Successfully joined the hackathon!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join hackathon');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      toast.success('You have left the hackathon');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave hackathon');
    }
  };

  const handleTabChange = (tab: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('tab', tab);
    router.push(`?${searchParams.toString()}`);

    const tabsElement = document.getElementById('hackathon-tabs');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isRegistrationClosed =
    hackathon?.registrationOpen === false ||
    (hackathon?.registrationDeadline &&
      new Date(hackathon.registrationDeadline) < new Date()) ||
    ['JUDGING', 'COMPLETED', 'ARCHIVED', 'CANCELLED'].includes(
      hackathon?.status || ''
    );

  const isIndividualOnly = hackathon?.participantType === 'INDIVIDUAL';

  return (
    <div className='flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center'>
      {!isParticipant ? (
        <BoundlessButton
          className='s d h-12 w-full rounded-xl bg-[#A7F950] px-8 font-bold text-black hover:bg-[#A7F950]/90 disabled:bg-white/5 disabled:text-white/20 md:w-auto'
          icon={!isRegistrationClosed && <IconUserPlus size={20} />}
          onClick={handleJoin}
          loading={joinMutation.isPending}
          disabled={isRegistrationClosed}
        >
          {isRegistrationClosed ? 'REGISTRATION CLOSED' : 'JOIN HACKATHON'}
        </BoundlessButton>
      ) : (
        <div className='flex w-full items-center gap-2 md:w-auto'>
          <BoundlessButton
            variant='outline'
            className='h-12 flex-1 rounded-xl border-[#A7F950]/20 bg-[#232B20]/40 px-8 font-black text-[#A7F950] md:flex-none'
            disabled
          >
            REGISTERED
          </BoundlessButton>
          <BoundlessButton
            variant='outline'
            size='icon'
            className='h-12 w-12 shrink-0 rounded-xl border-red-500/20 bg-red-500/5 text-red-500 hover:border-red-500/30 hover:bg-red-500/10'
            onClick={handleLeave}
            loading={leaveMutation.isPending}
            title='Leave Hackathon'
          >
            <IconLogout size={20} />
          </BoundlessButton>
        </div>
      )}

      <div className='flex w-full gap-3 md:w-auto'>
        {!isIndividualOnly && (
          <BoundlessButton
            variant='outline'
            fullWidth
            className='h-12 flex-1 rounded-xl border-white/10 bg-white/5 px-6 font-black transition-all hover:border-white/20 hover:bg-white/10'
            onClick={() => handleTabChange('team-formation')}
            icon={<IconUsers size={20} />}
          >
            {myTeam ? 'MY TEAM' : 'FIND TEAM'}
          </BoundlessButton>
        )}

        <SharePopover title={hackathon?.name} className='relative shrink-0' />
      </div>
    </div>
  );
};

export default ActionButtons;
