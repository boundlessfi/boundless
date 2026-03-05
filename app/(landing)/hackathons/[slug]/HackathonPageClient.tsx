'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useRegisterHackathon } from '@/hooks/hackathon/use-register-hackathon';
import { useLeaveHackathon } from '@/hooks/hackathon/use-leave-hackathon';
import { RegisterHackathonModal } from '@/components/hackathons/overview/RegisterHackathonModal';
import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import SubmissionTab from '@/components/hackathons/submissions/submissionTab';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';
import { TeamFormationTab } from '@/components/hackathons/team-formation/TeamFormationTab';
import { WinnersTab } from '@/components/hackathons/winners/WinnersTab';
import LoadingScreen from '@/features/projects/components/CreateProjectModal/LoadingScreen';
import { useTimelineEvents } from '@/hooks/hackathon/use-timeline-events';
import { toast } from 'sonner';
import type { Participant } from '@/lib/api/hackathons';
import { HackathonStickyCard } from '@/components/hackathons/hackathonStickyCard';
import { HackathonParticipants } from '@/components/hackathons/participants/hackathonParticipant';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType } from '@/types/comment';
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import {
  listAnnouncements,
  type HackathonAnnouncement,
} from '@/lib/api/hackathons/index';
import { Megaphone } from 'lucide-react';
import { AnnouncementsTab } from '@/components/hackathons/announcements/AnnouncementsTab';
import { reportError, reportMessage } from '@/lib/error-reporting';

