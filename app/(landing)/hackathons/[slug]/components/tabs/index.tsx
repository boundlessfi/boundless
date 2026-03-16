'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';
import Lists from './Lists';
import Overview from './contents/Overview';
import Participants from './contents/Participants';
import Submissions from './contents/Submissions';
import Discussions from './contents/Discussions';
import Announcements from './contents/AnnouncementsTab';
import Winners from './contents/Winners';
import ResourcesTab from './contents/ResourcesTab';
import FindTeam from './contents/FindTeam';
import { useEffect, useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useHackathonAnnouncements } from '@/hooks/hackathon/use-hackathon-queries';
import { useCommentSystem } from '@/hooks/use-comment-system';
import { CommentEntityType } from '@/types/comment';
import { Megaphone } from 'lucide-react';

interface HackathonTabsProps {
  sidebar?: React.ReactNode;
}

const HackathonTabs = ({ sidebar }: HackathonTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params?.slug as string;

  const {
    currentHackathon,
    winners,
    submissions,
    loading: generalLoading,
  } = useHackathonData();
  const { data: announcements = [], isLoading: announcementsLoading } =
    useHackathonAnnouncements(slug, !!slug);

  const { comments: discussionComments } = useCommentSystem({
    entityType: CommentEntityType.HACKATHON,
    entityId: currentHackathon?.id || '',
    page: 1,
    limit: 1,
    enabled: !!currentHackathon?.id,
  });

  const [activeTab, setActiveTab] = useState('overview');

  const hackathonTabs = useMemo(() => {
    if (!currentHackathon) return [];
    const hasParticipants = currentHackathon._count?.participants > 0;
    const hasResources = currentHackathon.resources?.length > 0;
    const hasWinners = (winners && winners.length > 0) || generalLoading;
    const hasAnnouncements = announcements.length > 0 || announcementsLoading;

    const participantType = currentHackathon.participantType;
    const isTeamHackathon =
      participantType === 'TEAM' || participantType === 'TEAM_OR_INDIVIDUAL';

    const tabs = [
      { id: 'overview', label: 'Overview' },
      ...(hasParticipants
        ? [
            {
              id: 'participants',
              label: 'Participants',
              badge: currentHackathon._count.participants,
            },
          ]
        : []),
      ...(hasResources
        ? [
            {
              id: 'resources',
              label: 'Resources',
              badge: currentHackathon.resources.length,
            },
          ]
        : []),
      ...(hasAnnouncements
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
        id: 'submissions',
        label: 'Submissions',
        badge: submissions.filter(p => p.status === 'Approved').length,
      },
      {
        id: 'discussions',
        label: 'Discussions',
        badge: discussionComments.pagination.totalItems || 0,
      },
    ];

    if (isTeamHackathon) {
      tabs.push({
        id: 'team-formation',
        label: 'Find Team',
      });
    }

    if (hasWinners) {
      tabs.push({
        id: 'winners',
        label: 'Winners',
        badge: winners.length,
      });
    }

    const tabIdToEnabledKey: Record<string, string> = {
      'team-formation': 'joinATeamTab',
      winners: 'winnersTab',
      resources: 'resourcesTab',
      participants: 'participantsTab',
      announcements: 'announcementsTab',
      submissions: 'submissionTab',
      discussions: 'discussionTab',
    };

    const enabledTabs = currentHackathon.enabledTabs;

    if (Array.isArray(enabledTabs)) {
      const enabledSet = new Set<string>(enabledTabs);
      return tabs.filter(tab => {
        if (tab.id === 'overview') return true;
        const key = tabIdToEnabledKey[tab.id] || tab.id;
        return enabledSet.has(key);
      });
    }

    return tabs;
  }, [
    currentHackathon,
    winners,
    submissions,
    discussionComments.pagination.totalItems,
    announcements,
    announcementsLoading,
    generalLoading,
  ]);

  useEffect(() => {
    if (!currentHackathon) return;

    const tabFromUrl = searchParams.get('tab');
    if (!tabFromUrl) {
      setActiveTab('overview');
      return;
    }

    if (hackathonTabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      // If the tab is not in the list yet, check if it's because we're still loading data
      const isKnownTabLoading =
        (tabFromUrl === 'announcements' && announcementsLoading) ||
        (tabFromUrl === 'winners' && generalLoading);

      if (!isKnownTabLoading) {
        setActiveTab('overview');
        const queryParams = new URLSearchParams(searchParams.toString());
        queryParams.set('tab', 'overview');
        router.replace(`?${queryParams.toString()}`, { scroll: false });
      }
    }
  }, [
    searchParams,
    hackathonTabs,
    router,
    currentHackathon,
    announcementsLoading,
    generalLoading,
  ]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set('tab', value);
    router.push(`?${queryParams.toString()}`, { scroll: false });
  };

  const isTabVisible = (tabId: string) =>
    hackathonTabs.some(t => t.id === tabId);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className='mb-10 w-full'
      id='hackathon-tabs'
    >
      <Lists tabs={hackathonTabs} />
      <div className='mx-auto w-full max-w-[1440px] px-6'>
        <div className='flex flex-col gap-8 lg:flex-row'>
          <div className='min-w-0 flex-1'>
            {isTabVisible('overview') && <Overview />}
            {isTabVisible('participants') && <Participants />}
            {isTabVisible('submissions') && <Submissions />}
            {isTabVisible('announcements') && <Announcements />}
            {isTabVisible('discussions') && <Discussions />}
            {isTabVisible('winners') && <Winners />}
            {isTabVisible('resources') && <ResourcesTab />}
            {isTabVisible('team-formation') && <FindTeam />}
          </div>
          <div className='sticky top-20 hidden max-w-[411px] shrink-0 lg:block'>
            {sidebar}
          </div>
        </div>
      </div>
    </Tabs>
  );
};

export default HackathonTabs;
