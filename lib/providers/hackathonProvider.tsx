'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { SubmissionCardProps } from '@/types/hackathon';
import { Comment } from '@/types/comment';
import {
  Hackathon,
  HackathonResourceItem,
  getExploreSubmissions,
  ExploreSubmissionsResponse,
  HackathonWinner,
} from '@/lib/api/hackathons';
import {
  getHackathons,
  getHackathon,
  getHackathonSubmissions,
  getHackathonWinners,
} from '@/lib/api/hackathon';
import { reportError } from '@/lib/error-reporting';

// -------------------
// Status Mapper
// -------------------

/**
 * Maps API submission status to UI status values
 * API: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED' | 'WITHDRAWN'
 * UI: 'Pending' | 'Approved' | 'Rejected'
 */
function mapSubmissionStatus(apiStatus: string): SubmissionCardProps['status'] {
  const normalized = apiStatus?.toUpperCase();

  switch (normalized) {
    case 'SHORTLISTED':
      return 'Approved';
    case 'DISQUALIFIED':
    case 'WITHDRAWN':
      return 'Rejected';
    case 'SUBMITTED':
    default:
      return 'Pending';
  }
}

// -------------------
// Types
// -------------------

interface TimelineEvent {
  event: string;
  date: string;
}

interface Prize {
  title: string;
  rank: string;
  prize: string;
  icon: string;
  details: string[];
}

interface ResourceItem {
  id: number;
  title: string;
  type: 'link' | 'file';
  size: string;
  url: string;
  uploadDate: string;
  description: string;
}

interface HackathonDataContextType {
  hackathons: Hackathon[];
  ongoingHackathons: Hackathon[];
  upcomingHackathons: Hackathon[];
  pastHackathons: Hackathon[];

  currentHackathon: Hackathon | null;
  discussions: Comment[]; // Using generic Comment type
  submissions: SubmissionCardProps[];
  exploreSubmissions: SubmissionCardProps[];
  winners: HackathonWinner[];
  // content: string;
  timelineEvents: TimelineEvent[];
  prizes: Prize[];
  resources: ResourceItem[];

  loading: boolean;
  error: string | null;

  getHackathonById: (id: string) => Hackathon | undefined;
  getHackathonBySlug: (slug: string) => Promise<Hackathon | null>;

  setCurrentHackathon: (slug: string) => void;

  addDiscussion: (content: string) => Promise<void>;
  addReply: (parentCommentId: string, content: string) => Promise<void>;
  updateDiscussion: (commentId: string, content: string) => Promise<void>;
  deleteDiscussion: (commentId: string) => Promise<void>;
  reportDiscussion: (
    commentId: string,
    reason: string,
    description?: string
  ) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  refreshHackathons: () => Promise<void>;
  refreshCurrentHackathon: () => Promise<void>;
}

const HackathonDataContext = createContext<
  HackathonDataContextType | undefined
>(undefined);

interface HackathonDataProviderProps {
  children: ReactNode;
  hackathonSlug?: string;
}

// -----------------------------
// Provider
// -----------------------------

