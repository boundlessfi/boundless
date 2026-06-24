/**
 * Non-hook client for an organization's published bounties (the root list).
 * The backend root GET isn't modelled with a response body in the OpenAPI
 * schema, so the row shape is projected here to the fields the list page reads.
 */
import { apiClient, unwrapData } from '@/lib/api';

export interface OrganizationBountyListItem {
  id: string;
  title: string;
  /** Lowercase lifecycle status (draft, open, completed, ...). */
  status: string;
  rewardAmount?: number;
  rewardCurrency?: string;
  createdAt?: string;
  _count?: { submissions?: number };
}

/** List an organization's bounties, newest first. */
export const listOrganizationBounties = async (
  organizationId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<OrganizationBountyListItem[]> => {
  const res = await apiClient.GET(
    '/api/organizations/{organizationId}/bounties',
    {
      params: {
        path: { organizationId },
        query: { page: opts.page ?? 1, limit: opts.limit ?? 20 },
      },
    }
  );
  // The response body is untyped in the schema (no response DTO on the
  // controller); project it to the list-item shape.
  return (
    (unwrapData(res) as unknown as OrganizationBountyListItem[] | undefined) ??
    []
  );
};
