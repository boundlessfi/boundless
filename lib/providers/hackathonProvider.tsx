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
import {
  Discussion,
  Participant,
  SubmissionCardProps,
  Hackathon,
} from '@/types/hackathon';
import {
  getHackathons,
  getHackathon,
  getHackathonParticipants,
  getHackathonSubmissions,
} from '@/lib/api/hackathon';

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
  type: 'link';
  size: string;
  url: string;
  uploadDate: string;
  description: string;
}

interface HackathonDataContextType {
  hackathons: Hackathon[];
  featuredHackathons: Hackathon[];
  ongoingHackathons: Hackathon[];
  upcomingHackathons: Hackathon[];
  pastHackathons: Hackathon[];

  currentHackathon: Hackathon | null;
  discussions: Discussion[];
  participants: Participant[];
  submissions: SubmissionCardProps[];
  content: string;
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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionCardProps[]>([]);
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
  // Fetch participants
  // --------------------------------
  const fetchParticipants = useCallback(async (slug: string) => {
    try {
      const response = await getHackathonParticipants(slug, { limit: 50 });
      if (response.success && response.data) {
        setParticipants(response.data.participants);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // --------------------------------
  // Fetch submissions
  // --------------------------------
  const fetchSubmissions = useCallback(async (slug: string) => {
    try {
      const response = await getHackathonSubmissions(slug, { limit: 50 });
      if (response.success && response.data) {
        setSubmissions(response.data.submissions);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // --------------------------------
  // Computed lists
  // --------------------------------
  const featuredHackathons = React.useMemo(
    () => hackathons.filter(h => h.featured),
    [hackathons]
  );

  const ongoingHackathons = React.useMemo(
    () => hackathons.filter(h => h.status === 'ongoing'),
    [hackathons]
  );

  const upcomingHackathons = React.useMemo(
    () => hackathons.filter(h => h.status === 'upcoming'),
    [hackathons]
  );

  const pastHackathons = React.useMemo(
    () => hackathons.filter(h => h.status === 'ended'),
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
        await Promise.all([fetchParticipants(slug), fetchSubmissions(slug)]);
      }
    },
    [
      currentHackathonSlug,
      fetchHackathonBySlug,
      fetchParticipants,
      fetchSubmissions,
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

  const mockDiscussions: Discussion[] = [
    {
      _id: '1',
      userId: {
        _id: 'user1',
        profile: {
          firstName: 'Sarah',
          lastName: 'Chen',
          username: 'sarahc',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      },
      projectId: '',
      content:
        'Excited to participate in this hackathon! Are there any team formation channels?',
      status: 'active',
      createdAt: '2025-01-10T10:30:00Z',
      updatedAt: '2025-01-10T10:30:00Z',
      totalReactions: 12,
      reactionCounts: { LIKE: 12, DISLIKE: 0, HELPFUL: 0 },
      editHistory: [],
      replyCount: 1,
      isSpam: false,
      reports: [],
      replies: [
        {
          _id: '1-1',
          userId: {
            _id: 'user2',
            profile: {
              firstName: 'Alex',
              lastName: 'Rodriguez',
              username: 'alexr',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            },
          },
          projectId: '',
          content:
            "Yes! Check out the Discord server, there's a #team-formation channel.",
          status: 'active',
          createdAt: '2025-01-10T11:00:00Z',
          updatedAt: '2025-01-10T11:00:00Z',
          totalReactions: 5,
          reactionCounts: { LIKE: 5, DISLIKE: 0, HELPFUL: 0 },
          editHistory: [],
          replyCount: 0,
          isSpam: false,
          reports: [],
          replies: [],
          parentCommentId: '1',
        },
      ],
    },
  ];

  const mockContent = `# ${
    currentHackathon?.title || 'Hackathon'
  }\n\n## 🌐 Hackathon Theme\n${
    currentHackathon?.subtitle || 'Build innovative solutions'
  }\n\n## Challenge Description\n${
    currentHackathon?.description ||
    'Create an innovative project that solves real-world problems.'
  }`;

  const mockTimelineEvents: TimelineEvent[] = currentHackathon
    ? [
        {
          event: 'Hackathon Launch',
          date: new Date(currentHackathon.startDate).toLocaleDateString(),
        },
        {
          event: 'Submission Deadline',
          date: new Date(currentHackathon.deadline).toLocaleDateString(),
        },
        {
          event: 'Winners Announced',
          date: new Date(currentHackathon.endDate).toLocaleDateString(),
        },
      ]
    : [];

  const mockPrizes: Prize[] = currentHackathon
    ? [
        {
          title: 'Grand Prize',
          rank: '1 winner',
          prize: `${currentHackathon.totalPrizePool} in prizes`,
          icon: '⭐',
          details: [
            `Prize: ${currentHackathon.totalPrizePool}`,
            'Premium Swag Box',
          ],
        },
      ]
    : [];

  const mockResources: ResourceItem[] = currentHackathon?.resources
    ? currentHackathon.resources.map((resource, index) => ({
        id: index + 1,
        title: `Resource ${index + 1}`,
        type: 'link',
        size: 'N/A',
        url: resource,
        uploadDate: new Date().toISOString(),
        description: 'Additional resource for participants',
      }))
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
    featuredHackathons,
    ongoingHackathons,
    upcomingHackathons,
    pastHackathons,

    currentHackathon,
    discussions: mockDiscussions,
    participants,
    submissions,
    content: mockContent,
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
