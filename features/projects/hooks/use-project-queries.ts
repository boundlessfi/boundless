'use client';

/**
 * React Query hooks for the /api/projects/* endpoints.
 *
 * Pattern mirrors `hooks/hackathon/use-hackathon-queries.ts`:
 *  - Centralised query-key factory (`projectKeys`)
 *  - Query hooks (reads) with sensible staleTime defaults
 *  - Mutation hooks (writes) that auto-invalidate related cache entries
 *
 * Import what you need — everything is tree-shakeable.
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createProjectDraft,
  updateProjectDraft,
  listPublicProjects,
  listPublicProjectsPaginated,
  searchProjects,
  listFeaturedProjects,
  publishProject,
  getMyProjects,
  getPublicProjectBySlug,
  getMyProjectById,
  deleteProject,
  submitProjectEdit,
} from '@/features/projects/api';
import type {
  Project,
  ProjectDraftPayload,
  PublishProjectRequest,
  GetMyProjectsParams,
  ProjectApiResponse,
  SubmitProjectEditRequest,
  ProjectEdit,
  PublicProjectsQuery,
  PaginatedProjectsResponse,
} from '@/features/projects/types';

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralised so any component can invalidate the right cache entry.

export const projectKeys = {
  /** Root — invalidate to bust *all* project-related caches. */
  all: ['projects'] as const,

  /** Public project list. */
  list: () => ['projects', 'list'] as const,

  /** Public project list (paginated + filtered). */
  publicList: (filters?: Omit<PublicProjectsQuery, 'page'>) =>
    ['projects', 'public-list', filters] as const,

  /** Full-text search results. */
  search: (query: string) => ['projects', 'search', query] as const,

  /** Featured / curated projects. */
  featured: () => ['projects', 'featured'] as const,

  /** Authenticated user's own projects. */
  mine: (params?: GetMyProjectsParams) => ['projects', 'me', params] as const,

  /** Single project by ID (owner view). */
  myProject: (id: string) => ['projects', 'me', id] as const,

  /** Public project detail by slug. */
  detail: (slug: string) => ['projects', 'detail', slug] as const,
} as const;

// ─── Query Hooks (reads) ──────────────────────────────────────────────────────

/**
 * GET /api/projects
 * List all public projects (PRD products directory).
 */
export function usePublicProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.list(),
    queryFn: listPublicProjects,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * GET /api/projects (infinite scroll)
 * Paginated public projects with filtering, sorting, and search.
 * Uses React Query's useInfiniteQuery for seamless load-more.
 */
export function useInfinitePublicProjects(
  filters: Omit<PublicProjectsQuery, 'page'> = {},
  pageSize = 12
) {
  return useInfiniteQuery<PaginatedProjectsResponse, Error>({
    queryKey: projectKeys.publicList(filters),
    queryFn: ({ pageParam }) =>
      listPublicProjectsPaginated({
        ...filters,
        page: pageParam as number,
        limit: pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * GET /api/projects/search?search=<query>
 * Full-text search over public projects.
 * Only fires when `query` is non-empty.
 */
export function useProjectSearch(query: string) {
  return useQuery<Project[]>({
    queryKey: projectKeys.search(query),
    queryFn: () => searchProjects(query),
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds — search results can go stale quickly
  });
}

/**
 * GET /api/projects/featured
 * List featured / curated projects.
 */
export function useFeaturedProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.featured(),
    queryFn: listFeaturedProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes — featured list changes infrequently
  });
}

/**
 * GET /api/projects/me
 * List the authenticated user's own projects.
 * Pass `enabled: false` to skip fetching until auth is confirmed.
 */
export function useMyProjects(params?: GetMyProjectsParams, enabled = true) {
  return useQuery<Project[]>({
    queryKey: projectKeys.mine(params),
    queryFn: async () => {
      const res = await getMyProjects(params);
      return res.data;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * GET /api/projects/me/{id}
 * Get the authenticated user's own project by ID.
 */
export function useMyProject(id: string, enabled = true) {
  return useQuery<Project>({
    queryKey: projectKeys.myProject(id),
    queryFn: () => getMyProjectById(id),
    enabled: !!id && enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * GET /api/projects/{slug}
 * Get a single public project by slug.
 * Optionally seed with `initialData` from a Server Component to avoid
 * a client-side loading state on first render (same pattern as hackathon).
 */
export function useProject(slug: string, initialData?: Project) {
  return useQuery<Project>({
    queryKey: projectKeys.detail(slug),
    queryFn: () => getPublicProjectBySlug(slug),
    initialData,
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

// ─── Mutation Hooks (writes) ──────────────────────────────────────────────────

/**
 * POST /api/projects/drafts
 * Create a new project draft.
 * On success, invalidates the user's project list so it stays up-to-date.
 */
export function useCreateProjectDraft() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, ProjectDraftPayload>({
    mutationFn: createProjectDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.mine() });
    },
  });
}

/**
 * PATCH /api/projects/{id}/draft
 * Autosave an in-progress draft.
 * Optimistically updates the my-project cache if the project is already there.
 * Use this inside the stepped creation form for debounced autosave.
 */
export function useUpdateProjectDraft(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, Partial<ProjectDraftPayload>>({
    mutationFn: data => updateProjectDraft(id, data),
    onSuccess: updatedProject => {
      // Keep the single-project cache warm with the latest server response.
      queryClient.setQueryData<Project>(
        projectKeys.myProject(id),
        updatedProject
      );
      // Also nudge the list so any title/status change is reflected.
      queryClient.invalidateQueries({ queryKey: projectKeys.mine() });
    },
  });
}

/**
 * POST /api/projects/{id}/publish
 * Publish / submit a draft for review.
 * Invalidates all project caches: mine list, single entry, public list.
 */
export function usePublishProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, PublishProjectRequest>({
    mutationFn: payload => publishProject(id, payload),
    onSuccess: publishedProject => {
      // Update the owner view cache.
      queryClient.setQueryData<Project>(
        projectKeys.myProject(id),
        publishedProject
      );
      // Bust broader caches — project now appears in public/featured lists.
      queryClient.invalidateQueries({ queryKey: projectKeys.mine() });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.invalidateQueries({ queryKey: projectKeys.featured() });
      // Also bust the public slug view if we have the slug.
      if (publishedProject.slug) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(publishedProject.slug),
        });
      }
    },
  });
}

/**
 * DELETE /api/projects/{id}
 * Delete a project draft.
 * Invalidates the user's project list on success.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.mine() });
    },
  });
}

/**
 * POST /api/projects/{id}/edits
 * Submit an edit for a published (LIVE) project.
 * MINOR edits are auto-approved; MAJOR edits put the project into REVIEWING.
 */
export function useSubmitProjectEdit(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectEdit, Error, SubmitProjectEditRequest>({
    mutationFn: data => submitProjectEdit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.myProject(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.mine() });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Programmatically invalidate all project-related caches.
 * Useful after bulk actions or when navigating back to a listing page.
 */
export function useRefreshProjects() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: projectKeys.all });
}
