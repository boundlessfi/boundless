import { HackathonCategory } from '@/lib/api/hackathons';

export interface FilterOption {
  label: string;
  value: string;
}

export const sortOptions: FilterOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Prize Pool High', value: 'prize_pool_high' },
  { label: 'Prize Pool Low', value: 'prize_pool_low' },
  { label: 'Ending Soon', value: 'deadline_soon' },
  { label: 'Starting Soon', value: 'deadline_far' },
];

export const statusOptions: FilterOption[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const categoryOptions: FilterOption[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'DeFi', value: HackathonCategory.DEFI },
  { label: 'NFTs', value: HackathonCategory.NFTS },
  { label: 'DAOs', value: HackathonCategory.DAOS },
  { label: 'Layer 2', value: HackathonCategory.LAYER_2 },
  { label: 'Cross-chain', value: HackathonCategory.CROSS_CHAIN },
  { label: 'Web3 Gaming', value: HackathonCategory.WEB3_GAMING },
  { label: 'Social Tokens', value: HackathonCategory.SOCIAL_TOKENS },
  { label: 'Infrastructure', value: HackathonCategory.INFRASTRUCTURE },
  { label: 'Privacy', value: HackathonCategory.PRIVACY },
  { label: 'Sustainability', value: HackathonCategory.SUSTAINABILITY },
  { label: 'Real World Assets', value: HackathonCategory.REAL_WORLD_ASSETS },
  { label: 'Other', value: HackathonCategory.OTHER },
];

export const locationOptions: FilterOption[] = [
  { label: 'All Locations', value: 'all' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Physical', value: 'physical' },
];
