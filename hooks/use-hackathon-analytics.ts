import { useEffect, useState } from 'react';
import {
  getHackathonStatistics,
  getHackathonTimeSeries,
  type HackathonStatistics,
  type HackathonTimeSeriesData,
} from '@/lib/api/hackathons';

interface UseHackathonAnalyticsReturn {
  statistics: HackathonStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;
  timeSeriesData: HackathonTimeSeriesData | null;
  timeSeriesLoading: boolean;
  timeSeriesError: string | null;
}

export const useHackathonAnalytics = (
  organizationId: string | undefined,
  hackathonId: string | undefined
): UseHackathonAnalyticsReturn => {
  const [statistics, setStatistics] = useState<HackathonStatistics | null>(
    null
  );
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);

  const [timeSeriesData, setTimeSeriesData] =
    useState<HackathonTimeSeriesData | null>(null);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
  const [timeSeriesError, setTimeSeriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!organizationId || !hackathonId) return;

      setStatisticsLoading(true);
      setStatisticsError(null);
      try {
        const response = await getHackathonStatistics(
          organizationId,
          hackathonId
        );
        setStatistics(response.data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load statistics';
        setStatisticsError(errorMessage);
        setStatistics({
          participantsCount: 0,
          submissionsCount: 0,
          activeJudges: 0,
          completedMilestones: 0,
        });
      } finally {
        setStatisticsLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      void fetchStatistics();
    }
  }, [organizationId, hackathonId]);

  useEffect(() => {
    const fetchTimeSeries = async () => {
      if (!organizationId || !hackathonId) return;

      setTimeSeriesLoading(true);
      setTimeSeriesError(null);
      try {
        const response = await getHackathonTimeSeries(
          organizationId,
          hackathonId
        );
        setTimeSeriesData(response.data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load analytics';
        setTimeSeriesError(errorMessage);

        setTimeSeriesData({
          submissions: { daily: [], weekly: [] },
          participants: { daily: [], weekly: [] },
        });
      } finally {
        setTimeSeriesLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      void fetchTimeSeries();
    }
  }, [organizationId, hackathonId]);

  return {
    statistics,
    statisticsLoading,
    statisticsError,
    timeSeriesData,
    timeSeriesLoading,
    timeSeriesError,
  };
};
