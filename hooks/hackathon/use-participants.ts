import { useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

export function useParticipants() {
  const { currentHackathon } = useHackathonData();

  // Transform API participants to match expected Participant type
  const participants: Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    hasSubmitted: boolean;
    joinedDate: string;
    role: string;
    categories: string[];
    projects: number;
    followers: number;
    teamId?: string;
    teamName?: string;
    isIndividual: boolean;
  }> = (currentHackathon?.participants || []).map(apiParticipant => ({
    id: apiParticipant.id,
    name: apiParticipant.user.profile.name,
    username: apiParticipant.user.profile.username,
    avatar: apiParticipant.user.profile.image || '',
    hasSubmitted: !!apiParticipant.submission,
    joinedDate: apiParticipant.registeredAt,
    // Default values for fields not available in API
    role: 'Participant',
    categories: [],
    projects: 0,
    followers: 0,
    teamId: apiParticipant.teamId,
    teamName: apiParticipant.teamName,
    isIndividual: apiParticipant.participationType === 'individual',
  }));
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
          (p.role && p.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.categories &&
            p.categories.some(cat =>
              cat.toLowerCase().includes(searchTerm.toLowerCase())
            ))
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
          (p.role && p.role.toLowerCase().includes(skillFilter)) ||
          (p.categories &&
            p.categories.some(cat => cat.toLowerCase().includes(skillFilter)))
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
