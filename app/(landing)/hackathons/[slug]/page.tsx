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
import type { Participant } from '@/lib/api/hackathons';
import { HackathonStickyCard } from '@/components/hackathons/hackathonStickyCard';

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
    checkStatus,
    setIsRegistered,
    setParticipant,
  } = useRegisterHackathon({
    hackathonSlugOrId: hackathonId,
    organizationId: undefined,
    autoCheck: !!hackathonId,
  });

  // Leave hackathon functionality
  const { isLeaving, leave: leaveHackathon } = useLeaveHackathon({
    hackathonSlugOrId: hackathonId,
    organizationId: undefined,
  });

  // Check if hackathon has ended
  // const isEnded = useMemo(() => {
  //   if (!currentHackathon?.deadline) return false
  //   const deadline = new Date(currentHackathon.deadline)
  //   const now = new Date()
  //   return now > deadline
  // }, [currentHackathon?.deadline])

  // Team formation availability
  const isTeamHackathon =
    currentHackathon?.participation?.participantType === 'team' ||
    currentHackathon?.participation?.participantType === 'team_or_individual';
  const isTeamFormationEnabled =
    isTeamHackathon &&
    currentHackathon?.participation?.tabVisibility?.joinATeamTab !== false;

  // Event handlers
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
    setIsRegistered(true);
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

  // Shared props for banner and sticky card
  const sharedActionProps = {
    deadline: currentHackathon.deadline,
    startDate: currentHackathon.startDate,
    totalPrizePool: currentHackathon.totalPrizePool,
    isRegistered,
    hasSubmitted,
    isTeamFormationEnabled,
    registrationDeadlinePolicy: currentHackathon.registrationDeadlinePolicy as
      | 'before_start'
      | 'before_submission_deadline'
      | 'custom',
    registrationDeadline: currentHackathon.registrationDeadline,
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
        {/* Main Content (2/3 width on desktop) */}
        <div className='lg:col-span-2'>
          {/* Banner - Shows on all screens */}
          <HackathonBanner
            title={currentHackathon.title}
            tagline={currentHackathon.tagline}
            imageUrl={currentHackathon.imageUrl}
            categories={currentHackathon.categories}
            participants={currentHackathon.participants}
            {...sharedActionProps}
          />

          {/* Navigation Tabs */}
          <HackathonNavTabs
            tabs={hackathonTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Tab Content */}
          <div className='py-12 text-left text-white'>
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

        {/* Sidebar - Sticky Card (1/3 width on desktop, hidden on mobile) */}
        <div className='lg:col-span-1'>
          <HackathonStickyCard
            title={currentHackathon.title}
            imageUrl={currentHackathon.imageUrl}
            {...sharedActionProps}
          />
        </div>
      </div>

      {/* Registration Modal */}
      {hackathonId && (
        <RegisterHackathonModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          hackathonSlugOrId={hackathonId}
          organizationId={undefined}
          onSuccess={handleRegisterSuccess}
          participantType={
            (currentHackathon?.participantType as
              | 'team'
              | 'individual'
              | 'team_or_individual') ?? 'individual'
          }
        />
      )}
    </div>
  );
}
