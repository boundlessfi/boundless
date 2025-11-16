'use client';

import { TeamList, TeamMember } from '@/components/ui/TeamList';
import { FilterControls } from './FilterControls';

interface FollowersContentProps {
  users?: TeamMember[];
  onMemberClick: (member: TeamMember) => void;
  sortFilter: string;
  setSortFilter: (filter: string) => void;
}

export function FollowersContent({
  users,
  onMemberClick,
  sortFilter,
  setSortFilter,
}: FollowersContentProps) {
  return (
    <>
      <FilterControls
        sortFilter={sortFilter}
        setSortFilter={setSortFilter}
        statusFilter='Status'
        setStatusFilter={() => {}}
        categoryFilter='Category'
        setCategoryFilter={() => {}}
        showAllFilters={false}
      />

      <TeamList
        members={users || []}
        onMemberClick={onMemberClick}
        emptyStateTitle='No Followers'
        emptyStateDescription="This user doesn't have any followers yet."
      />
    </>
  );
}
