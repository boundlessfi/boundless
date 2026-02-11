import { useEffect, useState } from 'react';
import { getHackathonAnalytics } from '@/lib/api/hackathon';
import {
  type HackathonAnalyticsSummary,
  type HackathonAnalyticsTrends,
  type TimelineEvent,
} from '@/lib/api/hackathons';

interface UseHackathonAnalyticsReturn {
  analytics: {
    summary: HackathonAnalyticsSummary;
    trends: HackathonAnalyticsTrends;
    timeline: TimelineEvent[];
  } | null;
  loading: boolean;
  error: string | null;
}

export const useHackathonAnalytics = (
  organizationId: string | undefined,
  hackathonId: string | undefined
): UseHackathonAnalyticsReturn => {
  const [data, setData] =
    useState<UseHackathonAnalyticsReturn['analytics']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organizationId || !hackathonId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getHackathonAnalytics(
          organizationId,
          hackathonId
        );
        setData({
          summary: response.data.summary,
          trends: response.data.trends,
          timeline: response.data.timeline,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load analytics';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      void fetchAnalytics();
    }
  }, [organizationId, hackathonId]);

  return {
    analytics: data,
    loading,
    error,
  };
};
