'use client';

import { useParams } from 'next/navigation';
import OrganizationSettings from '@/components/organization/OrganizationSettings';
import { useEffect } from 'react';
import { useOrganization } from '@/lib/providers';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const { setActiveOrg } = useOrganization();

  useEffect(() => {
    if (organizationId) {
      setActiveOrg(organizationId);
    }
  }, [organizationId, setActiveOrg]);
  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='flex'>
        <OrganizationSettings organizationId={organizationId} />
      </div>
    </div>
  );
}
