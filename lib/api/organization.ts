import api from './api';
import { Logger } from '@/lib/logger';
import { ApiResponse, ErrorResponse, PaginatedResponse } from './types';

export interface OrganizationLinks {
  website: string;
  x: string;
  github: string;
  others: string;
}

export interface Organization {
  _id: string;
  name: string;
  logo: string;
  tagline: string;
  about: string;
  links: OrganizationLinks;
  members: string[];
  owner: string;
  hackathons: string[];
  grants: string[];
  isProfileComplete: boolean;
  pendingInvites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignRoleRequest {
  action: 'promote' | 'demote';
  email: string;
}

export interface AssignRoleRequest {
  action: 'promote' | 'demote';
  email: string;
}

export interface CreateOrganizationRequest {
  name: string;
  logo?: string;
  tagline?: string;
  about?: string;
  links?: Partial<OrganizationLinks>;
}

export interface CreateOrganizationResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface GetOrganizationResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface GetOrganizationsResponse
  extends PaginatedResponse<Organization> {
  success: true;
  data: Organization[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UpdateOrganizationProfileRequest {
  name?: string;
  logo?: string;
  tagline?: string;
  about?: string;
}

export interface UpdateOrganizationLinksRequest {
  website?: string;
  x?: string;
  github?: string;
  others?: string;
}

export interface UpdateOrganizationMembersRequest {
  members: string[];
}

export interface UpdateOrganizationResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface SendInviteRequest {
  emails: string[];
}

export interface SendInviteResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface AcceptInviteResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface UpdateHackathonsRequest {
  action: 'add' | 'remove';
  hackathonId: string;
}

export interface UpdateHackathonsResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface UpdateGrantsRequest {
  action: 'add' | 'remove';
  grantId: string;
}

export interface UpdateGrantsResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface DeleteOrganizationResponse extends ApiResponse {
  success: true;
  message: string;
}

export interface AssignRoleResponse extends ApiResponse<Organization> {
  success: true;
  data: Organization;
  message: string;
}

export interface RawOrganizationPermissions {
  [key: string]: {
    owner: boolean;
    admin: boolean;
    member: boolean;
  };
}

export interface GetPermissionsResponse
  extends ApiResponse<{
    permissions: RawOrganizationPermissions;
    isCustom: boolean;
    canEdit: boolean;
  }> {
  success: true;
  data: {
    permissions: RawOrganizationPermissions;
    isCustom: boolean;
    canEdit: boolean;
  };
  message: string;
}

export interface UpdatePermissionsRequest {
  permissions: RawOrganizationPermissions;
}

/**
 * Create a new organization
 */
export const createOrganization = async (
  data: CreateOrganizationRequest
): Promise<CreateOrganizationResponse> => {
  const res = await api.post('/organizations', data);
  return res.data;
};

/**
 * Get all organizations with pagination and filtering
 */
export const getOrganizations = async (
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    isProfileComplete?: boolean;
    owner?: string;
  }
): Promise<GetOrganizationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.search) {
    params.append('search', filters.search);
  }

  if (filters?.isProfileComplete !== undefined) {
    params.append('isProfileComplete', filters.isProfileComplete.toString());
  }

  if (filters?.owner) {
    params.append('owner', filters.owner);
  }

  const res = await api.get(`/organizations?${params.toString()}`);
  return res.data;
};

/**
 * Get a single organization by ID
 */
export const getOrganization = async (
  organizationId: string
): Promise<GetOrganizationResponse> => {
  const res = await api.get(`/organizations/${organizationId}`);
  return res.data;
};

/**
 * Update organization profile (name, logo, tagline, about)
 */
export const updateOrganizationProfile = async (
  organizationId: string,
  data: UpdateOrganizationProfileRequest
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/profile`, data);
  const logger = new Logger();
  logger.info({
    eventType: 'org.api.update_profile.success',
    orgId: organizationId,
  });
  return res.data;
};

/**
 * Update organization links
 */
export const updateOrganizationLinks = async (
  organizationId: string,
  data: UpdateOrganizationLinksRequest
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/links`, data);
  return res.data;
};

/**
 * Update organization members
 */
