'use client';

import { useEffect, useMemo, useRef } from 'react';
import MetricsCard from '@/components/organization/cards/MetricsCard';
import Participant from '@/components/organization/cards/Participant';
import { useParams } from 'next/navigation';
import { useHackathons } from '@/hooks/use-hackathons';
import { getHackathonStatistics } from '@/lib/api/hackathons';
import { useState } from 'react';

export default function ParticipantsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const {
    participants,
    participantsLoading,
    participantsError,
    fetchParticipants,
  } = useHackathons({
    organizationId,
    autoFetch: false,
  });

  // Handler to refresh participants after review actions
  const handleReviewSuccess = () => {
    if (organizationId && hackathonId) {
      fetchParticipants(hackathonId);
    }
  };

  const [statistics, setStatistics] = useState<{
    participantsCount: number;
    submissionsCount: number;
  } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // Refs to prevent duplicate fetches
  const hasFetchedParticipantsRef = useRef(false);
  const hasFetchedStatisticsRef = useRef(false);
  const lastOrgIdRef = useRef<string | null>(null);
  const lastHackathonIdRef = useRef<string | null>(null);

  // Reset fetch flags when IDs change
  useEffect(() => {
    if (
      lastOrgIdRef.current !== organizationId ||
      lastHackathonIdRef.current !== hackathonId
    ) {
      // IDs changed, reset fetch flags
      hasFetchedParticipantsRef.current = false;
      hasFetchedStatisticsRef.current = false;
      lastOrgIdRef.current = organizationId;
      lastHackathonIdRef.current = hackathonId;
    }
  }, [organizationId, hackathonId]);

  // Fetch participants on mount or when IDs change
  useEffect(() => {
    if (organizationId && hackathonId && !hasFetchedParticipantsRef.current) {
      hasFetchedParticipantsRef.current = true;
      fetchParticipants(hackathonId);
    }
  }, [organizationId, hackathonId, fetchParticipants]);

  // Fetch statistics only once on mount or when IDs change
  useEffect(() => {
    const loadStatistics = async () => {
      if (!organizationId || !hackathonId || hasFetchedStatisticsRef.current) {
        return;
      }

      hasFetchedStatisticsRef.current = true;
      setStatisticsLoading(true);
      try {
        const response = await getHackathonStatistics(
          organizationId,
          hackathonId
        );
        setStatistics({
          participantsCount: response.data.participantsCount,
          submissionsCount: response.data.submissionsCount,
        });
      } catch {
        // Fallback to calculating from participants data only if we have it
        // Don't trigger another fetch
      } finally {
        setStatisticsLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      loadStatistics();
    }
  }, [organizationId, hackathonId]);

  // Ensure participants is always an array
  const participantsList = useMemo(() => {
    return Array.isArray(participants) ? participants : [];
  }, [participants]);

  // Calculate metrics from participants if statistics not available
  // This is a fallback calculation, not a trigger for fetching
  const metrics = useMemo(() => {
    if (statistics) {
      return statistics;
    }

    // Only calculate from participants if we have them and statistics failed
    const participantsCount = participantsList.length;
    const submissionsCount = participantsList.filter(p => p.submission).length;

    return {
      participantsCount,
      submissionsCount,
    };
  }, [statistics, participantsList]);

  if (participantsLoading && participantsList.length === 0) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-8 text-white'>
        <div className='text-center'>
          <div className='mb-4 text-lg'>Loading participants...</div>
        </div>
      </div>
    );
  }

  if (participantsError && participantsList.length === 0) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-8 text-white'>
        <div className='text-center'>
          <div className='mb-4 text-lg text-red-400'>
            Error loading participants
          </div>
          <div className='text-sm text-gray-400'>{participantsError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-background min-h-screen space-y-4 p-8 text-white'>
      <div className='flex gap-4'>
        <MetricsCard
          title='Total Participants'
          value={metrics.participantsCount}
          subtitle={
            statisticsLoading
              ? undefined
              : metrics.participantsCount > 0
                ? `${metrics.participantsCount} registered`
                : undefined
          }
          showTrend={true}
        />
        <MetricsCard
          title='Total Submissions'
          value={metrics.submissionsCount}
          subtitle={
            statisticsLoading
              ? undefined
              : metrics.participantsCount > 0
                ? `${((metrics.submissionsCount / metrics.participantsCount) * 100).toFixed(1)}% submission rate`
                : undefined
          }
        />
      </div>
      <div className='flex flex-col gap-4'>
        {participantsList.length === 0 ? (
          <div className='bg-background/8 rounded-lg border border-gray-900 p-8 text-center text-gray-400'>
            No participants found
          </div>
        ) : (
          participantsList.map(participant => (
            <Participant
              key={participant._id}
              participant={participant}
              organizationId={organizationId}
              hackathonId={hackathonId}
              onReviewSuccess={handleReviewSuccess}
            />
          ))
        )}
      </div>
    </div>
  );
}
