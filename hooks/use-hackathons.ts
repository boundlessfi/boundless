'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createDraft,
  updateDraft,
  getDraft,
  getDrafts,
  publishHackathon,
  updateHackathon,
  getHackathon,
  getHackathons,
  type Hackathon,
  type HackathonDraft,
  type CreateDraftRequest,
  type UpdateDraftRequest,
  type PublishHackathonRequest,
  type UpdateHackathonRequest,
  type HackathonCategory,
} from '@/lib/api/hackathons';
import { useOrganization } from '@/lib/providers/OrganizationProvider';

export interface UseHackathonsOptions {
  organizationId?: string;
  autoFetch?: boolean;
  initialPage?: number;
  pageSize?: number;
  filters?: {
    status?: 'published' | 'ongoing' | 'completed' | 'cancelled';
    category?: HackathonCategory;
    search?: string;
  };
}

export interface UseHackathonsReturn {
  // Published Hackathons
  hackathons: Hackathon[];
  hackathonsLoading: boolean;
  hackathonsError: string | null;
  hackathonsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Drafts
  drafts: HackathonDraft[];
  draftsLoading: boolean;
  draftsError: string | null;
  draftsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Current Hackathon/Draft
  currentHackathon: Hackathon | null;
  currentDraft: HackathonDraft | null;
  currentLoading: boolean;
  currentError: string | null;

  // Actions - Drafts
  createDraftAction: (data: CreateDraftRequest) => Promise<HackathonDraft>;
  updateDraftAction: (
    draftId: string,
    data: UpdateDraftRequest
  ) => Promise<HackathonDraft>;
  fetchDraft: (draftId: string) => Promise<void>;
  fetchDrafts: (page?: number, limit?: number) => Promise<void>;

  // Actions - Published Hackathons
  publishHackathonAction: (data: PublishHackathonRequest) => Promise<Hackathon>;
  updateHackathonAction: (
    hackathonId: string,
    data: UpdateHackathonRequest
  ) => Promise<Hackathon>;
  fetchHackathon: (hackathonId: string) => Promise<void>;
  fetchHackathons: (
    page?: number,
    limit?: number,
    filters?: UseHackathonsOptions['filters']
  ) => Promise<void>;

  // Utility
  refetchAll: () => Promise<void>;
  setCurrentHackathon: (hackathon: Hackathon | null) => void;
  setCurrentDraft: (draft: HackathonDraft | null) => void;
  organizationId: string | null;
}

