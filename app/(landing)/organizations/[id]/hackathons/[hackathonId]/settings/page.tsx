'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Settings,
  Info,
  Clock,
  Users,
  Trophy,
  Handshake,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api/api';
import GeneralSettingsTab from '@/components/organization/hackathons/settings/GeneralSettingsTab';
import TimelineSettingsTab from '@/components/organization/hackathons/settings/TimelineSettingsTab';
import ParticipantSettingsTab from '@/components/organization/hackathons/settings/ParticipantSettingsTab';
import RewardsSettingsTab from '@/components/organization/hackathons/settings/RewardsSettingsTab';
import CollaborationSettingsTab from '@/components/organization/hackathons/settings/CollaborationSettingsTab';
import AdvancedSettingsTab from '@/components/organization/hackathons/settings/AdvancedSettingsTab';

export default function SettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [isSaving, setIsSaving] = useState(false);

  const tabTriggerClassName =
    'data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-gray-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none flex items-center gap-2';

  const mockHackathonData = {
    info: {
      name: 'Web3 Innovation Hackathon',
      banner: 'https://example.com/banner.jpg',
      description: '<p>Join us for an exciting hackathon...</p>',
      category: ['DeFi' as const],
      venueType: 'virtual' as const,
      country: '',
      state: '',
      city: '',
      venueName: '',
      venueAddress: '',
    },
    timeline: {
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      registrationDeadline: new Date('2025-01-10'),
      submissionDeadline: new Date('2025-01-18'),
      timezone: 'UTC',
      phases: [],
    },
    participant: {
      participantType: 'team_or_individual' as const,
      teamMin: 2,
      teamMax: 5,
      about: '',
      require_github: true,
      require_demo_video: true,
      require_other_links: false,
      details_tab: true,
      schedule_tab: true,
      rules_tab: true,
      reward_tab: true,
      announcements_tab: true,
      partners_tab: true,
      join_a_team_tab: true,
      projects_tab: true,
      participants_tab: true,
    },
    rewards: {
      prizeTiers: [
        {
          id: '1',
          place: '1st',
          prizeAmount: '10000',
          currency: 'USDC',
          description: '',
          passMark: 80,
        },
        {
          id: '2',
          place: '2nd',
          prizeAmount: '5000',
          currency: 'USDC',
          description: '',
          passMark: 70,
        },
        {
          id: '3',
          place: '3rd',
          prizeAmount: '3000',
          currency: 'USDC',
          description: '',
          passMark: 60,
        },
      ],
    },
    collaboration: {
      contactEmail: 'contact@example.com',
      telegram: '',
      discord: '',
      socialLinks: [],
      sponsorsPartners: [],
    },
  };

  const handleSave = async (section: string, data: unknown) => {
    setIsSaving(true);
    try {
      await api.patch(
        `/organizations/${organizationId}/hackathons/${hackathonId}/settings/${section.toLowerCase()}`,
        data
      );
      toast.success(`${section} settings saved successfully!`);
    } catch {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='bg-background min-h-screen p-4 text-white sm:p-6 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-3'>
            <Settings className='text-primary h-6 w-6' />
            <h1 className='text-2xl font-bold text-white sm:text-3xl'>
              Hackathon Settings
            </h1>
          </div>
          <p className='text-sm text-gray-400 sm:text-base'>
            Manage your hackathon configuration, timeline, participants, and
            more.
          </p>
        </div>

        <Tabs defaultValue='general' className='w-full'>
          <div className='mb-6 border-b border-gray-900'>
            <ScrollArea className='w-full'>
              <div className='flex w-max min-w-full'>
                <TabsList className='inline-flex h-auto gap-6 bg-transparent p-0'>
                  <TabsTrigger value='general' className={tabTriggerClassName}>
                    <Info className='h-4 w-4' />
                    General
                  </TabsTrigger>
                  <TabsTrigger value='timeline' className={tabTriggerClassName}>
                    <Clock className='h-4 w-4' />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value='participants'
                    className={tabTriggerClassName}
                  >
                    <Users className='h-4 w-4' />
                    Participants
                  </TabsTrigger>
                  <TabsTrigger value='rewards' className={tabTriggerClassName}>
                    <Trophy className='h-4 w-4' />
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger
                    value='collaboration'
                    className={tabTriggerClassName}
                  >
                    <Handshake className='h-4 w-4' />
                    Collaboration
                  </TabsTrigger>
                  <TabsTrigger value='advanced' className={tabTriggerClassName}>
                    <Sliders className='h-4 w-4' />
                    Advanced
                  </TabsTrigger>
                </TabsList>
              </div>
              <ScrollBar orientation='horizontal' className='h-px' />
            </ScrollArea>
          </div>

          <TabsContent value='general' className='mt-0'>
            <GeneralSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              initialData={mockHackathonData.info}
              onSave={data => handleSave('General', data)}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value='timeline' className='mt-0'>
            <TimelineSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              initialData={mockHackathonData.timeline}
              onSave={data => handleSave('Timeline', data)}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value='participants' className='mt-0'>
            <ParticipantSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              initialData={mockHackathonData.participant}
              onSave={data => handleSave('Participants', data)}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value='rewards' className='mt-0'>
            <RewardsSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              initialData={mockHackathonData.rewards}
              onSave={data => handleSave('Rewards', data)}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value='collaboration' className='mt-0'>
            <CollaborationSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              initialData={mockHackathonData.collaboration}
              onSave={data => handleSave('Collaboration', data)}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value='advanced' className='mt-0'>
            <AdvancedSettingsTab
              organizationId={organizationId}
              hackathonId={hackathonId}
              onSave={data => handleSave('Advanced', data)}
              isLoading={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
