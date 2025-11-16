import { Organization } from '../api/types';
import { OrganizationSummary } from './organization-types';
import { getProfileCompletionStatus } from '../organization-utils';

/**
 * Organization utility functions for the provider
 */

/**
 * Convert full organization to summary format
 */
export function organizationToSummary(
  org: Organization,
  userRole: 'owner' | 'member' = 'member'
): OrganizationSummary {
  return {
    _id: org._id,
    name: org.name,
    logo: org.logo,
    tagline: org.tagline,
    isProfileComplete: org.isProfileComplete,
    role: userRole,
    memberCount: org.members.length,
    hackathonCount: org.hackathons.length,
    grantCount: org.grants.length,
    createdAt: org.createdAt,
  };
}

/**
 * Check if organization is complete
 */
export function isOrganizationComplete(org: Organization): boolean {
  return getProfileCompletionStatus(org).isComplete;
}

/**
 * Get organization completion percentage
 */
export function getOrganizationCompletionPercentage(org: Organization): number {
  return getProfileCompletionStatus(org).completionPercentage;
}

/**
 * Get organization missing fields
 */
export function getOrganizationMissingFields(org: Organization): string[] {
  return getProfileCompletionStatus(org).missingFields;
}

/**
 * Check if user is owner of organization
 */
export function isUserOwner(org: Organization, userEmail: string): boolean {
  return org.owner === userEmail;
}

/**
 * Check if user is member of organization
 */
export function isUserMember(org: Organization, userEmail: string): boolean {
  return org.members.includes(userEmail) || org.owner === userEmail;
}

/**
 * Check if user can manage organization
 */
export function canUserManage(org: Organization, userEmail: string): boolean {
  return org.owner === userEmail;
}

/**
 * Get user role in organization
 */
export function getUserRole(
  org: Organization,
  userEmail: string
): 'owner' | 'member' | null {
  if (org.owner === userEmail) return 'owner';
  if (org.members.includes(userEmail)) return 'member';
  return null;
}

/**
 * Check if organization has pending invites
 */
export function hasPendingInvites(org: Organization): boolean {
  return org.pendingInvites.length > 0;
}

/**
 * Get organization statistics
 */
export function getOrganizationStats(org: Organization) {
  return {
    totalMembers: org.members.length,
    totalHackathons: org.hackathons.length,
    totalGrants: org.grants.length,
    pendingInvites: org.pendingInvites.length,
    isProfileComplete: org.isProfileComplete,
    completionPercentage: getOrganizationCompletionPercentage(org),
    missingFields: getOrganizationMissingFields(org),
  };
}

/**
 * Sort organizations by name
 */
