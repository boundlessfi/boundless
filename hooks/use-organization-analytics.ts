'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrganizationAnalytics } from '@/lib/api/organization';
import type {
  OrganizationTrend,
  OrganizationTimeSeriesPoint,
} from '@/lib/api/organization';

export interface OrganizationAnalyticsData {
  trends: {
    members: OrganizationTrend;
    hackathons: OrganizationTrend;
    grants: OrganizationTrend;
  };
  timeSeries: {
    hackathons: OrganizationTimeSeriesPoint[];
  };
}

export interface UseOrganizationAnalyticsOptions {
  organizationId?: string;
  enabled?: boolean;
}

export interface UseOrganizationAnalyticsReturn {
  analytics: OrganizationAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrganizationAnalytics(
  options: UseOrganizationAnalyticsOptions = {}
): UseOrganizationAnalyticsReturn {
  const { organizationId, enabled = true } = options;

  const [analytics, setAnalytics] = useState<OrganizationAnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!organizationId || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrganizationAnalytics(organizationId);
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, enabled]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
