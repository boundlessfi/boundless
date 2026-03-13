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

// ─── Types ────────────────────────────────────────────────────────────────────

interface HackathonDataContextType {
  // Core hackathon data
  currentHackathon: Hackathon | null;
  submissions: SubmissionCardProps[];
  exploreSubmissions: SubmissionCardProps[];
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

  const { data: submissions = [], isLoading: submissionsLoading } =
    useHackathonSubmissions(hackathonSlug);

  const { data: exploreSubmissionsData } = useExploreSubmissions(
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
    submitterName: s.participant?.name || s.teamName || 'Anonym',
    submitterAvatar: s.participant?.image,
    category: s.category,
    logo: s.logo || undefined,
    upvotes: 0, // votes field missing in ExploreSubmissionsResponse
    comments: s.comments,
    submittedDate: s.submissionDate || s.submittedAt,
    status: (s.status?.toUpperCase() === 'SHORTLISTED'
      ? 'Approved'
      : s.status?.toUpperCase() === 'DISQUALIFIED'
        ? 'Rejected'
        : 'Pending') as any,
  }));

  const { data: winners = [] } = useHackathonWinners(
    currentHackathon?.id ?? '',
    !!currentHackathon?.id
  );

  const refreshCurrentHackathon = useRefreshHackathon(hackathonSlug);

  const loading = hackathonLoading || submissionsLoading;
  const error = hackathonError instanceof Error ? hackathonError.message : null;

  const value: HackathonDataContextType = {
    currentHackathon,
    submissions,
    exploreSubmissions,
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
