// Types for custom session response

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: any; // You may want to define a more specific type for social links
}

export interface UserStats {
  projectsCreated: number;
  projectsFunded: number;
  totalContributed: number;
  reputation: number;
  communityScore: number;
  commentsPosted: number;
  organizations: number;
  following: number;
  followers: number;
  votes: number;
  grants: number;
  hackathons: number;
  donations: number;
}

export interface OrganizationData {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  description?: string;
  tagline?: string;
  isProfileComplete: boolean;
  role: 'owner' | 'member';
  memberCount: number;
  hackathonCount: number;
  grantCount: number;
  createdAt: string;
}

export interface FollowUser {
  id: string;
  profile: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    bio?: string;
  };
  followedAt: Date;
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  link: string;
  tags: string[];
  category?: string;
  type?: string;
  amount?: number;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: string;
  ownerName?: string;
  ownerUsername?: string;
  ownerAvatar?: string;
  votes: {
    current: number;
    total: number;
  };
  daysLeft: number;
  progress: number;
}

export interface ActivityData {
  id: string;
  type: string;
  description: string;
  projectName: string;
  projectId?: string;
  amount?: number | null;
  timestamp: Date;
  image?: string;
  emoji: string;
}

export interface ContributedProject {
  // Define this based on your actual contributed projects structure
  [key: string]: any;
}

export interface CustomSessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  profile?: UserProfile;
  stats?: UserStats;
  organizations?: OrganizationData[];
  following?: FollowUser[];
  followers?: FollowUser[];
  projects?: ProjectData[];
  activities?: ActivityData[];
  _id?: any; // MongoDB ObjectId
  isVerified?: boolean;
  contributedProjects?: ContributedProject[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  lastLogin?: Date;
  isProfileComplete?: boolean;
  missingProfileFields?: string[];
  profileCompletionPercentage?: number;
}

export interface CustomSessionResponse {
  user: CustomSessionUser;
}
