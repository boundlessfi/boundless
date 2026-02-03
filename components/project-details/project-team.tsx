'use client';

import React from 'react';
import { TeamList, TeamMember } from '@/components/ui/TeamList';
import { Crowdfunding } from '@/features/projects/types';

interface ProjectTeamProps {
  crowdfund: Crowdfunding;
}

export function ProjectTeam({ crowdfund }: ProjectTeamProps) {
  const teamMembers: TeamMember[] = React.useMemo(() => {
    const members: TeamMember[] = [];

    if (crowdfund.project.creator) {
      members.push({
        id: crowdfund.project.creator.id,
        name: crowdfund.project.creator.name,
        role: 'OWNER',
        avatar: crowdfund.project.creator.image,
        username: crowdfund.project.creator.username,
      });
    }

    if (crowdfund.team && crowdfund.team.length > 0) {
      crowdfund.team.forEach(member => {
        // Only filter out if email matches and is present, OR if id matches
        const isCreator =
          (member.email && member.email === crowdfund.project.creator.email) ||
          (member.username &&
            member.username === crowdfund.project.creator.username);

        if (!isCreator) {
          members.push({
            id: member.email || member.username || Math.random().toString(),
            name: member.name,
            role: member.role === 'OWNER' ? 'OWNER' : 'MEMBER',
            avatar: member?.image,
            username: member.username,
          });
        }
      });
    }

    return members;
  }, [crowdfund.project.creator, crowdfund.team]);

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
