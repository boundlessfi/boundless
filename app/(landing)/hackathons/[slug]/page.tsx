'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
import { HackathonParticipants } from '@/components/hackathons/participants/hackathonParticipant';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import SubmissionTab from '@/components/hackathons/submissions/submissionTab';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';

const hackathonTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants', badge: 48 },
  { id: 'resources', label: 'Resources' },
  { id: 'submission', label: 'Submissions' },
  { id: 'discussions', label: 'Discussions' },
];

export default function HackathonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const {
    currentHackathon,
    content,
    timelineEvents,
    prizes,
    setCurrentHackathon,
  } = useHackathonData();

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
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
      {/* Banner Section */}
      <HackathonBanner
        title={currentHackathon.title}
        subtitle={currentHackathon.subtitle}
        deadline={currentHackathon.deadline}
        categories={currentHackathon.categories}
        status={currentHackathon.status}
        participants={currentHackathon.participants}
        totalPrizePool={currentHackathon.totalPrizePool}
        imageUrl={currentHackathon.imageUrl}
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
            content={content}
            timelineEvents={timelineEvents}
            prizes={prizes}
          />
        )}

        {activeTab === 'participants' && <HackathonParticipants />}

        {activeTab === 'resources' && <HackathonResources />}

        {activeTab === 'submission' && <SubmissionTab />}

        {activeTab === 'discussions' && (
          <HackathonDiscussions hackathonId={hackathonId} />
        )}
      </div>
    </div>
  );
}
