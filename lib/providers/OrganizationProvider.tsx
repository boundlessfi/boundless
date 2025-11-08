'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import { Logger } from '@/lib/logger';
const logger = new Logger();
logger.setMinLevel('info');
import {
  OrganizationSummary,
  OrganizationContextValue,
  OrganizationProviderProps,
  OrganizationContextState,
} from './organization-types';
import { Organization } from '../api/types';
import { getMe } from '../api/auth';
import {
  getOrganization,
  createOrganization,
  updateOrganizationProfile,
  updateOrganizationLinks,
  updateOrganizationMembers,
  sendOrganizationInvite,
  removeOrganizationMember,
  updateOrganizationHackathons,
  updateOrganizationGrants,
  deleteOrganization,
  assignOrganizationRole,
  transferOrganizationOwnership,
  getOrganizationPermissions as fetchOrganizationPermissions,
  updateOrganizationPermissions as updateOrganizationPermissionsAPI,
  resetOrganizationPermissions as resetOrganizationPermissionsAPI,
} from '../api/organization';
import { getProfileCompletionStatus as getOrgProfileCompletionStatus } from '../organization-utils';
import type {
  GetPermissionsResponse,
  RawOrganizationPermissions,
} from '../api/organization';
import { OrganizationPermissions } from '@/types/organization-permission';

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined
);

const STORAGE_KEYS = {
  ACTIVE_ORG_ID: 'boundless_active_org_id',
  ORGANIZATIONS_CACHE: 'boundless_organizations_cache',
  LAST_UPDATED: 'boundless_orgs_last_updated',
} as const;

const CACHE_DURATION = 5 * 60 * 1000;

type OrganizationAction =
  | {
      type: 'SET_LOADING';
      payload: {
        isLoading: boolean;
        isLoadingOrganizations?: boolean;
        isLoadingActiveOrg?: boolean;
      };
    }
  | {
      type: 'SET_ERROR';
      payload: {
        error: string | null;
        organizationsError?: string | null;
        activeOrgError?: string | null;
      };
    }
  | { type: 'SET_ORGANIZATIONS'; payload: OrganizationSummary[] }
  | {
      type: 'SET_ACTIVE_ORG';
      payload: { org: Organization | null; orgId: string | null };
    }
  | { type: 'UPDATE_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_ORGANIZATION'; payload: OrganizationSummary }
  | { type: 'REMOVE_ORGANIZATION'; payload: string }
  | { type: 'SET_LAST_UPDATED'; payload: number }
  | { type: 'INCREMENT_REFRESH_COUNT' }
  | { type: 'RESET' };

const initialState: OrganizationContextState = {
  activeOrg: null,
  organizations: [],
  activeOrgId: null,
  isLoading: false,
  isLoadingOrganizations: false,
  isLoadingActiveOrg: false,
  error: null,
  organizationsError: null,
  activeOrgError: null,
  lastUpdated: 0,
  refreshCount: 0,
};

export function mapRawToResolvedPermissions(
  raw: RawOrganizationPermissions
): OrganizationPermissions {
  return {
    canEditProfile: raw['create_edit_profile']?.admin ?? false,
    canCreateProfile: raw['create_edit_profile']?.owner ?? false,
    canManageHackathons: raw['manage_hackathons_grants']?.admin ?? false,
    canPublishHackathons: raw['publish_hackathons']?.owner ?? false,
    canViewAnalytics: raw['view_analytics']?.member ?? false,
    canInviteMembers: raw['invite_remove_members']?.admin ?? false,
    canRemoveMembers: raw['invite_remove_members']?.admin ?? false,
    canAssignRoles: raw['assign_roles']?.owner ?? false,
    canPostAnnouncements: raw['post_announcements']?.admin ?? false,
    canComment: raw['comment_discussions']?.member ?? false,
    canAccessSubmissions: raw['access_submissions']?.member ?? false,
    canDeleteOrganization: raw['delete_organization']?.owner ?? false,
  };
}

