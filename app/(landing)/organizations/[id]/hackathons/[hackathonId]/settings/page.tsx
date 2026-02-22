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
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api/api';
import { getHackathon, Hackathon } from '@/lib/api/hackathons';
import { useEffect } from 'react';
import GeneralSettingsTab from '@/components/organization/hackathons/settings/GeneralSettingsTab';
import TimelineSettingsTab from '@/components/organization/hackathons/settings/TimelineSettingsTab';
import ParticipantSettingsTab from '@/components/organization/hackathons/settings/ParticipantSettingsTab';
import RewardsSettingsTab from '@/components/organization/hackathons/settings/RewardsSettingsTab';
import CollaborationSettingsTab from '@/components/organization/hackathons/settings/CollaborationSettingsTab';
import AdvancedSettingsTab from '@/components/organization/hackathons/settings/AdvancedSettingsTab';
import SubmissionVisibilitySettingsTab from '@/components/organization/hackathons/settings/SubmissionVisibilitySettingsTab';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

export default function SettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [isSaving, setIsSaving] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHackathon = async () => {
    try {
      const res = await getHackathon(hackathonId);
      setHackathon(res.data);
    } catch {
      toast.error('Failed to load hackathon data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hackathonId) {
      fetchHackathon();
    }
  }, [hackathonId]);

  const tabTriggerClassName =
    'data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-gray-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none flex items-center gap-2';

  // Mapping functions to convert Hackathon to tab data types
  const getGeneralData = (h: Hackathon | null) => {
    if (!h) return undefined;
    return {
      name: h.name,
      tagline: h.tagline,
      slug: h.slug,
      banner: h.banner,
      description: h.description,
      categories: h.categories,
      venueType: h.venueType.toLowerCase() as any,
      country: h.country,
      state: h.state,
      city: h.city,
      venueName: h.venueName,
      venueAddress: h.venueAddress,
    };
  };

  const getTimelineData = (h: Hackathon | null) => {
    if (!h) return undefined;
    return {
      startDate: h.startDate ? new Date(h.startDate) : undefined,
      endDate: h.endDate ? new Date(h.endDate) : undefined,
      submissionDeadline: h.submissionDeadline
        ? new Date(h.submissionDeadline)
        : undefined,
      judgingStart: h.judgingStart ? new Date(h.judgingStart) : undefined,
      judgingEnd: h.judgingEnd ? new Date(h.judgingEnd) : undefined,
      winnersAnnouncedAt: h.winnersAnnouncedAt
        ? new Date(h.winnersAnnouncedAt)
        : undefined,
      timezone: h.timezone || 'UTC',
      phases: h.phases?.map(p => ({
        ...p,
        startDate: p.startDate ? new Date(p.startDate) : undefined,
        endDate: p.endDate ? new Date(p.endDate) : undefined,
      })) as any,
    };
  };

  const getParticipantData = (h: Hackathon | null) => {
    if (!h) return undefined;
    return {
      participantType: h.participantType.toLowerCase() as any,
      teamMin: h.teamMin,
      teamMax: h.teamMax,
      require_github: h.requireGithub,
      require_demo_video: h.requireDemoVideo,
      require_other_links: h.requireOtherLinks,
      registrationDeadlinePolicy:
        h.registrationDeadlinePolicy?.toLowerCase() as any,
      registrationDeadline: h.customRegistrationDeadline || undefined,
      detailsTab: h.enabledTabs.includes('detailsTab'),
      participantsTab: h.enabledTabs.includes('participantsTab'),
      resourcesTab: h.enabledTabs.includes('resourcesTab'),
      submissionTab: h.enabledTabs.includes('submissionTab'),
      announcementsTab: h.enabledTabs.includes('announcementsTab'),
      discussionTab: h.enabledTabs.includes('discussionTab'),
      winnersTab: h.enabledTabs.includes('winnersTab'),
      sponsorsTab: h.enabledTabs.includes('sponsorsTab'),
      joinATeamTab: h.enabledTabs.includes('joinATeamTab'),
      rulesTab: h.enabledTabs.includes('rulesTab'),
    };
  };

  const getAdvancedData = (h: Hackathon | null) => {
    if (!h) return undefined;
    const adv = h.metadata?.advancedSettings;
    return {
      isPublic: adv?.isPublic ?? true,
      allowLateRegistration: adv?.allowLateRegistration ?? false,
      requireApproval: adv?.requireApproval ?? false,
      maxParticipants: adv?.maxParticipants,
      customDomain: adv?.customDomain || '',
      enableDiscord: adv?.enableDiscord ?? !!h.discord,
      discordInviteLink: adv?.discordInviteLink || h.discord || '',
      enableTelegram: adv?.enableTelegram ?? !!h.telegram,
      telegramInviteLink: adv?.telegramInviteLink || h.telegram || '',
    };
  };

  const handleSave = async (section: string, data: unknown) => {
    setIsSaving(true);
    try {
      if (section === 'General') {
        await api.patch(
          `/organizations/${organizationId}/hackathons/${hackathonId}/content`,
          { information: data }
        );
      } else if (section === 'Collaboration') {
        await api.patch(
          `/organizations/${organizationId}/hackathons/${hackathonId}/content`,
          { collaboration: data }
        );
      } else if (section === 'Participants') {
        await api.patch(
          `/organizations/${organizationId}/hackathons/${hackathonId}/schedule`,
          { participation: data }
        );
      } else if (section === 'Rewards') {
        await api.patch(
          `/organizations/${organizationId}/hackathons/${hackathonId}/financial`,
          { rewards: data }
        );
      } else {
        await api.patch(
          `/organizations/${organizationId}/hackathons/${hackathonId}/settings/${section.toLowerCase()}`,
          data
        );
      }
      toast.success(`${section} settings saved successfully!`);
      await fetchHackathon(); // Call fetchHackathon after successful save
    } catch (error: any) {
      const message =
        error.response?.data?.message || `Failed to save ${section} settings`;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(errorMessage);
      throw error; // Re-throw to let callers know it failed
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
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
                    <TabsTrigger
                      value='general'
                      className={tabTriggerClassName}
                    >
                      <Info className='h-4 w-4' />
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value='timeline'
                      className={tabTriggerClassName}
                    >
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
                    <TabsTrigger
                      value='rewards'
                      className={tabTriggerClassName}
                    >
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
                    <TabsTrigger
                      value='advanced'
                      className={tabTriggerClassName}
                    >
                      <Sliders className='h-4 w-4' />
                      Advanced
                    </TabsTrigger>
                    <TabsTrigger
                      value='submissions'
                      className={tabTriggerClassName}
                    >
                      <Eye className='h-4 w-4' />
                      Submissions
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
                initialData={getGeneralData(hackathon) as any}
                onSave={async data => {
                  await handleSave('General', data);
                }}
                isLoading={isSaving}
                isPublished={hackathon?.status === 'PUBLISHED'}
              />
            </TabsContent>

            <TabsContent value='timeline' className='mt-0'>
              <TimelineSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
                initialData={getTimelineData(hackathon)}
                onSaveSuccess={fetchHackathon}
              />
            </TabsContent>

            <TabsContent value='participants' className='mt-0'>
              <ParticipantSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
                initialData={
                  hackathon ? getParticipantData(hackathon) : undefined
                }
                isRegistrationClosed={
                  hackathon ? !hackathon.registrationOpen : false
                }
                onSave={async data => {
                  await handleSave('Participants', data);
                }}
                isLoading={isSaving}
              />
            </TabsContent>

            <TabsContent value='rewards' className='mt-0'>
              <RewardsSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
                initialData={{ prizeTiers: hackathon?.prizeTiers || [] } as any}
                onSave={async data => {
                  await handleSave('Rewards', data);
                }}
                isLoading={isSaving}
              />
            </TabsContent>

            <TabsContent value='collaboration' className='mt-0'>
              <CollaborationSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
                initialData={
                  {
                    contactEmail: hackathon?.contactEmail || '',
                    telegram: hackathon?.telegram || '',
                    discord: hackathon?.discord || '',
                    socialLinks: hackathon?.socialLinks || [],
                    sponsorsPartners: hackathon?.sponsorsPartners || [],
                  } as any
                }
                onSave={async data => {
                  await handleSave('Collaboration', data);
                }}
                isLoading={isSaving}
              />
            </TabsContent>

            <TabsContent value='advanced' className='mt-0'>
              <AdvancedSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
                initialData={getAdvancedData(hackathon)}
                onSaveSuccess={fetchHackathon}
              />
            </TabsContent>

            <TabsContent value='submissions' className='mt-0'>
              <SubmissionVisibilitySettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
