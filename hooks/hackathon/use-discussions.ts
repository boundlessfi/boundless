import { useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

export function useDiscussions() {
  const {
    discussions,
    addDiscussion,
    addReply,
    updateDiscussion,
    deleteDiscussion,
    reportDiscussion,
    loading,
    error,
  } = useHackathonData();
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'totalReactions'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedDiscussions = useMemo(() => {
    return [...discussions].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'updatedAt') {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison = a.totalReactions - b.totalReactions;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [discussions, sortBy, sortOrder]);

  return {
    discussions: sortedDiscussions,
    sortBy,
    sortOrder,
    loading,
    error,
    setSortBy,
    setSortOrder,
    addDiscussion,
    addReply,
    updateDiscussion,
    deleteDiscussion,
    reportDiscussion,
  };
}
