import { useState, useMemo, useEffect } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { getTeamPosts, type TeamRecruitmentPost } from '@/lib/api/hackathons';
import { reportError } from '@/lib/error-reporting';
import { useParams } from 'next/navigation';

export function useParticipants() {
  const { currentHackathon } = useHackathonData();
  const params = useParams();
  const [teams, setTeams] = useState<TeamRecruitmentPost[]>([]);

  const hackathonId = currentHackathon?.id || (params?.slug as string);

  // Fetch teams to get accurate team info and roles
  useEffect(() => {
    if (hackathonId) {
      getTeamPosts(hackathonId, { limit: 50 })
        .then(response => {
          if (response.success && response.data) {
            // Check if response.data is the array or if it's nested in .teams
            const teamsArray =
              (response.data as any).teams ||
              (Array.isArray(response.data) ? response.data : []);
            setTeams(teamsArray);
          }
        })
        .catch(err => {
          reportError(err, { context: 'participants-fetchTeams', hackathonId });
        });
    }
  }, [hackathonId]);

  // Create a map of userId to team info for enrichment
  const userTeamMap = useMemo(() => {
    const map = new Map<
      string,
      { teamId: string; teamName: string; role: string }
    >();

    teams.forEach(team => {
      // Add leader
      if (team.leaderId) {
        map.set(team.leaderId, {
          teamId: team.id,
          teamName: team.teamName,
          role: 'leader',
        });
      }

      // Add members
      if (Array.isArray(team.members)) {
        team.members.forEach((member: any) => {
          const mUserId = typeof member === 'string' ? member : member.userId;
          if (mUserId && !map.has(mUserId)) {
            map.set(mUserId, {
              teamId: team.id,
              teamName: team.teamName,
              role: 'Member',
            });
          }
        });
      }
    });

    return map;
  }, [teams]);

  // Transform API participants to match expected Participant type
  const participants: Array<{
    id: string;
    userId: string;
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
  }> = (currentHackathon?.participants || []).map(apiParticipant => {
    const apiUser = (apiParticipant.user || {}) as any;
    const profile = (apiUser.profile || {}) as any;
    const userId = apiParticipant.userId || apiUser.id;

    // Enrich with team data from fetched teams
    const teamInfo = userId ? userTeamMap.get(userId) : null;

    // Robust name detection
    const name =
      apiUser.name ||
      profile.name ||
      `${profile.firstName || apiUser.firstName || ''} ${profile.lastName || apiUser.lastName || ''}`.trim() ||
      apiUser.displayUsername ||
      'Anonymous';

    // Robust username detection
    const username =
      apiUser.username ||
      profile.username ||
      apiUser.displayUsername ||
      apiUser.handle ||
      'user';

    const avatar = profile.image || profile.avatar || apiUser.image || '';

    return {
      id: apiParticipant.id,
      userId: userId,
      name,
      username,
      avatar,
      hasSubmitted: !!apiParticipant.submission,
      joinedDate: apiParticipant.registeredAt,
      // Use role from Team if found, then from API, otherwise default
      role: teamInfo?.role || (apiParticipant as any).role || 'Participant',
      categories: [],
      projects: 0,
      followers: 0,
      teamId: teamInfo?.teamId || apiParticipant.teamId,
      teamName: teamInfo?.teamName || apiParticipant.teamName,
      isIndividual:
        apiParticipant.participationType === 'individual' && !teamInfo,
    };
  });
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
    allParticipants: participants,
    teams,
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
