import { authClient } from '@/lib/auth-client';

/**
 * Better Auth Organization API Helper Functions
 *
 * These functions provide direct access to Better Auth's organization APIs.
 * They can be used as alternatives to the existing custom API endpoints
 * for organizations that use Better Auth integration (have betterAuthOrgId).
 */

/**
 * Accept invitation using Better Auth
 *
 * @returns Response containing invitation and member details with organizationId
 */
export const acceptBetterAuthInvitation = async (invitationId: string) => {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId,
  });
  if (error) throw error;

  // Better Auth returns { invitation: {...}, member: {...} }
  // Extract organizationId for convenience
  const response = data as {
    invitation?: { organizationId: string; [key: string]: any };
    member?: { organizationId: string; [key: string]: any };
  };

  return {
    ...response,
    organizationId:
      response?.invitation?.organizationId || response?.member?.organizationId,
  };
};

/**
 * List user's organizations via Better Auth
 */
export const listBetterAuthOrganizations = async () => {
  const { data, error } = await authClient.organization.list();
  if (error) throw error;
  return data;
};

/**
 * Get organization details via Better Auth
 *
 * Note: Better Auth may not have a direct 'get' method.
 * Use the backend API or list organizations and filter by ID.
 */
export const getBetterAuthOrganization = async (organizationId: string) => {
  // Better Auth doesn't have a direct get method
  // Use list and filter, or use the backend API instead
  const { data, error } = await authClient.organization.list();
  if (error) throw error;

  const org = data?.find((org: any) => org.id === organizationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  return org;
};

/**
 * List organization members via Better Auth
 */
export const listBetterAuthMembers = async (organizationId?: string) => {
  const { data, error } = await authClient.organization.listMembers({
    query: {
      organizationId,
    },
  });
  if (error) throw error;
  return data;
};

/**
 * List organization invitations via Better Auth
 */
export const listBetterAuthInvitations = async (organizationId?: string) => {
  const { data, error } = await authClient.organization.listInvitations({
    query: {
      organizationId,
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Update organization via Better Auth
 */
export const updateBetterAuthOrganization = async (
  organizationId: string,
  data: {
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, any>;
  }
) => {
  const { data: result, error } = await authClient.organization.update({
    organizationId,
    data,
  });
  if (error) throw error;
  return result;
};

/**
 * Create organization via Better Auth
 */
export const createBetterAuthOrganization = async (data: {
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, any>;
}) => {
  const { data: result, error } = await authClient.organization.create(data);
  if (error) throw error;
  return result;
};

/**
 * Delete organization via Better Auth
 */
export const deleteBetterAuthOrganization = async (organizationId: string) => {
  const { data, error } = await authClient.organization.delete({
    organizationId,
  });
  if (error) throw error;
  return data;
};

/**
 * Invite member to organization via Better Auth
 */
export const inviteBetterAuthMember = async (
  email: string,
  role: 'member' | 'admin' | 'owner' | ('member' | 'admin' | 'owner')[],
  organizationId?: string
) => {
  const { data, error } = await authClient.organization.inviteMember({
    email,
    role,
    organizationId,
  });
  if (error) throw error;
  return data;
};

/**
 * Remove member from organization via Better Auth
 */
export const removeBetterAuthMember = async (
  memberIdOrEmail: string,
  organizationId?: string
) => {
  const { data, error } = await authClient.organization.removeMember({
    memberIdOrEmail,
    organizationId,
  });
  if (error) throw error;
  return data;
};

/**
 * Update member role via Better Auth
 */
export const updateBetterAuthMemberRole = async (
  memberId: string,
  role: 'member' | 'admin' | 'owner' | ('member' | 'admin' | 'owner')[],
  organizationId?: string
) => {
  const { data, error } = await authClient.organization.updateMemberRole({
    memberId,
    role,
    organizationId,
  });
  if (error) throw error;
  return data;
};

/**
 * Get active member details via Better Auth
 */
export const getActiveBetterAuthMember = async () => {
  const { data, error } = await authClient.organization.getActiveMember();
  if (error) throw error;
  return data;
};

/**
 * Get active member role via Better Auth
 */
export const getActiveBetterAuthMemberRole = async () => {
  const { data, error } = await authClient.organization.getActiveMemberRole();
  if (error) throw error;
  return data;
};

/**
 * List user's invitations via Better Auth
 */
export const listUserBetterAuthInvitations = async () => {
  const { data, error } = await authClient.organization.listUserInvitations();
  if (error) throw error;
  return data;
};

/**
 * Reject invitation via Better Auth
 */
export const rejectBetterAuthInvitation = async (invitationId: string) => {
  const { data, error } = await authClient.organization.rejectInvitation({
    invitationId,
  });
  if (error) throw error;
  return data;
};

/**
 * Cancel invitation via Better Auth
 */
export const cancelBetterAuthInvitation = async (invitationId: string) => {
  const { data, error } = await authClient.organization.cancelInvitation({
    invitationId,
  });
  if (error) throw error;
  return data;
};
