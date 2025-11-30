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
import { HackathonParticipants } from '@/components/hackathons/participants/hackathonParticipant';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import SubmissionTab from '@/components/hackathons/submissions/submissionTab';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';
import { TeamFormationTab } from '@/components/hackathons/team-formation/TeamFormationTab';
import LoadingScreen from '@/components/landing-page/project/CreateProjectModal/LoadingScreen';
import { useTimelineEvents } from '@/hooks/hackathon/use-timeline-events';
import { toast } from 'sonner';
import { Participant } from '@/lib/api/hackathons';
// import { HackathonResources } from '@/components/hackathons/resources/resources';

export default function HackathonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const {
    currentHackathon,
    participants,
    submissions,
    loading,
    setCurrentHackathon,
    refreshCurrentHackathon,
  } = useHackathonData();

  const timeline_Events = useTimelineEvents(currentHackathon, {
    includeEndDate: false,
    dateFormat: { month: 'short', day: 'numeric', year: 'numeric' },
  });

  const hackathonTabs = useMemo(() => {
    const hasParticipants = participants.length > 0;
    const hasResources = currentHackathon?.resources?.resources?.[0];

    const tabs = [
      { id: 'overview', label: 'Overview' },
      ...(hasParticipants
        ? [
            {
              id: 'participants',
              label: 'Participants',
              badge: participants.length,
            },
          ]
        : []),
      ...(hasResources
        ? [
            {
              id: 'resources',
              label: 'Resources',
              badge: currentHackathon?.resources?.resources?.length,
            },
          ]
        : []),

      {
        id: 'submission',
        label: 'Submissions',
        badge: submissions.filter(p => p.status === 'Approved').length,
      },
      { id: 'discussions', label: 'Discussions' },
    ];

    const participantType = currentHackathon?.participation?.participantType;
    const isTeamHackathon =
      participantType === 'team' || participantType === 'team_or_individual';

    const isTabEnabled =
      currentHackathon?.participation?.tabVisibility?.joinATeamTab !== false;

    if (isTeamHackathon && isTabEnabled) {
      tabs.push({ id: 'team-formation', label: 'Find Team' });
    }

    return tabs;
  }, [
    participants.length,
    submissions,
    currentHackathon?.participation?.participantType,
    currentHackathon?.participation?.tabVisibility?.joinATeamTab,
  ]);

  const hackathonId = params.slug as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Function to refresh all hackathon data
  const refreshHackathonData = useCallback(async () => {
    if (hackathonId && refreshCurrentHackathon) {
      await refreshCurrentHackathon();
    }
  }, [hackathonId, refreshCurrentHackathon]);

  // Registration logic - use the updated hook with setters
  const {
    isRegistered,
    hasSubmitted,
    checkStatus,
    // isChecking,
    setIsRegistered,
    setParticipant,
  } = useRegisterHackathon({
    hackathonSlugOrId: hackathonId,
    organizationId: undefined,
    autoCheck: !!hackathonId,
  });

  // Leave hackathon logic
  const { isLeaving, leave: leaveHackathon } = useLeaveHackathon({
    hackathonSlugOrId: hackathonId,
    organizationId: undefined,
  });

  const isEnded = useMemo(() => {
    if (!currentHackathon?.deadline) return false;
    const deadline = new Date(currentHackathon.deadline);
    const now = new Date();
    return now > deadline;
  }, [currentHackathon?.deadline]);

  // Check if team formation is available
  const isTeamHackathon =
    currentHackathon?.participation?.participantType === 'team' ||
    currentHackathon?.participation?.participantType === 'team_or_individual';

  const isTeamFormationEnabled =
    isTeamHackathon &&
    currentHackathon?.participation?.tabVisibility?.joinATeamTab !== false;

  // Button handlers
  const handleJoinClick = () => {
    setShowRegisterModal(true);
  };

  const handleLeaveClick = async () => {
    try {
      setIsRegistered(false);
      setParticipant(null);

      await leaveHackathon();

      refreshHackathonData();

      router.push('?tab=overview');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to leave hackathon';
      toast.error(errorMessage);
      setIsRegistered(true);
      checkStatus();
    }
  };

  const handleRegisterSuccess = async (participantData: Participant) => {
    // IMMEDIATELY update state with the returned participant data
    setIsRegistered(true);
    setParticipant(participantData);

    // Refresh hackathon data in background (participants count)
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

  useEffect(() => {
    if (hackathonId) {
      setCurrentHackathon(hackathonId);
    }
  }, [hackathonId, setCurrentHackathon]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && hackathonTabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, hackathonTabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return <LoadingScreen />;
  }

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

  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 text-center text-4xl font-bold text-white md:px-[50px] lg:px-[100px]'>
      {/* Banner */}
      <HackathonBanner
        title={currentHackathon.title}
        tagline={currentHackathon.tagline}
        deadline={currentHackathon.deadline}
        categories={currentHackathon.categories}
        status={currentHackathon.status}
        participants={currentHackathon.participants}
        totalPrizePool={currentHackathon.totalPrizePool}
        imageUrl={currentHackathon.imageUrl}
        startDate={currentHackathon.startDate}
        endDate={currentHackathon.endDate}
        isRegistered={isRegistered}
        hasSubmitted={hasSubmitted}
        isEnded={isEnded}
        registrationDeadlinePolicy={currentHackathon.registrationDeadlinePolicy}
        registrationDeadline={currentHackathon.registrationDeadline}
        isTeamFormationEnabled={isTeamFormationEnabled}
        onJoinClick={handleJoinClick}
        onLeaveClick={handleLeaveClick}
        isLeaving={isLeaving}
        onSubmitClick={handleSubmitClick}
        onViewSubmissionClick={handleViewSubmissionClick}
        onFindTeamClick={handleFindTeamClick}
      />

      {/* Registration Modal */}
      {hackathonId && (
        <RegisterHackathonModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          hackathonSlugOrId={hackathonId}
          organizationId={undefined}
          onSuccess={handleRegisterSuccess} // Now passes participant data
          participantType={
            (currentHackathon?.participantType as
              | 'team'
              | 'individual'
              | 'team_or_individual') ?? 'individual'
          }
        />
      )}

      {/* Tabs */}
      <HackathonNavTabs
        tabs={hackathonTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className='mx-auto max-w-7xl px-6 py-12 text-white'>
        {activeTab === 'overview' && (
          <HackathonOverview
            content={currentHackathon.description}
            timelineEvents={timeline_Events}
            prizes={currentHackathon.prizeTiers}
            totalPrizePool={currentHackathon.totalPrizePool}
            hackathonSlugOrId={hackathonId}
            venue={currentHackathon.venue}
          />
        )}

        {activeTab === 'participants' && participants.length > 0 && (
          <HackathonParticipants />
        )}

        {activeTab === 'submission' && (
          <SubmissionTab
            hackathonSlugOrId={hackathonId}
            isRegistered={isRegistered}
          />
        )}

        {activeTab === 'discussions' && (
          <HackathonDiscussions
            hackathonId={hackathonId}
            isRegistered={isRegistered}
          />
        )}

        {activeTab === 'team-formation' && (
          <TeamFormationTab hackathonSlugOrId={hackathonId} />
        )}
        {activeTab === 'resources' &&
          currentHackathon?.resources?.resources?.[0] && (
            <HackathonResources hackathonSlugOrId={hackathonId} />
          )}
      </div>
    </div>
  );
}
