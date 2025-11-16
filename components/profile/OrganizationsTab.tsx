'use client';

import OrganizationsList from './OrganizationsList';
import { Organization } from '@/types/profile';

interface OrganizationsTabProps {
  organizations: Organization[];
}

export default function OrganizationsTab({
  organizations,
}: OrganizationsTabProps) {
  return (
    <div>
      <OrganizationsList organizations={organizations} />
    </div>
  );
}