export const updateOrganizationMembers = async (
  organizationId: string,
  data: UpdateOrganizationMembersRequest
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/members`, data);
  return res.data;
};

/**
 * Send an invite to a user email
 */
export const sendOrganizationInvite = async (
  organizationId: string,
  data: SendInviteRequest
): Promise<SendInviteResponse> => {
  const res = await api.post(`/organizations/${organizationId}/invite`, data);
  return res.data;
};

/**
 * Accept an organization invite
 */
export const acceptOrganizationInvite = async (
  organizationId: string
): Promise<AcceptInviteResponse> => {
  const res = await api.post(`/organizations/${organizationId}/accept-invite`);
  return res.data;
};

/**
 * Update organization hackathons (add or remove)
 */
export const updateOrganizationHackathons = async (
  organizationId: string,
  data: UpdateHackathonsRequest
): Promise<UpdateHackathonsResponse> => {
  const res = await api.patch(
    `/organizations/${organizationId}/hackathons`,
    data
  );
  return res.data;
};

/**
 * Update organization grants (add or remove)
 */
export const updateOrganizationGrants = async (
  organizationId: string,
  data: UpdateGrantsRequest
): Promise<UpdateGrantsResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/grants`, data);
  return res.data;
};

/**
 * Delete an organization
 */
export const deleteOrganization = async (
  organizationId: string
): Promise<DeleteOrganizationResponse> => {
  const res = await api.delete(`/organizations/${organizationId}`);
  return res.data;
};

/**
 * Get organizations by user (organizations where user is a member)
 */
export const getUserOrganizations = async (
  userId?: string
): Promise<GetOrganizationsResponse> => {
  const url = userId ? `/organizations/user/${userId}` : '/organizations/user';
  const res = await api.get(url);
  return res.data;
};

/**
 * Get organizations owned by user
 */
export const getUserOwnedOrganizations = async (
  userId?: string
): Promise<GetOrganizationsResponse> => {
  const url = userId
    ? `/organizations/owned/${userId}`
    : '/organizations/owned';
  const res = await api.get(url);
  return res.data;
};

/**
 * Check if user has pending invites
 */
export const getPendingInvites = async (): Promise<{
  success: boolean;
  data: Organization[];
  message: string;
}> => {
  const res = await api.get('/organizations/pending-invites');
  return res.data;
};

/**
 * Remove a member from organization
 */
export const removeOrganizationMember = async (
  organizationId: string,
  memberEmail: string
): Promise<UpdateOrganizationResponse> => {
  const res = await api.delete(
    `/organizations/${organizationId}/members/${memberEmail}`
  );
  return res.data;
};

/**
 * Cancel a pending invite
 */
export const cancelOrganizationInvite = async (
  organizationId: string,
  email: string
): Promise<UpdateOrganizationResponse> => {
  const res = await api.delete(
    `/organizations/${organizationId}/invites/${email}`
  );
  return res.data;
};

/**
 * Transfer organization ownership
 */
export const transferOrganizationOwnership = async (
  organizationId: string,
  newOwnerEmail: string
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(
    `/organizations/${organizationId}/transfer-ownership`,
    {
      newOwnerEmail,
    }
  );
  return res.data;
};

/**
 * Get organization statistics
 */
export const getOrganizationStats = async (
  organizationId: string
): Promise<{
  success: boolean;
  data: {
    totalMembers: number;
    totalHackathons: number;
    totalGrants: number;
    pendingInvites: number;
    isProfileComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
  };
  message: string;
}> => {
  const res = await api.get(`/organizations/${organizationId}/stats`);
  return res.data;
};

/**
 * Search organizations
 */
export const searchOrganizations = async (
  query: string,
  filters?: {
    isProfileComplete?: boolean;
    hasHackathons?: boolean;
    hasGrants?: boolean;
  }
): Promise<GetOrganizationsResponse> => {
  const params = new URLSearchParams({
    q: query,
  });

  if (filters?.isProfileComplete !== undefined) {
    params.append('isProfileComplete', filters.isProfileComplete.toString());
  }

  if (filters?.hasHackathons !== undefined) {
    params.append('hasHackathons', filters.hasHackathons.toString());
  }

  if (filters?.hasGrants !== undefined) {
    params.append('hasGrants', filters.hasGrants.toString());
  }

  const res = await api.get(`/organizations/search?${params.toString()}`);
  return res.data;
};

/**
 * Get organizations by hackathon
 */
export const getOrganizationsByHackathon = async (
  hackathonId: string,
  page = 1,
  limit = 10
): Promise<GetOrganizationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get(
    `/organizations/hackathon/${hackathonId}?${params.toString()}`
  );
  return res.data;
};

/**
 * Get organizations by grant
 */
export const getOrganizationsByGrant = async (
  grantId: string,
  page = 1,
  limit = 10
): Promise<GetOrganizationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get(
    `/organizations/grant/${grantId}?${params.toString()}`
  );
  return res.data;
};

