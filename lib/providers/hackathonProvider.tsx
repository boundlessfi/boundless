'use client';

/**
 * HackathonDataProvider — SLIM VERSION
 *
 * This provider no longer fetches hackathon data itself.
 * - Initial hackathon data is fetched by the Server Component (page.tsx) and
 *   seeded into the React Query cache via `useHackathon(slug, initialData)`.
 * - Submissions and winners are fetched by React Query hooks per-component.
 *
 * This context only holds lightweight UI/interaction state that doesn't fit
 * neatly into React Query: nothing that requires a network call lives here.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { Hackathon, HackathonWinner } from '@/lib/api/hackathons';
import type { SubmissionCardProps } from '@/types/hackathon';
import {
  useHackathon,
  useHackathonSubmissions,
  useExploreSubmissions,
  useHackathonWinners,
  useRefreshHackathon,
  hackathonKeys,
} from '@/hooks/hackathon/use-hackathon-queries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSubmissionStatus(raw?: string): SubmissionCardProps['status'] {
  const status = raw?.toUpperCase();
  if (status === 'SHORTLISTED') return 'Approved';
  if (status === 'DISQUALIFIED') return 'Rejected';
  return 'Pending';
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface HackathonDataContextType {
  // Core hackathon data
  currentHackathon: Hackathon | null;
  submissions: SubmissionCardProps[];
  exploreSubmissions: SubmissionCardProps[];
  exploreSubmissionsTotal: number;
  winners: HackathonWinner[];

  // Loading / error
  loading: boolean;
  error: string | null;

  // Actions
  refreshCurrentHackathon: () => Promise<void>;

  // Kept for compatibility — these are no-ops, use useCommentSystem hook directly
  // in components that need discussions (already done in HackathonPageClient).
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const HackathonDataContext = createContext<
  HackathonDataContextType | undefined
>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface HackathonDataProviderProps {
  children: ReactNode;
  /** The hackathon slug (from URL params) */
  hackathonSlug: string;
  /** Server-fetched initial data — seeds the React Query cache so there is no
   *  client-side loading state on first render. */
  initialData?: Hackathon;
}

export function HackathonDataProvider({
  children,
  hackathonSlug,
  initialData,
}: HackathonDataProviderProps) {
  // React Query handles caching, deduplication, and background refetching.
  // `initialData` seeds the cache from the server — no waterfall on first load.
  const {
    data: currentHackathon = null,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathon(hackathonSlug, initialData);

  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useHackathonSubmissions(hackathonSlug);

  const {
    data: exploreSubmissionsData,
    isLoading: exploreLoading,
    error: exploreError,
  } = useExploreSubmissions(
    currentHackathon?.id ?? '',
    { page: 1, limit: 12 },
    !!currentHackathon?.id
  );

  const exploreSubmissions: SubmissionCardProps[] = (
    exploreSubmissionsData?.submissions ?? []
  ).map(s => ({
    _id: s.id,
    projectName: s.projectName,
    description: s.description,
    submitterName: s.participant?.name || s.teamName || 'Anonymous',
    submitterAvatar: s.participant?.image,
    category: s.category,
    logo: s.logo || undefined,
    upvotes: 0, // votes field missing in ExploreSubmissionsResponse
    comments: s.comments,
    submittedDate: s.submissionDate || s.submittedAt,
    status: mapSubmissionStatus(s.status),
  }));

  const exploreSubmissionsTotal =
    exploreSubmissionsData?.pagination?.total ?? 0;

  const {
    data: winners = [],
    isLoading: winnersLoading,
    error: winnersError,
  } = useHackathonWinners(hackathonSlug, !!hackathonSlug);

  const refreshCurrentHackathon = useRefreshHackathon(hackathonSlug);

  const loading =
    hackathonLoading || submissionsLoading || exploreLoading || winnersLoading;
  const error =
    (hackathonError instanceof Error ? hackathonError.message : null) ||
    (submissionsError instanceof Error ? submissionsError.message : null) ||
    (exploreError instanceof Error ? exploreError.message : null) ||
    (winnersError instanceof Error ? winnersError.message : null);

  const value: HackathonDataContextType = {
    currentHackathon,
    submissions,
    exploreSubmissions,
    exploreSubmissionsTotal,
    winners,
    loading,
    error,
    refreshCurrentHackathon,
    // no-ops — kept for interface compatibility during migration
    setLoading: () => {},
    setError: () => {},
  };

  return (
    <HackathonDataContext.Provider value={value}>
      {children}
    </HackathonDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useHackathonData = () => {
  const context = useContext(HackathonDataContext);
  if (!context) {
    throw new Error(
      'useHackathonData must be used within a HackathonDataProvider'
    );
  }
  return context;
};

// Re-export query keys so consumers can invalidate caches.
export { hackathonKeys };