export function sortOrganizationsByName(
  orgs: OrganizationSummary[]
): OrganizationSummary[] {
  return [...orgs].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort organizations by completion status
 */
export function sortOrganizationsByCompletion(
  orgs: OrganizationSummary[]
): OrganizationSummary[] {
  return [...orgs].sort((a, b) => {
    if (a.isProfileComplete === b.isProfileComplete) {
      return a.name.localeCompare(b.name);
    }
    return a.isProfileComplete ? -1 : 1;
  });
}

/**
 * Sort organizations by member count
 */
export function sortOrganizationsByMemberCount(
  orgs: OrganizationSummary[]
): OrganizationSummary[] {
  return [...orgs].sort((a, b) => b.memberCount - a.memberCount);
}

/**
 * Filter organizations by completion status
 */
export function filterOrganizationsByCompletion(
  orgs: OrganizationSummary[],
  isComplete: boolean
): OrganizationSummary[] {
  return orgs.filter(org => org.isProfileComplete === isComplete);
}

/**
 * Filter organizations by role
 */
export function filterOrganizationsByRole(
  orgs: OrganizationSummary[],
  role: 'owner' | 'member'
): OrganizationSummary[] {
  return orgs.filter(org => org.role === role);
}

/**
 * Search organizations by name or tagline
 */
export function searchOrganizations(
  orgs: OrganizationSummary[],
  query: string
): OrganizationSummary[] {
  const lowercaseQuery = query.toLowerCase();
  return orgs.filter(
    org =>
      org.name.toLowerCase().includes(lowercaseQuery) ||
      (org.tagline && org.tagline.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * Get organization display name
 */
export function getOrganizationDisplayName(
  org: OrganizationSummary | Organization
): string {
  return org.name;
}

/**
 * Get organization avatar URL
 */
export function getOrganizationAvatar(
  org: OrganizationSummary | Organization
): string | null {
  return org.logo || null;
}

/**
 * Get organization description
 */
export function getOrganizationDescription(
  org: OrganizationSummary | Organization
): string {
  if ('about' in org) {
    return org.about || org.tagline || '';
  }
  return org.tagline || '';
}

/**
 * Check if organization is active
 */
// export function isOrganizationActive(org: Organization): boolean {
//   // Add any business logic for determining if org is active
//   return true; // For now, all orgs are considered active
// }

/**
 * Get organization age in days
 */
export function getOrganizationAge(org: Organization): number {
  const createdAt = new Date(org.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if organization is new (less than 30 days old)
 */
export function isNewOrganization(org: Organization): boolean {
  return getOrganizationAge(org) < 30;
}

/**
 * Get organization activity level based on member count and age
 */
export function getOrganizationActivityLevel(
  org: Organization
): 'low' | 'medium' | 'high' {
  const memberCount = org.members.length;
  const age = getOrganizationAge(org);

  if (memberCount >= 10 && age >= 30) return 'high';
  if (memberCount >= 5 || age >= 14) return 'medium';
  return 'low';
}

/**
 * Format organization member count
 */
export function formatMemberCount(count: number): string {
  if (count === 0) return 'No members';
  if (count === 1) return '1 member';
  return `${count} members`;
}

/**
 * Format organization hackathon count
 */
export function formatHackathonCount(count: number): string {
  if (count === 0) return 'No hackathons';
  if (count === 1) return '1 hackathon';
  return `${count} hackathons`;
}

/**
 * Format organization grant count
 */
export function formatGrantCount(count: number): string {
  if (count === 0) return 'No grants';
  if (count === 1) return '1 grant';
  return `${count} grants`;
}

/**
 * Get organization status badge
 */
export function getOrganizationStatusBadge(
  org: OrganizationSummary | Organization
) {
  if (org.isProfileComplete) {
    return { label: 'Complete', color: 'green', variant: 'success' };
  }

  const completionPercentage =
    'members' in org && 'owner' in org
      ? getOrganizationCompletionPercentage(org as Organization)
      : 0;

  if (completionPercentage >= 75) {
    return { label: 'Almost Complete', color: 'yellow', variant: 'warning' };
  }

  return { label: 'Incomplete', color: 'red', variant: 'error' };
}

/**
 * Get organization role badge
 */
export function getOrganizationRoleBadge(role: 'owner' | 'member') {
  switch (role) {
    case 'owner':
      return { label: 'Owner', color: 'purple', variant: 'primary' };
    case 'member':
      return { label: 'Member', color: 'blue', variant: 'secondary' };
    default:
      return { label: 'Unknown', color: 'gray', variant: 'default' };
  }
}

/**
 * Validate organization data
 */
export interface OrganizationBasicData {
  name?: string;
  logo?: string;
  tagline?: string;
  about?: string;
  links?: Partial<{
    website: string;
    x: string;
    github: string;
    others: string;
  }>;
}

export function validateOrganizationData(data: OrganizationBasicData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Organization name is required');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Organization name must be less than 100 characters');
  }

  if (data.tagline && data.tagline.length > 200) {
    errors.push('Tagline must be less than 200 characters');
  }

  if (data.about && data.about.length > 1000) {
    errors.push('About section must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize organization data
 */
export function sanitizeOrganizationData(
  data: OrganizationBasicData
): OrganizationBasicData {
  return {
    name: data.name?.trim(),
    logo: data.logo?.trim(),
    tagline: data.tagline?.trim(),
    about: data.about?.trim(),
    links: {
      website: data.links?.website?.trim(),
      x: data.links?.x?.trim(),
      github: data.links?.github?.trim(),
      others: data.links?.others?.trim(),
    },
  };
}

/**
 * Get organization storage key
 */
export function getOrganizationStorageKey(orgId: string): string {
  return `boundless_org_${orgId}`;
}

/**
 * Get organization cache key
 */
export function getOrganizationCacheKey(orgId: string): string {
  return `org_${orgId}_cache`;
}

/**
 * Check if organization data is cached
 */
export function isOrganizationDataCached(orgId: string): boolean {
  const cacheKey = getOrganizationCacheKey(orgId);
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return false;

  try {
    const data = JSON.parse(cached);
    const cacheAge = Date.now() - data.timestamp;
    return cacheAge < 5 * 60 * 1000; // 5 minutes
  } catch {
    return false;
  }
}

/**
 * Cache organization data
 */
export function cacheOrganizationData(orgId: string, data: Organization): void {
  const cacheKey = getOrganizationCacheKey(orgId);
  const cacheData = {
    data,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch {}
}

/**
 * Get cached organization data
 */
export function getCachedOrganizationData(orgId: string): Organization | null {
  const cacheKey = getOrganizationCacheKey(orgId);
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const data = JSON.parse(cached);
    return data.data;
  } catch {
    return null;
  }
}

/**
 * Clear organization cache
 */
export function clearOrganizationCache(orgId?: string): void {
  if (orgId) {
    const cacheKey = getOrganizationCacheKey(orgId);
    localStorage.removeItem(cacheKey);
  } else {
    // Clear all organization caches
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('org_') && key.endsWith('_cache')) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Get organization breadcrumb
 */
export function getOrganizationBreadcrumb(
  org: OrganizationSummary | Organization
): string[] {
  return ['Organizations', org.name];
}

/**
 * Get organization URL slug
 */
export function getOrganizationSlug(
  org: OrganizationSummary | Organization
): string {
  return org.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if organization name is available
 */
export function isOrganizationNameAvailable(
  name: string,
  existingOrgs: OrganizationSummary[]
): boolean {
  const normalizedName = name.toLowerCase().trim();
  return !existingOrgs.some(
    org => org.name.toLowerCase().trim() === normalizedName
  );
}

/**
 * Generate organization suggestions
 */
export function generateOrganizationSuggestions(org: Organization): string[] {
  const suggestions: string[] = [];

  if (!org.logo) {
    suggestions.push('Add a logo to make your organization more recognizable');
  }

  if (!org.tagline) {
    suggestions.push("Add a tagline to describe your organization's mission");
  }

  if (!org.about) {
    suggestions.push(
      'Add an about section to tell people more about your organization'
    );
  }

  const hasLinks =
    org.links.website || org.links.x || org.links.github || org.links.others;
  if (!hasLinks) {
    suggestions.push(
      'Add social media links to help people connect with your organization'
    );
  }

  if (org.members.length <= 1) {
    suggestions.push('Invite team members to join your organization');
  }

  return suggestions;
}
