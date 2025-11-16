'use client';

import React from 'react';
import { CrowdfundingProject } from '@/lib/api/types';
import { TeamList, TeamMember } from '@/components/ui/TeamList';

interface ProjectTeamProps {
  project: CrowdfundingProject;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  // Create team members from real project data
  const teamMembers: TeamMember[] = React.useMemo(() => {
    const members: TeamMember[] = [];

    // Add project creator as owner
    if (project.creator) {
      members.push({
        id: project.creator._id,
        name: `${project.creator.profile?.firstName} ${project.creator.profile?.lastName}`,
        role: 'OWNER',
        avatar: (project.creator as { profile?: { avatar?: string } })?.profile
          ?.avatar,
        username: project.creator.profile?.username,
      });
    }

    // Add team members
    if (project.team && project.team.length > 0) {
      project.team.forEach(member => {
        // Skip if this member is already added as creator
        if (member._id !== project.creator._id) {
          members.push({
            id: member._id,
            name: `${member.profile?.firstName} ${member.profile?.lastName}`,
            role: member.role === 'OWNER' ? 'OWNER' : 'MEMBER',
            avatar: (member.profile as { avatar?: string })?.avatar,
            joinedAt: member.joinedAt,
            username: member.profile?.username,
          });
        }
      });
    }

    return members;
  }, [project.creator, project.team]);

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
