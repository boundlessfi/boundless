// ===== Organization Types =====

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type PermissionValue = boolean | { value: boolean; note?: string };

export interface RolePermissions {
  owner: boolean; // Owner always has full permissions
  admin: PermissionValue;
  member: PermissionValue;
}

export interface CustomPermissions {
  create_edit_profile: RolePermissions;
  manage_hackathons_grants: RolePermissions;
  publish_hackathons: RolePermissions;
  view_analytics: RolePermissions;
  invite_remove_members: RolePermissions;
  assign_roles: RolePermissions;
  post_announcements: RolePermissions;
  comment_discussions: RolePermissions;
  access_submissions: RolePermissions;
  delete_organization: RolePermissions;
}

export interface OrganizationPermissions {
  canEditProfile: boolean;
  canCreateProfile: boolean;
  canManageHackathons: boolean;
  canPublishHackathons: boolean;
  canViewAnalytics: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canAssignRoles: boolean;
  canPostAnnouncements: boolean;
  canComment: boolean;
  canAccessSubmissions: boolean;
  canDeleteOrganization: boolean;
}

export interface OrganizationMember {
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
}

export interface Organization {
  _id: string;
  name: string;
  logo: string;
  tagline: string;
  about: string;
  links: {
    website: string;
    x: string;
    github: string;
    others: string;
  };
  members: string[];
  admins: string[];
  owner: string;
  hackathons: string[];
  grants: string[];
  isProfileComplete: boolean;
  pendingInvites: string[];
  customPermissions?: CustomPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleResponse {
  role: OrganizationRole;
  permissions: OrganizationPermissions;
}

export interface MembersWithRolesResponse {
  owner: OrganizationMember;
  admins: OrganizationMember[];
  members: OrganizationMember[];
  totalCount: {
    owner: number;
    admins: number;
    members: number;
    total: number;
  };
}

// ===== API Request Types =====

export interface AssignRoleRequest {
  action: 'promote' | 'demote';
  email: string;
}

export interface UpdateMembersRequest {
  action: 'add' | 'remove';
  email: string;
}

export interface UpdateHackathonsRequest {
  action: 'add' | 'remove';
  hackathonId: string;
}

export interface UpdateGrantsRequest {
  action: 'add' | 'remove';
  grantId: string;
}

export interface SendInviteRequest {
  emails: string[];
}

export interface TransferOwnershipRequest {
  newOwnerEmail: string;
}

export interface UpdateProfileRequest {
  name?: string;
  logo?: string;
  tagline?: string;
  about?: string;
}

export interface UpdateLinksRequest {
  website?: string;
  x?: string;
  github?: string;
  others?: string;
}

// ===== API Response Types =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===== React Hook Example =====

/**
 * Example custom hook for managing organization permissions
 *
 * Usage:
 * ```tsx
 * const { role, permissions, isLoading } = useOrganizationRole(orgId);
 *
 * if (permissions.canEditProfile) {
 *   // Show edit button
 * }
 * ```
 */
export interface UseOrganizationRoleReturn {
  role: OrganizationRole | null;
  permissions: OrganizationPermissions | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ===== Permission Helper Functions =====

/**
 * Check if user has specific permission
 */
export function hasPermission(
  permissions: OrganizationPermissions | null,
  permission: keyof OrganizationPermissions
): boolean {
  return permissions?.[permission] ?? false;
}

/**
 * Get permission level for a specific action
 */
export function getRequiredRole(
  action:
    | 'editProfile'
    | 'createProfile'
    | 'manageHackathons'
    | 'publishHackathons'
    | 'viewAnalytics'
    | 'inviteMembers'
    | 'removeMembers'
    | 'assignRoles'
    | 'postAnnouncements'
    | 'comment'
    | 'accessSubmissions'
    | 'deleteOrganization'
): OrganizationRole[] {
  const permissionMap: Record<string, OrganizationRole[]> = {
    editProfile: ['owner', 'admin'],
    createProfile: ['owner'],
    manageHackathons: ['owner', 'admin'],
    publishHackathons: ['owner'],
    viewAnalytics: ['owner', 'admin', 'member'],
    inviteMembers: ['owner', 'admin'],
    removeMembers: ['owner', 'admin'],
    assignRoles: ['owner'],
    postAnnouncements: ['owner'],
    comment: ['owner', 'admin', 'member'],
    accessSubmissions: ['owner', 'admin', 'member'],
    deleteOrganization: ['owner'],
  };

  return permissionMap[action] || [];
}

/**
 * Check if a role has permission for an action
 */
export function roleHasPermission(
  role: OrganizationRole,
  action: Parameters<typeof getRequiredRole>[0]
): boolean {
  const requiredRoles = getRequiredRole(action);
  return requiredRoles.includes(role);
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: OrganizationRole): string {
  const colors = {
    owner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    member: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return colors[role];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OrganizationRole): string {
  const names = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
  };

  return names[role];
}

// ===== Permission Constants =====

export const OWNER_PERMISSIONS: OrganizationPermissions = {
  canEditProfile: true,
  canCreateProfile: true,
  canManageHackathons: true,
  canPublishHackathons: true,
  canViewAnalytics: true,
  canInviteMembers: true,
  canRemoveMembers: true,
  canAssignRoles: true,
  canPostAnnouncements: true,
  canComment: true,
  canAccessSubmissions: true,
  canDeleteOrganization: true,
};

export const ADMIN_PERMISSIONS: OrganizationPermissions = {
  canEditProfile: true,
  canCreateProfile: false,
  canManageHackathons: true,
  canPublishHackathons: false,
  canViewAnalytics: true,
  canInviteMembers: true,
  canRemoveMembers: true,
  canAssignRoles: false,
  canPostAnnouncements: false,
  canComment: true,
  canAccessSubmissions: true,
  canDeleteOrganization: false,
};

export const MEMBER_PERMISSIONS: OrganizationPermissions = {
  canEditProfile: false,
  canCreateProfile: false,
  canManageHackathons: false,
  canPublishHackathons: false,
  canViewAnalytics: true,
  canInviteMembers: false,
  canRemoveMembers: false,
  canAssignRoles: false,
  canPostAnnouncements: false,
  canComment: true,
  canAccessSubmissions: true, // view only
  canDeleteOrganization: false,
};
