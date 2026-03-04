'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/use-auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import {
  ProgressIndicator,
  SubmissionStage,
} from '@/components/hackathons/ProgressIndicator';
import { cn } from '@/lib/utils';
import { Hackathon } from '@/lib/api/hackathons';
import EmptyState from '@/components/EmptyState';

type TabType = 'all' | 'hackathons' | 'projects';

/** API shape: joined hackathon can be wrapper or raw hackathon. */
type JoinedHackathonRow = { hackathon?: Hackathon } | Hackathon;

/** API shape: participant record with nested hackathon. */
interface HackathonParticipantRow {
  hackathon: Hackathon;
}

/** API shape: submission record with nested hackathon. */
interface HackathonSubmissionRow {
  hackathon: Hackathon;
}

interface UnifiedItem extends Hackathon {
  type: 'hackathon';
}

const ParticipatingPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuthStatus();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  const unifiedList = useMemo<UnifiedItem[]>(() => {
    const profile = user?.profile;
    if (!profile) {
      return [];
    }

    const joinedHackathons = (profile.user?.joinedHackathons ||
      []) as JoinedHackathonRow[];
    const hackathonsAsParticipant = (profile.hackathonsAsParticipant ||
      []) as HackathonParticipantRow[];
    const submissions = (profile.user?.hackathonSubmissionsAsParticipant ||
      []) as HackathonSubmissionRow[];

    const typedJoinedHackathons: UnifiedItem[] = joinedHackathons
      .filter((h: JoinedHackathonRow) => {
        const data =
          (h as { hackathon?: Hackathon }).hackathon ?? (h as Hackathon);
        return data?.id != null;
      })
      .map((h: JoinedHackathonRow) => {
        const hackathonData =
          (h as { hackathon?: Hackathon }).hackathon ?? (h as Hackathon);
        return {
          ...hackathonData,
          type: 'hackathon' as const,
        };
      });

    const typedParticipatingHackathons: UnifiedItem[] = hackathonsAsParticipant
      .filter((p: HackathonParticipantRow) => p?.hackathon?.id != null)
      .map((p: HackathonParticipantRow) => ({
        ...p.hackathon,
        type: 'hackathon' as const,
      }));

    const typedSubmissionHackathons: UnifiedItem[] = submissions
      .filter((s: HackathonSubmissionRow) => s?.hackathon != null)
      .map((s: HackathonSubmissionRow) => ({
        ...s.hackathon,
        type: 'hackathon' as const,
      }));

    // Merge and deduplicate by ID
    const merged = [
      ...typedParticipatingHackathons,
      ...typedJoinedHackathons,
      ...typedSubmissionHackathons,
    ];

    const seen = new Set<string>();
    const deduplicated = merged.filter(item => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    const now = Date.now();
    const sorted = deduplicated.sort((a, b) => {
      const getPriority = (h: UnifiedItem) => {
        if (!h.startDate || !h.submissionDeadline) return 1;

        const start = new Date(h.startDate).getTime();
        const deadline = new Date(h.submissionDeadline).getTime();

        if (now >= start && now <= deadline) return 0;
        if (now < start) return 1;
        return 2;
      };

      return getPriority(a) - getPriority(b);
    });

    return sorted;
  }, [user]);

  const filteredList = useMemo(() => {
    if (activeTab === 'projects') return [];

    let result = unifiedList;
    // Intentional: filter by type so that when UnifiedItem gains 'project' entries, this tab shows only hackathons.
    if (activeTab === 'hackathons') {
      result = unifiedList.filter(item => item.type === 'hackathon');
    }
    return result;
  }, [unifiedList, activeTab]);

  const getSubmissionStage = (hackathonId: string): SubmissionStage => {
    const submission =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?.profile?.user?.hackathonSubmissionsAsParticipant?.find(
        (s: any) => s.hackathonId === hackathonId
      );

    if (!submission) return 'Not Started';

    const statusRaw = submission.status;
    if (!statusRaw || typeof statusRaw !== 'string') return 'In Progress';

    const status = statusRaw.toUpperCase();
    if (status === 'DRAFT') return 'In Progress';
    if (status === 'SUBMITTED') return 'Submitted';
    if (status === 'UNDER_REVIEW') return 'Under Review';
    if (status === 'WINNER' || status === 'COMPLETED') return 'Results Pending';

    return 'In Progress';
  };

  const handleEmptyStateClick = () => {
    router.push(activeTab === 'projects' ? '/projects' : '/hackathons');
  };

  if (isLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12'>
      <div className='mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white md:text-4xl'>
            Participating
          </h1>
          <p className='mt-2 text-zinc-400'>
            Track your active hackathons, projects, and pending submissions.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className='w-full md:w-auto'
        >
          <TabsList className='relative h-11 w-full justify-start rounded-full bg-zinc-900/50 p-1 md:w-auto'>
            {['all', 'hackathons', 'projects'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  'relative z-10 h-9 rounded-full px-6 text-sm font-medium capitalize transition-colors duration-200',
                  activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId='activeTabGlow'
                    className='absolute inset-0 -z-10 rounded-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode='popLayout'>
        {filteredList.length > 0 ? (
          <motion.div
            layout
            className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {filteredList.map(hackathon => (
              <motion.div
                key={hackathon.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='group relative'
              >
                <div className='relative overflow-hidden rounded-4xl'>
                  <HackathonCard
                    {...hackathon}
                    isFullWidth
                    target='_blank'
                    className='hover:shadow-primary/5 border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-2xl'
                  />
                  <div className='pointer-events-none absolute right-4 bottom-4 z-20 transition-transform duration-300 group-hover:scale-105'>
                    <ProgressIndicator
                      stage={getSubmissionStage(hackathon.id)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title={
              activeTab === 'projects'
                ? 'No active projects'
                : 'No active engagements'
            }
            description={
              activeTab === 'projects'
                ? "You haven't participated in any projects yet. Explore our community projects to get started!"
                : "You haven't participated in any hackathons yet. Explore our open events to get started!"
            }
            buttonText={
              activeTab === 'projects'
                ? 'Explore Projects'
                : 'Explore Hackathons'
            }
            onAddClick={handleEmptyStateClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipatingPage;
