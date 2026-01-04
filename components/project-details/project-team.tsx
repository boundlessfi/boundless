'use client';

import React from 'react';
import { TeamList, TeamMember } from '@/components/ui/TeamList';
import { Crowdfunding } from '@/types/project';

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
        if (member.email !== crowdfund.project.creator.email) {
          members.push({
            id: member.email,
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
