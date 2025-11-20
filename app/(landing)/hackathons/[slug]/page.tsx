'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
import { HackathonParticipants } from '@/components/hackathons/participants/hackathonParticipant';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import SubmissionTab from '@/components/hackathons/submissions/submissionTab';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';
import { TeamFormationTab } from '@/components/hackathons/team-formation/TeamFormationTab';
import LoadingScreen from '@/components/landing-page/project/CreateProjectModal/LoadingScreen';

export default function HackathonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const {
    currentHackathon,
    timelineEvents,
    participants,
    submissions,
    prizes,
    loading,
    setCurrentHackathon,
  } = useHackathonData();

  const hackathonTabs = useMemo(() => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'participants', label: 'Participants', badge: participants.length },
      { id: 'resources', label: 'Resources' },
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
        startDate={currentHackathon.startDate} // if upcoming
      />

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
            timelineEvents={timelineEvents}
            prizes={prizes}
            hackathonSlugOrId={hackathonId}
          />
        )}

        {activeTab === 'participants' && <HackathonParticipants />}

        {activeTab === 'resources' && (
          <HackathonResources hackathonSlugOrId={hackathonId} />
        )}

        {activeTab === 'submission' && (
          <SubmissionTab hackathonSlugOrId={hackathonId} />
        )}

        {activeTab === 'discussions' && (
          <HackathonDiscussions hackathonId={hackathonId} />
        )}

        {activeTab === 'team-formation' && (
          <TeamFormationTab hackathonSlugOrId={hackathonId} />
        )}
      </div>
    </div>
  );
}
