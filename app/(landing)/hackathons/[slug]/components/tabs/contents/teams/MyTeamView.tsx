'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Settings,
  LogOut,
  Crown,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { Team, TeamMember } from '@/lib/api/hackathons/teams';
import {
  useHackathon,
  useLeaveTeam,
  useInviteToTeam,
  useInvitationActions,
  useTransferLeadership,
  useRefreshHackathon,
} from '@/hooks/hackathon/use-hackathon-queries';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useRequireAuthForAction } from '@/hooks/use-require-auth-for-action';
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
import { CreateTeamPostModal } from '@/components/hackathons/team-formation/CreateTeamPostModal';

interface MyTeamViewProps {
  team: Team;
  hackathonSlug: string;
}

const MyTeamView = ({ team, hackathonSlug }: MyTeamViewProps) => {
  const { user } = useOptionalAuth();
  const isLeader = team.leader.id === user?.id;
  const { data: hackathon } = useHackathon(hackathonSlug);

  const leaveMutation = useLeaveTeam(hackathonSlug);
  const inviteMutation = useInviteToTeam(hackathonSlug);
  const transferMutation = useTransferLeadership(hackathonSlug);
  const refresh = useRefreshHackathon(hackathonSlug);
  const { withAuth } = useRequireAuthForAction();

  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleLeave = withAuth(async () => {
    await leaveMutation.mutateAsync(team.id);
    setIsLeaveDialogOpen(false);
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = inviteIdentifier.trim();
    if (!identifier) return;

    setIsVerifying(true);
    setVerificationError(null);

    // Backend resolves the identifier (email, username, or user id) and
    // returns a clear error if the user isn't registered, so we no longer
    // pre-check via getUserProfileByUsername (which only handled usernames).
    try {
      await inviteMutation.mutateAsync({
        teamId: team.id,
        inviteeIdentifier: identifier,
        message: inviteMessage,
      });

      setInviteIdentifier('');
      setInviteMessage('');
      setVerificationError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to send invitation. Please try again.';
      setVerificationError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedMember) return;
    await transferMutation.mutateAsync({
      teamId: team.id,
      newLeaderId: selectedMember.id,
    });
    setIsTransferDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className='animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500'>
      {/* Team Header */}
      <div className='bg-background-card flex flex-col justify-between gap-6 rounded-3xl border border-white/5 p-6 md:flex-row md:items-center md:p-10'>
        <div className='flex flex-col items-start gap-4 sm:flex-row sm:gap-6'>
          <div className='text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#232B20] text-xl font-black sm:h-16 sm:w-16 sm:text-2xl'>
            {team.teamName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className='text-xl font-bold text-white sm:text-2xl'>
              {team.teamName}
            </h2>
            <div className='mt-1 flex flex-wrap items-center gap-2 sm:gap-3'>
              <span className='text-primary text-sm font-bold'>
                {team.memberCount} / {team.maxSize} Members
              </span>
              <span className='hidden h-1 w-1 rounded-full bg-gray-700 sm:block' />
              <span className='text-sm text-gray-500'>
                {team.isOpen ? 'Open for Recruitment' : 'Closed'}
              </span>
            </div>
            <p className='mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-gray-400 sm:mt-4 sm:text-base'>
              {team.description}
            </p>

            {/* Roles Needed inside Header */}
            {team.lookingFor && team.lookingFor.length > 0 && (
              <div className='mt-5 flex flex-wrap gap-2'>
                {team.lookingFor.map((roleObj, idx) => (
                  <div
                    key={idx}
                    className='border-primary/20 bg-primary/5 text-primary rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-wider uppercase'
                  >
                    {typeof roleObj === 'string' ? roleObj : roleObj.role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex shrink-0 gap-3'>
          {isLeader && (
            <BoundlessButton
              variant='outline'
              className='h-12 rounded-xl border-white/10 px-6 font-bold hover:bg-white/5'
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings className='mr-2 h-4 w-4' /> Edit Team
            </BoundlessButton>
          )}
          <BoundlessButton
            variant='outline'
            className='h-12 rounded-xl border-red-500/20 px-6 font-bold text-red-500 hover:bg-red-500/10'
            onClick={() => setIsLeaveDialogOpen(true)}
            loading={leaveMutation.isPending}
          >
            <LogOut className='mr-2 h-4 w-4' /> Leave Team
          </BoundlessButton>
        </div>
      </div>

      <div className='flex flex-col gap-8'>
        {/* Invite Builders Section (Horizontal) */}
        {isLeader && (
          <div className='bg-background-card rounded-3xl border border-white/5 p-6 md:p-8'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-end'>
              <div className='flex-1 space-y-4'>
                <div className='flex items-center gap-2'>
                  <UserPlus className='text-primary h-5 w-5' />
                  <h3 className='text-lg font-bold text-white'>
                    Invite Builders
                  </h3>
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                      Email
                    </label>
                    <input
                      type='email'
                      placeholder='teammate@example.com'
                      value={inviteIdentifier}
                      onChange={e => {
                        setInviteIdentifier(e.target.value);
                        setVerificationError(null);
                      }}
                      className='focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-sm text-white placeholder-gray-500 transition-all outline-none'
                    />
                    {verificationError && (
                      <p className='mt-1 text-xs font-bold text-red-500/80'>
                        {verificationError}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                      INVITATION MESSAGE (OPTIONAL)
                    </label>
                    <input
                      type='text'
                      placeholder='Join our team for this hackathon!'
                      value={inviteMessage}
                      onChange={e => setInviteMessage(e.target.value)}
                      className='focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-500 transition-all outline-none'
                    />
                  </div>
                </div>
              </div>
              <BoundlessButton
                onClick={handleInvite}
                className='h-[52px] rounded-xl px-10 font-black'
                disabled={!inviteIdentifier || isVerifying}
                loading={inviteMutation.isPending || isVerifying}
              >
                Send Invitation
              </BoundlessButton>
            </div>
          </div>
        )}

        {/* Member list - Full Width */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='flex items-center gap-2 text-xl font-bold text-white'>
              <Users className='text-primary h-5 w-5' /> Team Members
            </h3>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {/* Leader Card */}
            <div className='border-primary/20 flex items-center justify-between rounded-2xl border bg-[#232B20]/10 p-4 sm:p-5'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='shrink-0'>
                  <BasicAvatar
                    image={team.leader.image}
                    name={team.leader.name}
                    username={team.leader.username}
                  />
                </div>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <span className='bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-none font-black uppercase'>
                      <Crown className='h-3 w-3' /> Leader
                    </span>
                  </div>
                </div>
              </div>
              {isLeader && (
                <ShieldCheck className='text-primary/50 hidden h-5 w-5 sm:block' />
              )}
            </div>

            {/* Other Members */}
            {Array.isArray(team.members) &&
              team.members
                .filter(
                  (m): m is TeamMember =>
                    typeof m !== 'string' && m.userId !== team.leader.id
                )
                .map(member => (
                  <div
                    key={member.userId}
                    className='group flex gap-4 rounded-2xl border border-white/5 bg-[#141517] p-4 transition-all hover:bg-[#1A1B1E] sm:p-5'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3 sm:gap-4'>
                        <div className='shrink-0'>
                          <BasicAvatar
                            image={member.image}
                            name={member.name}
                            username={member.username}
                          />
                        </div>
                      </div>
                    </div>
                    {isLeader && (
                      <BoundlessButton
                        variant='outline'
                        size='sm'
                        className='hover:text-primary mt-2 h-9 w-full border-white/5 text-[10px] font-black tracking-widest text-gray-400 uppercase sm:opacity-0 sm:group-hover:opacity-100'
                        onClick={() => {
                          setSelectedMember({
                            id: member.userId,
                            name: member.name,
                          });
                          setIsTransferDialogOpen(true);
                        }}
                        loading={transferMutation.isPending}
                      >
                        Transfer Lead
                      </BoundlessButton>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CreateTeamPostModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        hackathonSlugOrId={hackathonSlug}
        teamMax={hackathon?.teamMax}
        initialData={team}
      />

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent className='bg-background-card border-white/10 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Team</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              {(() => {
                const otherMemberCount = Math.max(
                  0,
                  (team.members?.length ?? 0) - 1
                );
                if (isLeader && otherMemberCount > 0) {
                  return `Are you sure? You're the leader. Leadership will be reassigned to one of the remaining ${otherMemberCount} member${otherMemberCount === 1 ? '' : 's'} automatically. If you'd rather pick the next leader yourself, cancel and use "Transfer Lead" first. This action cannot be undone.`;
                }
                if (isLeader) {
                  return "Are you sure you want to leave this team? You're the only member, so the team will be deleted. This action cannot be undone.";
                }
                return 'Are you sure you want to leave this team? This action cannot be undone.';
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-white/5 bg-white/5 text-white hover:bg-white/10'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              className='bg-red-500 text-white hover:bg-red-600'
            >
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
      >
        <AlertDialogContent className='bg-background-card border-white/10 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Leadership</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              Are you sure you want to transfer leadership to{' '}
              <span className='font-bold text-white'>
                {selectedMember?.name}
              </span>
              ? You will lose leader permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-white/5 bg-white/5 text-white hover:bg-white/10'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransfer}
              className='bg-primary hover:bg-primary/90 text-black'
            >
              Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTeamView;