export function HackathonDataProvider({
  children,
  hackathonSlug,
}: HackathonDataProviderProps) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [currentHackathon, setCurrentHackathonState] =
    useState<Hackathon | null>(null);
  const [currentHackathonSlug, setCurrentHackathonSlug] = useState<
    string | null
  >(hackathonSlug || null);
  const [submissions, setSubmissions] = useState<SubmissionCardProps[]>([]);
  const [exploreSubmissions, setExploreSubmissions] = useState<
    SubmissionCardProps[]
  >([]);
  const [winners, setWinners] = useState<HackathonWinner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  // --------------------------------
  // Error helper
  // --------------------------------
  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  // --------------------------------
  // Fetch all hackathons
  // --------------------------------
  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getHackathons();

      if (response.success && response.data) {
        let hackathonsArray: Hackathon[];

        if (Array.isArray(response.data)) {
          hackathonsArray = response.data;
        } else if (
          response.data.hackathons &&
          Array.isArray(response.data.hackathons)
        ) {
          hackathonsArray = response.data.hackathons;
        } else {
          hackathonsArray = [];
        }

        setHackathons(hackathonsArray);
      } else {
        throw new Error(response.message || 'Failed to fetch hackathons');
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Failed to fetch hackathons';
      setError(msg);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  }, [setError]);

  // --------------------------------
  // Fetch hackathon by slug
  // --------------------------------
  const fetchHackathonBySlug = useCallback(
    async (slug: string) => {
      if (fetchingRef.current) return null;

      try {
        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        const response = await getHackathon(slug);
        if (response.success && response.data) {
          setCurrentHackathonState(response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Hackathon not found');
        }
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Failed to fetch hackathon';
        setError(msg);
        return null;
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [setError]
  );

  // --------------------------------
  // Fetch submissions
  // --------------------------------
  const fetchSubmissions = useCallback(async (slug: string) => {
    try {
      const response = await getHackathonSubmissions(slug, { limit: 50 });
      if (response.success && response.data) {
        setSubmissions(response.data.submissions);
      }
    } catch (err) {
      reportError(err, { context: 'fetchSubmissions', slug });
    }
  }, []);

  const fetchExploreSubmissions = useCallback(async (hackathonId: string) => {
    try {
      const submissions = await getExploreSubmissions(hackathonId);
      const mappedSubmissions: SubmissionCardProps[] = submissions.map(sub => ({
        _id: sub.id,
        projectName: sub.projectName,
        description: sub.description,
        submitterName:
          sub.participant?.name ??
          sub.teamName ??
          sub.teamMembers?.[0]?.name ??
          'Unknown Participant',
        submitterAvatar:
          sub.participant?.image ??
          sub.teamMembers?.[0]?.avatar ??
          sub.logo ??
          '',
        category: sub.category,
        status: mapSubmissionStatus(sub.status),
        upvotes: 0,
        submittedDate: sub.submittedAt ?? sub.submissionDate ?? '',
        logo: sub.logo ?? '/placeholder.svg',
      }));
      setExploreSubmissions(mappedSubmissions);
    } catch (err) {
      reportError(err, { context: 'fetchExploreSubmissions', hackathonId });
    }
  }, []);

  // --------------------------------
  // Fetch winners
  // --------------------------------
  const fetchWinners = useCallback(async (hackathonIdOrSlug: string) => {
    try {
      const response = await getHackathonWinners(hackathonIdOrSlug);
      if (response.success && response.data) {
        setWinners(response.data.winners);
      }
    } catch {
      // If 404 or other error, simply don't show winners
      setWinners([]);
    }
  }, []);

  // --------------------------------
  // Computed lists
  // --------------------------------

  const ongoingHackathons = React.useMemo(
    () =>
      hackathons.filter(h => h.status === 'ACTIVE' || h.status === 'JUDGING'),
    [hackathons]
  );

  const upcomingHackathons = React.useMemo(
    () => hackathons.filter(h => h.status === 'UPCOMING'),
    [hackathons]
  );

  const pastHackathons = React.useMemo(
    () =>
      hackathons.filter(
        h =>
          h.status === 'COMPLETED' ||
          h.status === 'ARCHIVED' ||
          h.status === 'CANCELLED'
      ),
    [hackathons]
  );

  const getHackathonById = (id: string) => hackathons.find(h => h.id === id);

  const getHackathonBySlug = async (slug: string) =>
    await fetchHackathonBySlug(slug);

  // --------------------------------
  // Set current hackathon
  // --------------------------------
  const setCurrentHackathon = useCallback(
    async (slug: string) => {
      if (currentHackathonSlug === slug && fetchingRef.current) return;

      setCurrentHackathonSlug(slug);
      const data = await fetchHackathonBySlug(slug);

      if (data) {
        await Promise.all([
          fetchSubmissions(slug),
          fetchExploreSubmissions(data.id),
          fetchWinners(data.id), // Fetch by ID as per spec, but slug likely works too if API supports it
        ]);
      }
    },
    [
      currentHackathonSlug,
      fetchHackathonBySlug,
      fetchSubmissions,
      fetchExploreSubmissions,
      fetchWinners,
    ]
  );

  const refreshHackathons = async () => {
    await fetchHackathons();
  };

  const refreshCurrentHackathon = async () => {
    if (currentHackathonSlug) {
      await setCurrentHackathon(currentHackathonSlug);
    }
  };

  // --------------------------------
  // Mock Data
  // --------------------------------

  // Discussions are now fetched directly in components via useCommentSystem
  const mockDiscussions: Comment[] = [];

  // const mockContent = `# ${
  //   currentHackathon?.title || 'Hackathon'
  // }\n\n## 🌐 Hackathon Theme\n${
  //   currentHackathon?.tagline || 'Build innovative solutions'
  // }\n\n## Challenge Description\n${
  //   currentHackathon?.description ||
  //   'Create an innovative project that solves real-world problems.'
  // }`;

  const mockTimelineEvents: TimelineEvent[] = currentHackathon
    ? [
        {
          event: 'Hackathon Launch',
          date: new Date(currentHackathon.startDate).toLocaleDateString(),
        },
        {
          event: 'Submission Deadline',
          date: new Date(
            currentHackathon.submissionDeadline
          ).toLocaleDateString(),
        },
        ...(currentHackathon.judgingDeadline
          ? [
              {
                event: 'Judging Deadline',
                date: new Date(
                  currentHackathon.judgingDeadline
                ).toLocaleDateString(),
              },
            ]
          : []),
      ]
    : [];

  const mockPrizes: Prize[] = currentHackathon
    ? [
        {
          title: 'Grand Prize',
          rank: '1 winner',
          prize: `${currentHackathon.prizeTiers.reduce((acc, prize) => acc + Number(prize.prizeAmount || 0), 0)} in prizes`,
          icon: '⭐',
          details: [
            `Prize: ${currentHackathon.prizeTiers.reduce((acc, prize) => acc + Number(prize.prizeAmount || 0), 0)}`,
            'Premium Swag Box',
          ],
        },
      ]
    : [];

  const mockResources: ResourceItem[] = currentHackathon?.resources
    ? (currentHackathon.resources.map(
        (resource: HackathonResourceItem, index: number) => ({
          id: index,
          title: resource.description || `Resource ${index + 1}`,
          type: resource.file?.url ? 'file' : 'link',
          size: 'N/A',
          url: resource.file?.url || '',
          uploadDate: new Date().toISOString(),
          description: resource.description || '',
        })
      ) as ResourceItem[])
    : [];

  // --------------------------------
  // Discussion placeholder functions
  // --------------------------------

  const addDiscussion = async (content: string) => {
    void content;
  };

  const addReply = async (parentCommentId: string, content: string) => {
    void parentCommentId;
    void content;
  };

  const updateDiscussion = async (commentId: string, content: string) => {
    void commentId;
    void content;
  };

  const deleteDiscussion = async (commentId: string) => {
    void commentId;
  };

  const reportDiscussion = async (
    commentId: string,
    reason: string,
    description?: string
  ) => {
    void commentId;
    void reason;
    void description;
  };

  // --------------------------------
  // Initial load
  // --------------------------------

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  useEffect(() => {
    if (hackathonSlug && !currentHackathon) {
      setCurrentHackathon(hackathonSlug);
    }
  }, [hackathonSlug, currentHackathon, setCurrentHackathon]);

  // --------------------------------
  // Context Value
  // --------------------------------

  const value: HackathonDataContextType = {
    hackathons,
    ongoingHackathons,
    upcomingHackathons,
    pastHackathons,

    currentHackathon,
    discussions: mockDiscussions,
    submissions,
    exploreSubmissions,
    winners,
    // content: mockContent,
    timelineEvents: mockTimelineEvents,
    prizes: mockPrizes,
    resources: mockResources,

    loading,
    error,

    getHackathonById,
    getHackathonBySlug,
    setCurrentHackathon,
    addDiscussion,
    addReply,
    updateDiscussion,
    deleteDiscussion,
    reportDiscussion,
    setLoading,
    setError,
    refreshHackathons,
    refreshCurrentHackathon,
  };

  return (
    <HackathonDataContext.Provider value={value}>
      {children}
    </HackathonDataContext.Provider>
  );
}

// -----------------------------
// Hook
// -----------------------------

export const useHackathonData = () => {
  const context = useContext(HackathonDataContext);
  if (!context) {
    throw new Error(
      'useHackathonData must be used within a HackathonDataProvider'
    );
  }
  return context;
};
