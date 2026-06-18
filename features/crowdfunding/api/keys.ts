/**
 * React Query key factory for the crowdfunding feature.
 * Co-locating keys here keeps hooks and imperative invalidateQueries calls in sync.
 */
export const crowdfundingKeys = {
  all: ['crowdfunding'] as const,

  // Public list
  list: (page: number, limit: number, filters?: Record<string, unknown>) =>
    [...crowdfundingKeys.all, 'list', { page, limit, ...filters }] as const,

  // Authenticated user's campaigns
  mine: (page: number, limit: number) =>
    [...crowdfundingKeys.all, 'mine', { page, limit }] as const,

  // Single campaign (by ID or slug - same cache slot since slug is unique)
  campaign: (idOrSlug: string) =>
    [...crowdfundingKeys.all, 'campaign', idOrSlug] as const,

  // Milestones for a campaign
  milestones: (campaignId: string) =>
    [...crowdfundingKeys.all, 'milestones', campaignId] as const,

  // Single milestone
  milestone: (campaignId: string, milestoneId: string) =>
    [...crowdfundingKeys.all, 'milestone', campaignId, milestoneId] as const,
};
