import { useState, useMemo, useEffect } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { getTeamPosts, type TeamRecruitmentPost } from '@/lib/api/hackathons';
import { getHackathonParticipants } from '@/lib/api/hackathon';
import { reportError } from '@/lib/error-reporting';
import { useParams } from 'next/navigation';

export function useParticipants() {
  const { currentHackathon } = useHackathonData();
  const params = useParams();
  const [teams, setTeams] = useState<TeamRecruitmentPost[]>([]);
  const [apiParticipants, setApiParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hackathonId = currentHackathon?.id;

  // Fetch teams to get accurate team info and roles
  useEffect(() => {
    if (hackathonId) {
      setIsLoading(true);
      const fetchAllData = async () => {
        try {
          // Fetch teams
          const teamsResponse = await getTeamPosts(hackathonId, { limit: 50 });
          if (teamsResponse.success && teamsResponse.data) {
            const teamsArray =
              (teamsResponse.data as any).teams ||
              (Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
            setTeams(teamsArray);
          }

          // Fetch participants with pagination
          let allParticipants: any[] = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const participantsResponse = await getHackathonParticipants(
              hackathonId,
              { limit: 100, page }
            );
            if (participantsResponse.success && participantsResponse.data) {
              const newParticipants =
                participantsResponse.data.participants || [];
              allParticipants = [...allParticipants, ...newParticipants];
              hasMore = participantsResponse.data.pagination?.hasNext || false;
              page++;
            } else {
              hasMore = false;
            }
          }
          setApiParticipants(allParticipants);
        } catch (err) {
          reportError(err, { context: 'participants-fetchData', hackathonId });
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllData();
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
  const participants = useMemo(() => {
    // We want to merge data from both sources.
    // currentHackathon?.participants has the Google avatars (user.image).
    // apiParticipants has the stats (followers, projects).
    const baseParticipants = currentHackathon?.participants || [];
    const sourceParticipants =
      apiParticipants.length > 0 ? apiParticipants : baseParticipants;

    // Create a lookup map from base participants for fast merging
    const baseLookup = new Map();
    baseParticipants.forEach(p => {
      const uId = p.userId || (p.user || {}).id || p.id;
      if (uId) baseLookup.set(uId, p);
    });

    return sourceParticipants.map(apiParticipant => {
      // Find matching base participant to merge data
      const pId =
        apiParticipant.userId ||
        (apiParticipant.user || {}).id ||
        apiParticipant.id;
      const basePat = pId ? baseLookup.get(pId) : null;

      // Merge user objects to ensure we don't lose avatar data (like Google profile images)
      const apiUser = {
        ...(basePat?.user || {}),
        ...(apiParticipant.user || {}),
        ...((apiParticipant.user || apiParticipant || {}) as any),
      };
      const profile = {
        ...(basePat?.user?.profile || {}),
        ...(apiUser.profile || {}),
      } as any;

      // Robust userId detection
      const userId =
        apiParticipant.userId ||
        apiUser.id ||
        apiUser.userId ||
        (typeof apiParticipant.id === 'string' ? apiParticipant.id : undefined);

      // Enrich with team data from fetched teams
      const teamInfo = userId ? userTeamMap.get(userId) : null;

      // Robust name detection
      const name =
        apiParticipant.name ||
        basePat?.name ||
        apiUser.name ||
        profile.name ||
        `${profile.firstName || apiUser.firstName || apiParticipant.firstName || ''} ${profile.lastName || apiUser.lastName || apiParticipant.lastName || ''}`.trim() ||
        apiUser.displayUsername ||
        apiParticipant.displayUsername ||
        apiUser.displayName ||
        apiParticipant.displayName ||
        'Anonymous';

      // Robust username detection
      const username =
        apiParticipant.username ||
        basePat?.username ||
        apiUser.username ||
        profile.username ||
        apiUser.displayUsername ||
        apiParticipant.displayUsername ||
        apiUser.handle ||
        apiParticipant.handle ||
        'user';

      const avatar =
        profile.image ||
        profile.avatar ||
        profile.avatarUrl ||
        profile.imageUrl ||
        profile.picture ||
        profile.photoURL ||
        apiUser.image ||
        apiUser.avatar ||
        apiUser.avatarUrl ||
        apiUser.imageUrl ||
        apiUser.picture ||
        apiUser.photo ||
        apiUser.photoURL ||
        apiParticipant.avatar ||
        apiParticipant.image ||
        apiParticipant.avatarUrl ||
        apiParticipant.imageUrl ||
        apiParticipant.picture ||
        apiParticipant.photo ||
        '/placeholder.svg';

      // Get joined date - prefer registeredAt
      const joinedDate =
        apiParticipant.registeredAt ||
        basePat?.registeredAt ||
        apiParticipant.createdAt ||
        new Date().toISOString();

      // Get stats if available in enriched profile or participant object
      const userStats = (apiParticipant as any).userStats || {};
      const projectsCount =
        apiParticipant.projects ??
        userStats.projects ??
        profile.projectsCount ??
        0;
      const followersCount =
        apiParticipant.followers ??
        userStats.followers ??
        profile.followersCount ??
        0;

      return {
        id: apiParticipant.id || basePat?.id,
        userId: userId,
        name: name === ' ' ? 'Anonymous' : name, // Fix empty space from trim
        username,
        avatar,
        hasSubmitted: !!(apiParticipant.submission || basePat?.submission),
        joinedDate,
        // Use role from Team if found, then from API, otherwise default
        role:
          teamInfo?.role ||
          (apiParticipant as any).role ||
          (basePat as any)?.role ||
          'Participant',
        categories: apiParticipant.categories || basePat?.categories || [],
        projects: projectsCount,
        followers: followersCount,
        teamId: teamInfo?.teamId || apiParticipant.teamId || basePat?.teamId,
        teamName:
          teamInfo?.teamName || apiParticipant.teamName || basePat?.teamName,
        isIndividual:
          (apiParticipant.participationType || basePat?.participationType) ===
            'individual' && !teamInfo,
      };
    });
  }, [apiParticipants, currentHackathon?.participants, userTeamMap]);
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
            p.categories.some((cat: string) =>
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
            p.categories.some((cat: string) =>
              cat.toLowerCase().includes(skillFilter)
            ))
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
