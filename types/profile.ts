import { SocialLinks } from './user';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  socialLinks: SocialLinks;
}

export interface UserStats {
  organizations: number;
  projects: number;
  following: number;
  followers: number;
}

export interface Organization {
  name: string;
  id?: string;
  avatarUrl: string;
}
