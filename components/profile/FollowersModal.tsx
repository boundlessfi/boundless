'use client';

import BoundlessSheet from '../sheet/boundless-sheet';
import { TeamMember } from '@/components/ui/TeamList';
import { Project } from '@/types/project';
import { ModalTabs } from './ModalTabs';
import { FollowersContent } from './FollowersContent';
import { useProjectFilters } from './useProjectFilters';

interface FollowersModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  type: 'followers' | 'following';
  users?: TeamMember[];
  projects?: Project[];
}

export default function FollowersModal({
  open,
  setOpen,
  type,
  users,
  projects,
}: FollowersModalProps) {
  const {
    activeTab,
    setActiveTab,
    sortFilter,
    setSortFilter,
    getFilteredProjects,
  } = useProjectFilters(projects || []);

  const handleMemberClick = (member: TeamMember) => {
    window.open(`/profile/${member.username}`, '_blank');
  };

  const displayUsers = users || [];
  const displayProjects = getFilteredProjects();

  return (
    <BoundlessSheet
      open={open}
      setOpen={setOpen}
      title={type === 'followers' ? 'Followers' : 'Following'}
      size='large'
    >
      <div className='relative mx-auto max-w-[720px]'>
        {type === 'following' ? (
          <ModalTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            users={displayUsers}
            projects={displayProjects}
            onMemberClick={handleMemberClick}
          />
        ) : (
          <FollowersContent
            users={displayUsers}
            onMemberClick={handleMemberClick}
            sortFilter={sortFilter}
            setSortFilter={setSortFilter}
          />
        )}
      </div>
    </BoundlessSheet>
  );
}