/**
 * Bulk update organization hackathons
 */
export const bulkUpdateOrganizationHackathons = async (
  organizationId: string,
  hackathonIds: string[]
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(
    `/organizations/${organizationId}/hackathons/bulk`,
    {
      hackathonIds,
    }
  );
  return res.data;
};

/**
 * Bulk update organization grants
 */
export const bulkUpdateOrganizationGrants = async (
  organizationId: string,
  grantIds: string[]
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/grants/bulk`, {
    grantIds,
  });
  return res.data;
};

/**
 * Export organization data
 */
export const exportOrganizationData = async (
  organizationId: string,
  format: 'json' | 'csv' = 'json'
): Promise<{
  success: boolean;
  data: {
    downloadUrl: string;
    format: string;
    expiresAt: string;
  };
  message: string;
}> => {
  const res = await api.get(
    `/organizations/${organizationId}/export?format=${format}`
  );
  return res.data;
};

/**
 * Import organization data
 */
export const importOrganizationData = async (
  organizationId: string,
  data: {
    file: File;
    format: 'json' | 'csv';
  }
): Promise<{
  success: boolean;
  data: {
    importedCount: number;
    errors: string[];
  };
  message: string;
}> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('format', data.format);

  const res = await api.post(
    `/organizations/${organizationId}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};

export const getOrganizationPermissions = async (
  organizationId: string
): Promise<GetPermissionsResponse> => {
  const res = await api.get(`/organizations/${organizationId}/permissions`);
  return res.data;
};

export const updateOrganizationPermissions = async (
  organizationId: string,
  data: UpdatePermissionsRequest
): Promise<UpdateOrganizationResponse> => {
  const res = await api.patch(
    `/organizations/${organizationId}/permissions`,
    data
  );
  return res.data;
};

export const resetOrganizationPermissions = async (
  organizationId: string
): Promise<UpdateOrganizationResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/permissions/reset`
  );
  return res.data;
};

export const assignOrganizationRole = async (
  organizationId: string,
  data: AssignRoleRequest
): Promise<AssignRoleResponse> => {
  const res = await api.patch(`/organizations/${organizationId}/roles`, data);
  return res.data;
};

// Error handling utilities
export const isOrganizationError = (error: unknown): error is ErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'statusCode' in error
  );
};

export const handleOrganizationError = (error: unknown): never => {
  if (isOrganizationError(error)) {
    throw new Error(`${error.message} (${error.statusCode})`);
  }
  throw new Error('An unexpected error occurred');
};

// Type guards for runtime type checking
export const isOrganization = (obj: unknown): obj is Organization => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    'name' in obj &&
    'members' in obj &&
    'owner' in obj &&
    'isProfileComplete' in obj
  );
};

export const isCreateOrganizationRequest = (
  obj: unknown
): obj is CreateOrganizationRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as Record<string, unknown>).name === 'string'
  );
};

export const isUpdateOrganizationProfileRequest = (
  obj: unknown
): obj is UpdateOrganizationProfileRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).some(key =>
      ['name', 'logo', 'tagline', 'about'].includes(key)
    )
  );
};

export const isUpdateOrganizationLinksRequest = (
  obj: unknown
): obj is UpdateOrganizationLinksRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).some(key =>
      ['website', 'x', 'github', 'others'].includes(key)
    )
  );
};

export const isUpdateOrganizationMembersRequest = (
  obj: unknown
): obj is UpdateOrganizationMembersRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'members' in obj &&
    Array.isArray((obj as Record<string, unknown>).members)
  );
};

export const isSendInviteRequest = (obj: unknown): obj is SendInviteRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'emails' in obj &&
    Array.isArray((obj as Record<string, unknown>).emails)
  );
};

export const isUpdateHackathonsRequest = (
  obj: unknown
): obj is UpdateHackathonsRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'action' in obj &&
    'hackathonId' in obj &&
    ['add', 'remove'].includes(
      (obj as Record<string, unknown>).action as string
    ) &&
    typeof (obj as Record<string, unknown>).hackathonId === 'string'
  );
};

export const isUpdateGrantsRequest = (
  obj: unknown
): obj is UpdateGrantsRequest => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'action' in obj &&
    'grantId' in obj &&
    ['add', 'remove'].includes(
      (obj as Record<string, unknown>).action as string
    ) &&
    typeof (obj as Record<string, unknown>).grantId === 'string'
  );
};
