import { Organization } from '../api/types';

export interface OrganizationSummary {
  _id: string;
  name: string;
  logo: string;
  tagline?: string;
  isProfileComplete: boolean;
  role: 'owner' | 'member';
  memberCount: number;
  hackathonCount: number;
  grantCount: number;
  createdAt: string;
}

export interface UserProfileResponse {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    organizations: OrganizationSummary[];
  };
}

export type OrganizationContextValue = OrganizationContextState &
  OrganizationContextActions;

export interface OrganizationProviderProps {
  children: React.ReactNode;
  initialOrgId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface OrganizationChangeEvent {
  previousOrgId: string | null;
  newOrgId: string;
  organization: Organization;
}

export interface OrganizationStats {
  totalMembers: number;
  totalHackathons: number;
  totalGrants: number;
  pendingInvites: number;
  isProfileComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export interface OrganizationFormData {
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
}

export interface OrganizationInviteData {
  email: string;
  role?: 'member' | 'admin';
  message?: string;
}

export interface OrganizationMember {
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  isActive: boolean;
  avatar?: string;
  name?: string;
}

export interface OrganizationActivity {
  id: string;
  type:
    | 'member_joined'
    | 'member_left'
    | 'hackathon_added'
    | 'grant_added'
    | 'profile_updated';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface OrganizationNotificationPreferences {
  emailInvites: boolean;
  emailUpdates: boolean;
  emailHackathons: boolean;
  emailGrants: boolean;
  pushNotifications: boolean;
}

export interface OrganizationSettings {
  allowPublicView: boolean;
  allowMemberInvites: boolean;
  requireApprovalForJoining: boolean;
  defaultMemberRole: 'member' | 'admin';
  notificationPreferences: OrganizationNotificationPreferences;
}

export interface OrganizationSearchFilters {
  search?: string;
  isProfileComplete?: boolean;
  hasHackathons?: boolean;
  hasGrants?: boolean;
  role?: 'owner' | 'member' | 'all';
  sortBy?: 'name' | 'createdAt' | 'memberCount' | 'completion';
  sortOrder?: 'asc' | 'desc';
}

export interface OrganizationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrganizationApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface OrganizationContextState {
  activeOrg: Organization | null;
  organizations: OrganizationSummary[];
  activeOrgId: string | null;
  isLoading: boolean;
  isLoadingOrganizations: boolean;
  isLoadingActiveOrg: boolean;
  error: string | null;
  organizationsError: string | null;
  activeOrgError: string | null;
  lastUpdated: number;
  refreshCount: number;
}

export interface OrganizationContextActions {
  setActiveOrg: (orgId: string) => void;
  refreshOrganization: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  refreshAll: () => Promise<void>;
  createOrganization: (data: OrganizationFormData) => Promise<Organization>;
  updateOrganization: (
    orgId: string,
    data: Partial<OrganizationFormData>
  ) => Promise<Organization>;
  updateOrganizationLinks: (
    orgId: string,
    links: { website?: string; x?: string; github?: string; others?: string }
  ) => Promise<Organization>;
  updateOrganizationMembers: (
    orgId: string,
    members: string[]
  ) => Promise<Organization>;
  deleteOrganization: (orgId: string) => Promise<void>;
  removeMember: (orgId: string, email: string) => Promise<void>;
  inviteMember: (orgId: string, emails: string[]) => Promise<void>;
  addHackathon: (orgId: string, hackathonId: string) => Promise<void>;
  removeHackathon: (orgId: string, hackathonId: string) => Promise<void>;
  addGrant: (orgId: string, grantId: string) => Promise<void>;
  removeGrant: (orgId: string, grantId: string) => Promise<void>;
  getOrganizationById: (orgId: string) => OrganizationSummary | undefined;
  isOwner: (orgId?: string) => boolean;
  isMember: (orgId?: string) => boolean;
  canManage: (orgId?: string) => boolean;
  getProfileCompletionStatus: (orgId?: string) => {
    isComplete: boolean;
    percentage: number;
    missingFields: string[];
  };
}