export function useHackathons(
  options: UseHackathonsOptions = {}
): UseHackathonsReturn {
  const {
    organizationId: providedOrgId,
    autoFetch = true,
    initialPage = 1,
    pageSize = 10,
    filters: initialFilters = {},
  } = options;

  // Get organizationId from context if not provided
  const { activeOrgId } = useOrganization();
  const organizationId = providedOrgId || activeOrgId || null;

  // Published Hackathons State
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(false);
  const [hackathonsError, setHackathonsError] = useState<string | null>(null);
  const [hackathonsPagination, setHackathonsPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: pageSize,
    hasNext: false,
    hasPrev: false,
  });

  // Drafts State
  const [drafts, setDrafts] = useState<HackathonDraft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [draftsPagination, setDraftsPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: pageSize,
    hasNext: false,
    hasPrev: false,
  });

  // Current Hackathon/Draft State
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(
    null
  );
  const [currentDraft, setCurrentDraft] = useState<HackathonDraft | null>(null);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);

  // Refs to prevent duplicate fetches
  const isFetchingHackathonsRef = useRef(false);
  const isFetchingDraftsRef = useRef(false);
  const isFetchingCurrentRef = useRef(false);

  // Refs to track current page values (to avoid closure issues)
  const hackathonsPageRef = useRef(initialPage);
  const draftsPageRef = useRef(initialPage);

  // Fetch Published Hackathons
  const fetchHackathons = useCallback(
    async (
      page?: number,
      limit?: number,
      filters?: UseHackathonsOptions['filters']
    ) => {
      if (!organizationId) {
        setHackathonsError('Organization ID is required');
        return;
      }

      if (isFetchingHackathonsRef.current) return;

      isFetchingHackathonsRef.current = true;
      setHackathonsLoading(true);
      setHackathonsError(null);

      try {
        // Use ref to get current page (always up-to-date)
        const currentPage = page ?? hackathonsPageRef.current;
        const response = await getHackathons(
          organizationId,
          currentPage,
          limit ?? pageSize,
          filters ?? initialFilters
        );

        setHackathons(response.data);
        setHackathonsPagination(response.pagination);
        // Update ref immediately
        hackathonsPageRef.current = response.pagination.currentPage;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch hackathons';
        setHackathonsError(errorMessage);
      } finally {
        setHackathonsLoading(false);
        isFetchingHackathonsRef.current = false;
      }
    },
    [organizationId, pageSize, initialFilters]
  );

  // Fetch Drafts
  const fetchDrafts = useCallback(
    async (page?: number, limit?: number) => {
      if (!organizationId) {
        setDraftsError('Organization ID is required');
        return;
      }

      if (isFetchingDraftsRef.current) return;

      isFetchingDraftsRef.current = true;
      setDraftsLoading(true);
      setDraftsError(null);

      try {
        // Use ref to get current page (always up-to-date)
        const currentPage = page ?? draftsPageRef.current;
        const response = await getDrafts(
          organizationId,
          currentPage,
          limit ?? pageSize
        );

        setDrafts(response.data);
        setDraftsPagination(response.pagination);
        // Update ref immediately
        draftsPageRef.current = response.pagination.currentPage;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch drafts';
        setDraftsError(errorMessage);
      } finally {
        setDraftsLoading(false);
        isFetchingDraftsRef.current = false;
      }
    },
    [organizationId, pageSize]
  );

  // Fetch Single Hackathon
  const fetchHackathon = useCallback(
    async (hackathonId: string) => {
      if (!organizationId) {
        setCurrentError('Organization ID is required');
        return;
      }

      if (isFetchingCurrentRef.current) return;

      isFetchingCurrentRef.current = true;
      setCurrentLoading(true);
      setCurrentError(null);

      try {
        const response = await getHackathon(organizationId, hackathonId);
        setCurrentHackathon(response.data);
        setCurrentDraft(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch hackathon';
        setCurrentError(errorMessage);
      } finally {
        setCurrentLoading(false);
        isFetchingCurrentRef.current = false;
      }
    },
    [organizationId]
  );

  // Fetch Single Draft
  const fetchDraft = useCallback(
    async (draftId: string) => {
      if (!organizationId) {
        setCurrentError('Organization ID is required');
        return;
      }

      if (isFetchingCurrentRef.current) return;

      isFetchingCurrentRef.current = true;
      setCurrentLoading(true);
      setCurrentError(null);

      try {
        const response = await getDraft(organizationId, draftId);
        setCurrentDraft(response.data);
        setCurrentHackathon(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch draft';
        setCurrentError(errorMessage);
      } finally {
        setCurrentLoading(false);
        isFetchingCurrentRef.current = false;
      }
    },
    [organizationId]
  );

  // Create Draft
  const createDraftAction = useCallback(
    async (data: CreateDraftRequest): Promise<HackathonDraft> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      setDraftsLoading(true);
      setDraftsError(null);

      try {
        const response = await createDraft(organizationId, data);
        setDrafts(prev => [response.data, ...prev]);
        return response.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create draft';
        setDraftsError(errorMessage);
        throw error;
      } finally {
        setDraftsLoading(false);
      }
    },
    [organizationId]
  );

  // Update Draft
  const updateDraftAction = useCallback(
    async (
      draftId: string,
      data: UpdateDraftRequest
    ): Promise<HackathonDraft> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      setDraftsLoading(true);
      setDraftsError(null);

      try {
        const response = await updateDraft(organizationId, draftId, data);
        setDrafts(prev =>
          prev.map(draft => (draft._id === draftId ? response.data : draft))
        );
        if (currentDraft?._id === draftId) {
          setCurrentDraft(response.data);
        }
        return response.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update draft';
        setDraftsError(errorMessage);
        throw error;
      } finally {
        setDraftsLoading(false);
      }
    },
    [organizationId, currentDraft]
  );

  // Publish Hackathon
  const publishHackathonAction = useCallback(
    async (data: PublishHackathonRequest): Promise<Hackathon> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      setHackathonsLoading(true);
      setHackathonsError(null);

      try {
        const response = await publishHackathon(organizationId, data);
        setHackathons(prev => [response.data, ...prev]);
        setCurrentHackathon(response.data);
        // Optionally remove from drafts if it was a draft
        if (currentDraft) {
          setDrafts(prev => prev.filter(d => d._id !== currentDraft._id));
          setCurrentDraft(null);
        }
        return response.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to publish hackathon';
        setHackathonsError(errorMessage);
        throw error;
      } finally {
        setHackathonsLoading(false);
      }
    },
    [organizationId, currentDraft]
  );

  // Update Hackathon
  const updateHackathonAction = useCallback(
    async (
      hackathonId: string,
      data: UpdateHackathonRequest
    ): Promise<Hackathon> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      setHackathonsLoading(true);
      setHackathonsError(null);

      try {
        const response = await updateHackathon(
          organizationId,
          hackathonId,
          data
        );
        setHackathons(prev =>
          prev.map(hackathon =>
            hackathon._id === hackathonId ? response.data : hackathon
          )
        );
        if (currentHackathon?._id === hackathonId) {
          setCurrentHackathon(response.data);
        }
        return response.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update hackathon';
        setHackathonsError(errorMessage);
        throw error;
      } finally {
        setHackathonsLoading(false);
      }
    },
    [organizationId, currentHackathon]
  );

  // Refetch All
  const refetchAll = useCallback(async () => {
    if (!organizationId) return;

    await Promise.all([fetchHackathons(), fetchDrafts()]);
  }, [organizationId, fetchHackathons, fetchDrafts]);

  // Auto-fetch on mount and when organizationId changes
  useEffect(() => {
    if (autoFetch && organizationId) {
      fetchHackathons();
      fetchDrafts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, organizationId]); // Only depend on organizationId for initial fetch

  return {
    // Published Hackathons
    hackathons,
    hackathonsLoading,
    hackathonsError,
    hackathonsPagination,

    // Drafts
    drafts,
    draftsLoading,
    draftsError,
    draftsPagination,

    // Current
    currentHackathon,
    currentDraft,
    currentLoading,
    currentError,

    // Actions - Drafts
    createDraftAction,
    updateDraftAction,
    fetchDraft,
    fetchDrafts,

    // Actions - Published
    publishHackathonAction,
    updateHackathonAction,
    fetchHackathon,
    fetchHackathons,

    // Utility
    refetchAll,
    setCurrentHackathon,
    setCurrentDraft,
    organizationId,
  };
}
