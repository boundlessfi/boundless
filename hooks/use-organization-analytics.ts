'use client';

import { useMemo } from 'react';
import { useOrganization } from '@/lib/providers';
import type {
  OrganizationTrend,
  OrganizationTimeSeriesPoint,
} from '@/lib/api/types';

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

export interface UseOrganizationAnalyticsReturn {
  analytics: OrganizationAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

export function useOrganizationAnalytics(): UseOrganizationAnalyticsReturn {
  const {
    activeOrg,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganization();

  const analytics = useMemo(() => {
    if (!activeOrg?.analytics) {
      return null;
    }

    return {
      trends: {
        members: activeOrg.analytics.trends.members,
        hackathons: activeOrg.analytics.trends.hackathons,
        grants: activeOrg.analytics.trends.grants,
      },
      timeSeries: {
        hackathons: activeOrg.analytics.timeSeries.hackathons,
      },
    };
  }, [activeOrg?.analytics]);

  return {
    analytics,
    isLoading: orgLoading,
    error: orgError,
  };
}
