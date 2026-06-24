'use client';

import { useQuery } from '@tanstack/react-query';

import {
  listOrganizationBounties,
  type OrganizationBountyListItem,
} from './core';
import { bountyKeys } from './keys';

/** An organization's published bounties (newest first). */
export function useOrganizationBounties(organizationId: string) {
  return useQuery({
    queryKey: [...bountyKeys.all, 'published', organizationId],
    enabled: Boolean(organizationId),
    queryFn: (): Promise<OrganizationBountyListItem[]> =>
      listOrganizationBounties(organizationId),
  });
}
