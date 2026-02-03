export type UserRole = 'user' | 'admin' | 'moderator';

export type LoginMethod = 'email' | 'google' | 'github' | 'discord';

export type Theme = 'light' | 'dark' | 'system';

export type ProjectStatus =
  | 'IDEA'
  | 'DRAFT'
  | 'PROPOSED'
  | 'APPROVED'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ActivityType =
  | 'PROFILE_UPDATED'
  | 'AVATAR_CHANGED'
  | 'PROJECT_FOLLOWED'
  | 'PROJECT_CREATED'
  | 'COMMENT_ADDED'
  | 'VOTE_CAST'
  | 'GRANT_APPLIED';

export type OrganizationMemberRole = 'owner' | 'admin' | 'member' | 'moderator';

export interface SocialLinks {
  github?: string;
  discord?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface UserPreferences {
  theme: Theme;
  skills: string[];
  language: string;
  timezone: string;
  categories: string[];
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface UserProfileData {
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  skills?: string[];
  socialLinks?: SocialLinks;
}

export interface MetadataProfile {
  stats: Record<string, any>;
  privacy: Record<string, any>;
  profile: UserProfileData;
  preferences: UserPreferences;
}

export interface UserMetadata {
  stats: Record<string, any>;
  privacy: Record<string, any>;
  profile: UserProfileData;
  preferences: UserPreferences;
}

export interface Project {
  id: string;
  title: string;
  vision: string;
  category: string;
  status: string; // Changed from ProjectStatus to string
  banner?: string | null;
  logo?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityMetadata {
  fields?: string[];
  newAvatar?: string;
  oldAvatar?: string;
  entityId?: string;
  entityType?: string;
  [key: string]: any;
}

export interface Activity {
  id: string;
  type: string; // Changed from ActivityType to string to match API
  userId: string;
  projectId?: string | null;
  organizationId?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  project?: any;
  organization?: any;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
}

export interface GrantApplication {
  id: string;
  grantId: string;
  grantTitle: string;
  status: string;
  submittedAt: string;
  amount?: number;
  [key: string]: any;
}

export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  status: string;
  submittedAt: string;
  [key: string]: any;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string;
  createdAt: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  createdAt: string;
  organization: Organization;
}
export interface Stats {
  followers: number;
  following: number;
}
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginMethod?: string;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  username: string;
  displayUsername: string;
  metadata?: any;
  twoFactorEnabled: boolean;
  members?: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      logo: string;
      createdAt: string;
      _count: {
        hackathons: number;
        members: number;
      };
    };
  }>;
  projects?: Array<{
    id: string;
    title: string;
    vision: string;
    category: string;
    status: string;
    banner?: string | null;
    logo?: string | null;
    createdAt: string;
  }>;
  activities?: Array<{
    id: string;
    type: string;
    userId: string;
    projectId?: string | null;
    organizationId?: string | null;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    project?: any;
  }>;
  userBadges?: any[];
  grantApplicationsAsApplicant?: any[];
  hackathonSubmissionsAsParticipant?: Array<{
    id: string;
    status: string;
    rank?: number | null;
    submittedAt: string;
  }>;
  profile?: any;
  stats?: {
    followers: number;
    following: number;
  };
}

export interface SessionUser extends User {}

export interface GetUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface UserSettings {
  notifications?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy?: {
    profileVisibility: 'PUBLIC' | 'PRIVATE';
    showWalletAddress: boolean;
    showContributions: boolean;
  };
  preferences?: UserPreferences;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface UpdateUserSettingsRequest extends UserSettings {}

export interface UpdateUserSecurityRequest {
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
  twoFactorCode?: string;
}

export type UserWithoutSensitiveData = Omit<
  User,
  'banReason' | 'banExpires' | 'metadata'
>;

export type PublicUserProfile = Pick<
  User,
  'id' | 'name' | 'username' | 'displayUsername' | 'image' | 'projects'
> & {
  metadata: {
    profile: UserProfileData;
  };
};