export function mapResolvedToRawPermissions(
  resolved: OrganizationPermissions
): RawOrganizationPermissions {
  return {
    create_edit_profile: {
      owner: true, // Owner always has this permission
      admin: resolved.canEditProfile,
      member: false,
    },
    manage_hackathons_grants: {
      owner: true, // Owner always has this permission
      admin: resolved.canManageHackathons,
      member: false,
    },
    publish_hackathons: {
      owner: true, // Owner always has this permission
      admin: false,
      member: false,
    },
    view_analytics: {
      owner: true, // Owner always has this permission
      admin: true, // Admin always has view access
      member: resolved.canViewAnalytics,
    },
    invite_remove_members: {
      owner: true, // Owner always has this permission
      admin: resolved.canInviteMembers || resolved.canRemoveMembers,
      member: false,
    },
    assign_roles: {
      owner: true, // Owner always has this permission
      admin: false,
      member: false,
    },
    post_announcements: {
      owner: true, // Owner always has this permission
      admin: resolved.canPostAnnouncements,
      member: false,
    },
    comment_discussions: {
      owner: true, // Owner always has this permission
      admin: true, // Admin always can comment
      member: resolved.canComment,
    },
    access_submissions: {
      owner: true, // Owner always has this permission
      admin: true, // Admin always has access
      member: resolved.canAccessSubmissions,
    },
    delete_organization: {
      owner: true, // Owner always has this permission
      admin: false,
      member: false,
    },
  };
}

