'use client';

import { useMemo } from 'react';
import { Plus, User as UserIcon, Users, Lightbulb } from 'lucide-react';
import { TeamMemberCard, type TeamMemberCardData } from './team-member-card';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface TeamTabProps {
  vm: ProjectViewModel;
}

/**
 * Builds the display list of members for a project.
 * Mirrors the merge logic from the legacy ProjectTeam component:
 *   - The creator is always shown first as OWNER.
 *   - Team members that match the creator (by username) are skipped to
 *     avoid duplicates.
 */
function buildMembers(vm: ProjectViewModel): TeamMemberCardData[] {
  const members: TeamMemberCardData[] = [];

  if (vm.creator) {
    members.push({
      id: vm.creator.id,
      name: vm.creator.name,
      role: 'Owner',
      isOwner: true,
      avatar: vm.creator.image,
      username: vm.creator.username,
    });
  }

  for (const member of vm.team ?? []) {
    const matchesCreator =
      vm.creator &&
      ((member.email && member.email === vm.creator.username) ||
        (member.username && member.username === vm.creator.username));

    if (matchesCreator) continue;

    members.push({
      id: member.email || member.username || `${member.name}-${members.length}`,
      name: member.name,
      role: member.role || 'Member',
      isOwner: member.role === 'OWNER',
      avatar: member.image,
      username: member.username,
      email: member.email,
    });
  }

  return members;
}

export function TeamTab({ vm }: TeamTabProps) {
  const members = useMemo(() => buildMembers(vm), [vm]);

  const handleProfileClick = (member: TeamMemberCardData) => {
    if (!member.username) return;
    window.open(`/profile/${member.username}`, '_blank');
  };

  if (members.length === 0) {
    return <TeamEmptyState />;
  }

  return (
    <section className='space-y-8'>
      {/* Header */}
      <header className='space-y-2'>
        <h2 className='text-2xl font-bold text-white'>Project Team</h2>
        <p className='max-w-2xl text-sm leading-relaxed text-gray-500'>
          The core contributors building {vm.title}.
        </p>
      </header>

      {/* Team grid */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {members.map(member => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onProfileClick={handleProfileClick}
          />
        ))}
      </div>
    </section>
  );
}

function TeamEmptyState() {
  return (
    <div className='flex flex-col items-center px-4 py-10 text-center sm:py-16'>
      {/* Decorative cluster */}
      <div className='border-stepper-border/60 bg-background-card/60 shadow-primary/20 relative mb-8 flex h-44 w-44 items-center justify-center rounded-full border shadow-[0_0_80px_-10px]'>
        <div className='border-stepper-border bg-inactive absolute left-6 flex h-12 w-12 items-center justify-center rounded-full border'>
          <UserIcon className='h-5 w-5 text-gray-500' />
        </div>
        <div className='border-primary bg-primary text-primary-foreground relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg'>
          <Users className='h-7 w-7' />
        </div>
        <div className='border-stepper-border bg-inactive absolute right-6 flex h-12 w-12 items-center justify-center rounded-full border'>
          <Plus className='h-5 w-5 text-gray-500' />
        </div>
      </div>

      <h3 className='text-xl font-bold text-white sm:text-2xl'>
        No team members yet
      </h3>
      <p className='mt-3 max-w-md text-sm leading-relaxed text-gray-500'>
        This project doesn&apos;t have any team members yet. Check back soon as
        the team grows.
      </p>

      {/* Did you know card */}
      <div className='border-stepper-border bg-background-card mt-10 flex w-full max-w-xl items-start gap-4 rounded-2xl border p-5 text-left'>
        <div className='border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border'>
          <Lightbulb className='text-primary h-5 w-5' />
        </div>
        <div className='space-y-1'>
          <h4 className='text-sm font-semibold text-white'>Did you know?</h4>
          <p className='text-sm leading-relaxed text-gray-500'>
            Projects with a listed team of 3 or more members receive 45% more
            community interest and investor inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
