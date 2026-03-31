'use client';

import React from 'react';
import { TeamList, TeamMember } from '@/components/ui/TeamList';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface ProjectTeamProps {
  vm: ProjectViewModel;
}

export function ProjectTeam({ vm }: ProjectTeamProps) {
  const teamMembers: TeamMember[] = React.useMemo(() => {
    const members: TeamMember[] = [];

    if (vm.creator) {
      members.push({
        id: vm.creator.id,
        name: vm.creator.name,
        role: 'OWNER',
        avatar: vm.creator.image,
        username: vm.creator.username,
      });
    }

    if (vm.team.length > 0) {
      vm.team.forEach(member => {
        const isCreator =
          (member.email &&
            vm.creator &&
            member.email === vm.creator.username) ||
          (member.username &&
            vm.creator &&
            member.username === vm.creator.username);

        if (!isCreator) {
          members.push({
            id: member.email || member.username || Math.random().toString(),
            name: member.name,
            role: member.role === 'OWNER' ? 'OWNER' : 'MEMBER',
            avatar: member.image,
            username: member.username,
          });
        }
      });
    }

    return members;
  }, [vm.creator, vm.team]);

  const handleMemberClick = (member: TeamMember) => {
    window.open(`/profile/${member.username}`, '_blank');
  };

  return (
    <TeamList
      members={teamMembers}
      onMemberClick={handleMemberClick}
      emptyStateTitle='No Team Members'
      emptyStateDescription="This project doesn't have any team members yet."
    />
  );
}