function organizationReducer(
  state: OrganizationContextState,
  action: OrganizationAction
): OrganizationContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        isLoadingOrganizations:
          action.payload.isLoadingOrganizations ?? state.isLoadingOrganizations,
        isLoadingActiveOrg:
          action.payload.isLoadingActiveOrg ?? state.isLoadingActiveOrg,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        organizationsError:
          action.payload.organizationsError ?? state.organizationsError,
        activeOrgError: action.payload.activeOrgError ?? state.activeOrgError,
      };

    case 'SET_ORGANIZATIONS':
      return {
        ...state,
        organizations: action.payload,
        organizationsError: null,
      };

    case 'SET_ACTIVE_ORG':
      return {
        ...state,
        activeOrg: action.payload.org,
        activeOrgId: action.payload.orgId,
        activeOrgError: null,
      };

    case 'UPDATE_ORGANIZATION':
      return {
        ...state,
        activeOrg:
          state.activeOrgId === action.payload._id
            ? action.payload
            : state.activeOrg,
        organizations: state.organizations.map(org =>
          org._id === action.payload._id
            ? {
                ...org,
                name: action.payload.name,
                logo: action.payload.logo,
                isProfileComplete: action.payload.isProfileComplete,
              }
            : org
        ),
      };

    case 'ADD_ORGANIZATION':
      return {
        ...state,
        organizations: [...state.organizations, action.payload],
      };

    case 'REMOVE_ORGANIZATION':
      return {
        ...state,
        organizations: state.organizations.filter(
          org => org._id !== action.payload
        ),
        activeOrg:
          state.activeOrgId === action.payload ? null : state.activeOrg,
        activeOrgId:
          state.activeOrgId === action.payload ? null : state.activeOrgId,
      };

    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };

    case 'INCREMENT_REFRESH_COUNT':
      return {
        ...state,
        refreshCount: state.refreshCount + 1,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function OrganizationProvider({
  children,
  initialOrgId,
  autoRefresh = true,
  refreshInterval = 30000,
}: OrganizationProviderProps) {
  const [state, dispatch] = useReducer(organizationReducer, initialState);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const isFetchingOrganizationsRef = useRef(false);
  const isFetchingActiveOrgRef = useRef(false);
  const fetchOrganizationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchActiveOrgTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setActiveOrgRef = useRef<((orgId: string) => void) | undefined>(
    undefined
  );
  const refreshOrganizationRef = useRef<(() => Promise<void>) | undefined>(
    undefined
  );

  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedOrgs = localStorage.getItem(
          STORAGE_KEYS.ORGANIZATIONS_CACHE
        );
        const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
        const activeOrgId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);

        if (cachedOrgs && lastUpdated) {
          const cacheAge = Date.now() - parseInt(lastUpdated);
          if (cacheAge < CACHE_DURATION) {
            const organizations = JSON.parse(cachedOrgs);
            dispatch({ type: 'SET_ORGANIZATIONS', payload: organizations });

            if (activeOrgId && !isInitializedRef.current) {
              setActiveOrgRef.current?.(activeOrgId);
            }
          }
        }
      } catch (error) {
        logger.error({ eventType: 'org.cache.load_error', error });
      }
    };

    loadCachedData();
  }, []);

  useEffect(() => {
    if (autoRefresh && state.activeOrgId) {
      const startAutoRefresh = () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = setTimeout(() => {
          refreshOrganizationRef.current?.();
          startAutoRefresh();
        }, refreshInterval);
      };

      startAutoRefresh();
    }

    // snapshot refs for cleanup to avoid stale ref warnings
    const refreshTimeoutSnapshot = refreshTimeoutRef.current;
    const fetchOrganizationsTimeoutSnapshot =
      fetchOrganizationsTimeoutRef.current;
    const fetchActiveOrgTimeoutSnapshot = fetchActiveOrgTimeoutRef.current;

    return () => {
      if (refreshTimeoutSnapshot) {
        clearTimeout(refreshTimeoutSnapshot);
      }
      if (fetchOrganizationsTimeoutSnapshot) {
        clearTimeout(fetchOrganizationsTimeoutSnapshot);
      }
      if (fetchActiveOrgTimeoutSnapshot) {
        clearTimeout(fetchActiveOrgTimeoutSnapshot);
      }
    };
  }, [autoRefresh, refreshInterval, state.activeOrgId]);

  const fetchOrganizations = useCallback(async () => {
    logger.info({ eventType: 'org.fetchOrganizations.called' });

    if (isFetchingOrganizationsRef.current) {
      logger.warn({
        eventType: 'org.fetchOrganizations.skipped',
        reason: 'in_progress',
      });
      return;
    }

    isFetchingOrganizationsRef.current = true;
    logger.info({ eventType: 'org.fetchOrganizations.start' });

    try {
      dispatch({
        type: 'SET_LOADING',
        payload: { isLoading: false, isLoadingOrganizations: true },
      });
      dispatch({
        type: 'SET_ERROR',
        payload: { error: null, organizationsError: null },
      });

      const response = await getMe();
      logger.info({ eventType: 'org.fetchOrganizations.getMe_success' });

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from getMe API');
      }

      const organizations = response.organizations || [];
      logger.info({
        eventType: 'org.fetchOrganizations.organizations_loaded',
        count: Array.isArray(organizations) ? organizations.length : 0,
      });

      if (!Array.isArray(organizations)) {
        logger.warn({
          eventType: 'org.fetchOrganizations.invalid_organizations_type',
        });
        dispatch({ type: 'SET_ORGANIZATIONS', payload: [] });
        return;
      }

      type OrgLike = Partial<Organization> & { id?: string } & Record<
          string,
          unknown
        >;
      const orgs = organizations as OrgLike[];
      const organizationSummaries: OrganizationSummary[] = orgs
        .filter(org => org && typeof org === 'object' && (org._id || org.id))
        .map(org => ({
          _id: (org._id as string) ?? (org.id as string),
          name: (org.name as string) || 'Unnamed Organization',
          logo: (org.avatar as string) || '',
          tagline: (org.tagline as string) || '',
          isProfileComplete: Boolean(org.isProfileComplete),
          role: org.owner === response.email ? 'owner' : 'member',
          memberCount: Array.isArray(org.members) ? org.members.length : 0,
          hackathonCount: Array.isArray(org.hackathons)
            ? org.hackathons.length
            : 0,
          grantCount: Array.isArray(org.grants) ? org.grants.length : 0,
          createdAt: (org.createdAt as string) || new Date().toISOString(),
        }));

      logger.info({
        eventType: 'org.fetchOrganizations.transformed',
        count: organizationSummaries.length,
      });
      dispatch({ type: 'SET_ORGANIZATIONS', payload: organizationSummaries });
      dispatch({ type: 'SET_LAST_UPDATED', payload: Date.now() });

      localStorage.setItem(
        STORAGE_KEYS.ORGANIZATIONS_CACHE,
        JSON.stringify(organizationSummaries)
      );
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    } catch (error) {
      logger.error({ eventType: 'org.fetchOrganizations.error', error });

      let errorMessage = 'Failed to fetch organizations';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if (
          'response' in (error as Record<string, unknown>) &&
          (error as Record<string, unknown>).response
        ) {
          const apiError = (
            error as {
              response?: {
                status?: number;
                statusText?: string;
                data?: { message?: string };
              };
            }
          ).response;
          if (apiError?.data?.message) {
            errorMessage = apiError.data.message;
          } else if (apiError?.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (apiError?.status === 403) {
            errorMessage =
              'Access denied. You do not have permission to view organizations.';
          } else if ((apiError?.status ?? 0) >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `API Error: ${apiError?.status} ${apiError?.statusText || 'Unknown error'}`;
          }
        } else if ('message' in (error as Record<string, unknown>)) {
          errorMessage =
            (error as { message?: string }).message || errorMessage;
        }
      }

      dispatch({
        type: 'SET_ERROR',
        payload: { error: null, organizationsError: errorMessage },
      });

      if (process.env.NODE_ENV === 'development') {
        logger.warn({
          eventType: 'org.fetchOrganizations.dev_help',
          notes: [
            'endpoint missing',
            'unauthenticated',
            'response changed',
            'network issues',
          ],
        });
      }
    } finally {
      isFetchingOrganizationsRef.current = false;
      dispatch({
        type: 'SET_LOADING',
        payload: { isLoading: false, isLoadingOrganizations: false },
      });
    }
  }, []);

  const fetchActiveOrganization = useCallback(async (orgId: string) => {
    if (isFetchingActiveOrgRef.current) {
      logger.warn({
        eventType: 'org.fetchActiveOrganization.skipped',
        reason: 'in_progress',
      });
      return;
    }

    isFetchingActiveOrgRef.current = true;

    try {
      dispatch({
        type: 'SET_LOADING',
        payload: { isLoading: false, isLoadingActiveOrg: true },
      });
      dispatch({
        type: 'SET_ERROR',
        payload: { error: null, activeOrgError: null },
      });

      const response = await getOrganization(orgId);
      const organization = response.data;

      dispatch({
        type: 'SET_ACTIVE_ORG',
        payload: { org: organization, orgId },
      });
      dispatch({ type: 'SET_LAST_UPDATED', payload: Date.now() });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch organization';
      dispatch({
        type: 'SET_ERROR',
        payload: { error: null, activeOrgError: errorMessage },
      });
      logger.error({ eventType: 'org.fetchActiveOrganization.error', error });
    } finally {
      isFetchingActiveOrgRef.current = false;
      dispatch({
        type: 'SET_LOADING',
        payload: { isLoading: false, isLoadingActiveOrg: false },
      });
    }
  }, []);

  const setActiveOrg = useCallback(
    (orgId: string) => {
      const organization = state.organizations.find(org => org._id === orgId);
      if (!organization) {
        logger.info({ eventType: 'org.setActiveOrg.miss_then_fetch', orgId });

        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, orgId);

        fetchActiveOrganization(orgId);
        isInitializedRef.current = true;
        return;
      }

      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, orgId);

      fetchActiveOrganization(orgId);
      isInitializedRef.current = true;
    },
    [state.organizations, fetchActiveOrganization]
  );
  setActiveOrgRef.current = setActiveOrg;

  const refreshOrganization = useCallback(async () => {
    if (state.activeOrgId) {
      await fetchActiveOrganization(state.activeOrgId);
      dispatch({ type: 'INCREMENT_REFRESH_COUNT' });
    }
  }, [state.activeOrgId, fetchActiveOrganization]);
  refreshOrganizationRef.current = refreshOrganization;

  const debouncedFetchOrganizations = useCallback(() => {
    if (fetchOrganizationsTimeoutRef.current) {
      clearTimeout(fetchOrganizationsTimeoutRef.current);
    }

    fetchOrganizationsTimeoutRef.current = setTimeout(() => {
      fetchOrganizations();
    }, 300);
  }, [fetchOrganizations]);

  const refreshOrganizations = useCallback(async () => {
    debouncedFetchOrganizations();
    dispatch({ type: 'INCREMENT_REFRESH_COUNT' });
  }, [debouncedFetchOrganizations]);

  const refreshAll = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    try {
      await Promise.all([
        fetchOrganizations(),
        state.activeOrgId
          ? fetchActiveOrganization(state.activeOrgId)
          : Promise.resolve(),
      ]);
      dispatch({ type: 'INCREMENT_REFRESH_COUNT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [fetchOrganizations, fetchActiveOrganization, state.activeOrgId]);

  const createOrg = useCallback(
    async (data: {
      name: string;
      logo?: string;
      tagline?: string;
      about?: string;
      links?: {
        website?: string;
        x?: string;
        github?: string;
        others?: string;
      };
    }) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await createOrganization(data);
        const newOrg = response.data;

        const orgSummary: OrganizationSummary = {
          _id: newOrg._id,
          name: newOrg.name,
          logo: newOrg.logo,
          tagline: newOrg.tagline,
          isProfileComplete: newOrg.isProfileComplete,
          role: 'owner',
          memberCount: newOrg.members.length,
          hackathonCount: newOrg.hackathons.length,
          grantCount: newOrg.grants.length,
          createdAt: newOrg.createdAt,
        };

        dispatch({ type: 'ADD_ORGANIZATION', payload: orgSummary });
        dispatch({
          type: 'SET_ACTIVE_ORG',
          payload: { org: newOrg, orgId: newOrg._id },
        });

        return newOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create organization';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const updateOrg = useCallback(
    async (
      orgId: string,
      data: Partial<{
        name: string;
        logo?: string;
        tagline?: string;
        about?: string;
      }>
    ) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await updateOrganizationProfile(orgId, data);
        const updatedOrg = response.data;

        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });

        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update organization';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const updateOrgLinks = useCallback(
    async (
      orgId: string,
      links: { website?: string; x?: string; github?: string; others?: string }
    ) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await updateOrganizationLinks(orgId, links);
        const updatedOrg = response.data;

        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });

        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update organization links';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const updateOrgMembers = useCallback(
    async (orgId: string, members: string[]) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await updateOrganizationMembers(orgId, { members });
        const updatedOrg = response.data;
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });
        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update organization members';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const deleteOrg = useCallback(async (orgId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
      await deleteOrganization(orgId);

      dispatch({ type: 'REMOVE_ORGANIZATION', payload: orgId });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete organization';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, []);

  const inviteMembers = useCallback(
    async (orgId: string, emails: string[]) => {
      try {
        await sendOrganizationInvite(orgId, { emails });
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to invite members';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const removeMember = useCallback(
    async (orgId: string, email: string) => {
      try {
        await removeOrganizationMember(orgId, email);
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove member';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const addHackathon = useCallback(
    async (orgId: string, hackathonId: string) => {
      try {
        await updateOrganizationHackathons(orgId, {
          action: 'add',
          hackathonId,
        });
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add hackathon';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const removeHackathon = useCallback(
    async (orgId: string, hackathonId: string) => {
      try {
        await updateOrganizationHackathons(orgId, {
          action: 'remove',
          hackathonId,
        });
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove hackathon';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const addGrant = useCallback(
    async (orgId: string, grantId: string) => {
      try {
        await updateOrganizationGrants(orgId, { action: 'add', grantId });
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add grant';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const removeGrant = useCallback(
    async (orgId: string, grantId: string) => {
      try {
        await updateOrganizationGrants(orgId, { action: 'remove', grantId });
        await refreshOrganization();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove grant';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [refreshOrganization]
  );

  const getOrganizationById = useCallback(
    (orgId: string) => {
      return state.organizations.find(org => org._id === orgId);
    },
    [state.organizations]
  );

  const isOwner = useCallback(
    (orgId?: string) => {
      const targetOrgId = orgId || state.activeOrgId;
      if (!targetOrgId) return false;

      const org = getOrganizationById(targetOrgId);
      return org?.role === 'owner';
    },
    [state.activeOrgId, getOrganizationById]
  );

  const isMember = useCallback(
    (orgId?: string) => {
      const targetOrgId = orgId || state.activeOrgId;
      if (!targetOrgId) return false;

      const org = getOrganizationById(targetOrgId);
      return org?.role === 'member' || org?.role === 'owner';
    },
    [state.activeOrgId, getOrganizationById]
  );

  const canManage = useCallback(
    (orgId?: string) => {
      const targetOrgId = orgId || state.activeOrgId;
      if (!targetOrgId) return false;

      const org = getOrganizationById(targetOrgId);
      return org?.role === 'owner';
    },
    [state.activeOrgId, getOrganizationById]
  );

  const getProfileCompletionStatus = useCallback(
    (orgId?: string) => {
      const targetOrgId = orgId || state.activeOrgId;
      if (!targetOrgId || !state.activeOrg) {
        return { isComplete: false, percentage: 0, missingFields: [] };
      }

      const status = getOrgProfileCompletionStatus(state.activeOrg);
      return {
        isComplete: status.isComplete,
        percentage: status.completionPercentage,
        missingFields: status.missingFields,
      };
    },
    [state.activeOrgId, state.activeOrg]
  );

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      logger.info({ eventType: 'org.initialize.start' });

      fetchOrganizations()
        .then(() => {
          const savedOrgId =
            initialOrgId || localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);
          initialOrgId || localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);
          if (savedOrgId) {
            logger.info({
              eventType: 'org.initialize.set_active_after_fetch',
              orgId: savedOrgId,
            });
            setActiveOrgRef.current?.(savedOrgId);
          }
        })
        .catch(error => {
          logger.error({ eventType: 'org.initialize.fetch_error', error });
          const savedOrgId =
            localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID) || initialOrgId;
          if (savedOrgId) {
            setActiveOrgRef.current?.(savedOrgId);
          }
        });
    }
  }, [fetchOrganizations, initialOrgId]);

  const assignRole = useCallback(
    async (orgId: string, email: string, action: 'promote' | 'demote') => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await assignOrganizationRole(orgId, { action, email });
        const updatedOrg = response.data;
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });
        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to assign role';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const transferOwnership = useCallback(
    async (orgId: string, newOwnerEmail: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await transferOrganizationOwnership(
          orgId,
          newOwnerEmail
        );
        const updatedOrg = response.data;
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });
        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to transfer ownership';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    []
  );

  const getOrganizationPermissions = useCallback(
    async (
      orgId: string
    ): Promise<{
      permissions: OrganizationPermissions;
      isCustom: boolean;
      canEdit: boolean;
    }> => {
      try {
        const response: GetPermissionsResponse =
          await fetchOrganizationPermissions(orgId);
        const {
          permissions: rawPermissions,
          isCustom,
          canEdit,
        } = response.data;
        const permissions = mapRawToResolvedPermissions(rawPermissions);
        return { permissions, isCustom, canEdit };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get permissions';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      }
    },
    [dispatch]
  );

  const updateOrganizationPermissions = useCallback(
    async (
      orgId: string,
      permissions: OrganizationPermissions
    ): Promise<Organization> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

        const rawPermissions = mapResolvedToRawPermissions(permissions);
        const response = await updateOrganizationPermissionsAPI(orgId, {
          permissions: rawPermissions,
        });

        const updatedOrg = response.data;
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });
        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update permissions';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    [dispatch]
  );

  const resetOrganizationPermissions = useCallback(
    async (orgId: string): Promise<Organization> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        const response = await resetOrganizationPermissionsAPI(orgId);
        const updatedOrg = response.data;
        dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrg });
        return updatedOrg;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to reset permissions';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    [dispatch]
  );
  // Context value
  const contextValue: OrganizationContextValue = {
    ...state,
    setActiveOrg,
    refreshOrganization,
    refreshOrganizations,
    refreshAll,
    createOrganization: createOrg,
    updateOrganization: updateOrg,
    updateOrganizationLinks: updateOrgLinks,
    updateOrganizationMembers: updateOrgMembers,
    deleteOrganization: deleteOrg,
    inviteMember: inviteMembers,
    removeMember,
    addHackathon,
    removeHackathon,
    addGrant,
    removeGrant,
    getOrganizationById,
    isOwner,
    isMember,
    canManage,
    getProfileCompletionStatus,
    assignRole,
    transferOwnership,
    getOrganizationPermissions,
    updateOrganizationPermissions,
    resetOrganizationPermissions,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    );
  }
  return context;
}

export { OrganizationContext };
