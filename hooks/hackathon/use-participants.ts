import { useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

export function useParticipants() {
  const { participants } = useHackathonData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = [...participants];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categories?.some(cat =>
            cat.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Submission filter
    if (submissionFilter === 'submitted') {
      filtered = filtered.filter(p => p.hasSubmitted);
    }
    if (submissionFilter === 'not_submitted') {
      filtered = filtered.filter(p => !p.hasSubmitted);
    }

    // Skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(
        p =>
          p.role?.toLowerCase().includes(skillFilter) ||
          p.categories?.some(cat => cat.toLowerCase().includes(skillFilter))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.joinedDate || '').getTime() -
            new Date(a.joinedDate || '').getTime()
          );
        case 'oldest':
          return (
            new Date(a.joinedDate || '').getTime() -
            new Date(b.joinedDate || '').getTime()
          );
        case 'followers_high':
          return (b.followers || 0) - (a.followers || 0);
        case 'followers_low':
          return (a.followers || 0) - (b.followers || 0);
        case 'projects_high':
          return (b.projects || 0) - (a.projects || 0);
        case 'projects_low':
          return (a.projects || 0) - (b.projects || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [participants, searchTerm, sortBy, submissionFilter, skillFilter]);

  const submittedCount = participants.filter(p => p.hasSubmitted).length;

  return {
    participants: filteredAndSortedParticipants,
    totalParticipants: participants.length,
    submittedCount,
    searchTerm,
    sortBy,
    submissionFilter,
    skillFilter,
    setSearchTerm,
    setSortBy,
    setSubmissionFilter,
    setSkillFilter,
  };
}