export default function HackathonPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const {
    currentHackathon,
    submissions,
    winners,
    loading,
    setCurrentHackathon,
    refreshCurrentHackathon,
  } = useHackathonData();

  const timeline_Events = useTimelineEvents(currentHackathon, {
    includeEndDate: false,
    dateFormat: { month: 'short', day: 'numeric', year: 'numeric' },
  });

  const hackathonId = params.slug as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch discussion comments for count
  const { comments: discussionComments } = useCommentSystem({
    entityType: CommentEntityType.HACKATHON,
    entityId: hackathonId,
    page: 1,
    limit: 100,
    enabled: !!hackathonId,
  });

  // Fetch team posts for count
  const { posts: teamPosts } = useTeamPosts({
    hackathonSlugOrId: hackathonId,
    autoFetch: !!hackathonId,
  });

  // Fetch announcements for public view
  const [announcements, setAnnouncements] = useState<HackathonAnnouncement[]>(
    []
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!hackathonId) return;
      try {
        setAnnouncementsLoading(true);
        const data = await listAnnouncements(hackathonId);
        // Only show published announcements for public view
        setAnnouncements(data.filter(a => !a.isDraft));
      } catch (error) {
        reportError(error, {
          context: 'hackathon-fetchAnnouncements',
          hackathonId,
        });
      } finally {
        setAnnouncementsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [hackathonId]);

  const hackathonTabs = useMemo(() => {
    const hasParticipants =
      Array.isArray(currentHackathon?.participants) &&
      currentHackathon.participants.length > 0;

    const hasResources = currentHackathon?.resources?.[0];
    const participantType = currentHackathon?.participantType;
    const isTeamHackathon =
      participantType === 'TEAM' || participantType === 'TEAM_OR_INDIVIDUAL';

    const hasWinners = winners && winners.length > 0;

    const tabs = [
      { id: 'overview', label: 'Overview' },
      ...(hasParticipants
        ? [
            {
              id: 'participants',
              label: 'Participants',
              badge: currentHackathon?.participants.length,
            },
          ]
        : []),
      ...(hasResources
        ? [
            {
              id: 'resources',
              label: 'Resources',
              badge: currentHackathon?.resources?.length,
            },
          ]
        : []),
      ...(announcements.length > 0
        ? [
            {
              id: 'announcements',
              label: 'Announcements',
              badge: announcements.length,
              icon: Megaphone,
            },
          ]
        : []),
      {
        id: 'submission',
        label: 'Submissions',
        badge: submissions.filter(p => p.status === 'Approved').length,
      },
      {
        id: 'discussions',
        label: 'Discussions',
        badge: discussionComments.comments.length,
      },
    ];

    if (isTeamHackathon) {
      tabs.push({
        id: 'team-formation',
        label: 'Find Team',
        badge: teamPosts.length,
      });
    }

    if (hasWinners) {
      tabs.push({
        id: 'winners',
        label: 'Winners',
        badge: winners.length,
      });
    }

    // Filter tabs against enabledTabs so only explicitly enabled tabs are shown.
    // 'overview' is always kept as it is the default fallback tab.
    // If enabledTabs is undefined/null (not configured), all tabs are shown as before.
    //
    // IMPORTANT: Any new tab id added to the tabs array above must have a corresponding
    // entry in tabIdToEnabledKey below; otherwise it falls back to tab.id and may be
    // hidden when enabledTabs is set.
    const tabIdToEnabledKey: Record<string, string> = {
      'team-formation': 'joinATeamTab',
      winners: 'winnersTab',
      resources: 'resourcesTab',
      participants: 'participantsTab',
      announcements: 'announcementsTab',
      submission: 'submissionTab',
      discussions: 'discussionTab',
    };

    /** Backend enabledTabs entry type; keys in tabIdToEnabledKey must align with this. */
    type EnabledTab = NonNullable<
      typeof currentHackathon
    >['enabledTabs'][number];
    const enabledTabs = currentHackathon?.enabledTabs;

    if (Array.isArray(enabledTabs)) {
      const enabledSet = new Set(enabledTabs);
      return tabs.filter(tab => {
        if (tab.id === 'overview') return true;
        const key = (tabIdToEnabledKey[tab.id] ?? tab.id) as EnabledTab;
        const isVisible = enabledSet.has(key);
        if (
          !isVisible &&
          process.env.NODE_ENV === 'development' &&
          currentHackathon?.enabledTabs
        ) {
          reportMessage(
            `Tab "${tab.id}" (enabled key: ${key}) is not in currentHackathon.enabledTabs and will be hidden`,
            'warning',
            { tabId: tab.id, key }
          );
        }
        return isVisible;
      });
    }
    return tabs;
  }, [
    currentHackathon?.participants,
    currentHackathon?.resources,
    currentHackathon?.participantType,
    currentHackathon?.enabledTabs,
    submissions,
    discussionComments.comments.length,
    teamPosts.length,
    winners,
    announcements,
  ]);

  // Refresh hackathon data
  const refreshHackathonData = useCallback(async () => {
    if (hackathonId && refreshCurrentHackathon) {
      await refreshCurrentHackathon();
    }
  }, [hackathonId, refreshCurrentHackathon]);

  // Registration status
  const {
    isRegistered,
    hasSubmitted,
    setParticipant,
    register: registerForHackathon,
  } = useRegisterHackathon({
    hackathon: currentHackathon
      ? {
          id: currentHackathon.id,
          slug: currentHackathon.slug,
          isParticipant: currentHackathon.isParticipant,
        }
      : null,
    organizationId: undefined,
  });

  // Leave hackathon functionality
  const { isLeaving, leave: leaveHackathon } = useLeaveHackathon({
    hackathonSlugOrId: currentHackathon?.id || '',
    organizationId: undefined,
  });

  const handleRegister = async () => {
    try {
      const participantData = await registerForHackathon();

      toast.success('Successfully registered for hackathon!');
      handleRegisterSuccess(participantData);
    } catch {
      // Error handled in hook
    }
  };

  // Team formation availability
  const isTeamHackathon =
    currentHackathon?.participantType === 'TEAM' ||
    currentHackathon?.participantType === 'TEAM_OR_INDIVIDUAL';
  const isTeamFormationEnabled =
    isTeamHackathon &&
    currentHackathon?.enabledTabs?.includes('joinATeamTab') !== false;

  // Event handlers
  const handleJoinClick = () => {
    handleRegister();
  };

  const handleLeaveClick = async () => {
    try {
      setParticipant(null);
      await leaveHackathon();
      refreshHackathonData();
      router.push('?tab=overview');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to leave hackathon';
      toast.error(errorMessage);
    }
  };

  const handleRegisterSuccess = async (participantData: Participant) => {
    setParticipant(participantData);
    await refreshHackathonData();
    router.push('?tab=submission');
  };

  const handleSubmitClick = () => {
    router.push('?tab=submission');
  };

  const handleViewSubmissionClick = () => {
    router.push('?tab=submission');
  };

  const handleFindTeamClick = () => {
    router.push('?tab=team-formation');
  };

  // Set current hackathon on mount
  useEffect(() => {
    if (hackathonId) {
      setCurrentHackathon(hackathonId);
    }
  }, [hackathonId, setCurrentHackathon]);

  // Handle tab changes from URL
  // Now also defaults to 'overview' if the URL tab is not in the filtered hackathonTabs list.
  // This handles direct URL access to a disabled tab — user is silently redirected to overview.
  useEffect(() => {
    if (loading || !currentHackathon) return;

    const tabFromUrl = searchParams.get('tab');

    // No tab in URL — default to overview
    if (!tabFromUrl) {
      setActiveTab('overview');
      return;
    }

    if (hackathonTabs.some(tab => tab.id === tabFromUrl)) {
      // Tab exists in filtered list — activate it normally
      setActiveTab(tabFromUrl);
      return;
    }

    // Tab is disabled or unrecognised — fall back to overview
    setActiveTab('overview');
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set('tab', 'overview');
    router.replace(`?${queryParams.toString()}`, { scroll: false });
  }, [searchParams, hackathonTabs, router, loading, currentHackathon]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set('tab', tabId);
    router.push(`?${queryParams.toString()}`, { scroll: false });
  };

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Hackathon not found
  if (!currentHackathon) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold text-white'>
            Hackathon not found
          </h1>
          <p className='text-gray-400'>
            The hackathon you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Helper: checks if a tab id is present in the filtered hackathonTabs array.
  // Used below to guard each tab's content from rendering if the tab is disabled.
  const isTabVisible = (tabId: string): boolean =>
    hackathonTabs.some(tab => tab.id === tabId);

  // Shared props for banner and sticky card
  const sharedActionProps = {
    deadline: currentHackathon.submissionDeadline,
    startDate: currentHackathon.startDate,
    totalPrizePool: currentHackathon.prizeTiers
      .reduce((acc, prize) => acc + Number(prize.prizeAmount || 0), 0)
      .toString(),
    isRegistered,
    hasSubmitted,
    isTeamFormationEnabled,
    registrationDeadline: currentHackathon.registrationDeadline,
    participantType: currentHackathon.participantType,
    onJoinClick: handleJoinClick,
    onLeaveClick: handleLeaveClick,
    isLeaving,
    onSubmitClick: handleSubmitClick,
    onViewSubmissionClick: handleViewSubmissionClick,
    onFindTeamClick: handleFindTeamClick,
  };

  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 md:px-[50px] lg:px-[100px]'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <HackathonBanner
            title={currentHackathon.name}
            tagline={currentHackathon.tagline}
            imageUrl={currentHackathon.banner}
            categories={currentHackathon.categories}
            participants={currentHackathon._count.participants}
            {...sharedActionProps}
          />

          <HackathonNavTabs
            tabs={hackathonTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className='py-12 text-left text-white'>
            {activeTab === 'overview' && (
              <HackathonOverview
                content={currentHackathon.description}
                timelineEvents={timeline_Events}
                prizes={currentHackathon.prizeTiers.map(tier => ({
                  id: tier.id,
                  place: tier.name,
                  currency: tier.currency,
                  passMark: tier.passMark,
                  description: tier.description,
                  prizeAmount: tier.prizeAmount,
                }))}
                totalPrizePool={currentHackathon.prizeTiers
                  .reduce(
                    (acc, prize) => acc + Number(prize.prizeAmount || 0),
                    0
                  )
                  .toString()}
                hackathonSlugOrId={hackathonId}
                venue={{
                  type: currentHackathon.venueType.toLowerCase() as
                    | 'virtual'
                    | 'physical',
                  country: currentHackathon.country,
                  state: currentHackathon.state,
                  city: currentHackathon.city,
                  venueName: currentHackathon.venueName,
                  venueAddress: currentHackathon.venueAddress,
                }}
              />
            )}

            {/* isTabVisible('resources') guard — HackathonResources will not
                render at all if 'resources' is not in enabledTabs, even via direct URL */}
            {activeTab === 'resources' &&
              isTabVisible('resources') &&
              currentHackathon.resources?.length > 0 && <HackathonResources />}

            {/*  isTabVisible('participants') guard */}
            {activeTab === 'participants' &&
              isTabVisible('participants') &&
              currentHackathon.participants?.length > 0 && (
                <HackathonParticipants />
              )}

            {/*  isTabVisible('announcements') guard */}
            {activeTab === 'announcements' &&
              isTabVisible('announcements') &&
              announcements.length > 0 && (
                <AnnouncementsTab
                  announcements={announcements}
                  hackathonSlug={hackathonId}
                />
              )}

            {/* isTabVisible('submission') guard */}
            {activeTab === 'submission' && isTabVisible('submission') && (
              <SubmissionTab
                organizationId={currentHackathon.organizationId}
                isRegistered={isRegistered}
              />
            )}

            {/*  isTabVisible('discussions') guard */}
            {activeTab === 'discussions' && isTabVisible('discussions') && (
              <HackathonDiscussions
                hackathonId={hackathonId}
                isRegistered={isRegistered}
              />
            )}

            {/*  isTabVisible('team-formation') guard */}
            {activeTab === 'team-formation' &&
              isTabVisible('team-formation') && (
                <TeamFormationTab
                  hackathonSlugOrId={hackathonId}
                  isRegistered={isRegistered}
                />
              )}

            {/* isTabVisible('winners') guard */}
            {activeTab === 'winners' && isTabVisible('winners') && (
              <WinnersTab winners={winners} hackathonSlug={hackathonId} />
            )}

            {/* Note: duplicate resources render removed — was already covered above */}
          </div>
        </div>

        <div className='lg:col-span-1'>
          <HackathonStickyCard
            title={currentHackathon.name}
            imageUrl={currentHackathon.banner}
            {...sharedActionProps}
          />
        </div>
      </div>

      {hackathonId && (
        <RegisterHackathonModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          hackathon={currentHackathon}
          organizationId={undefined}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
