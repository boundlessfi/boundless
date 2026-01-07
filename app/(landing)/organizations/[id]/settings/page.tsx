'use client';

import { useParams } from 'next/navigation';
import OrganizationSettings from '@/components/organization/OrganizationSettings';
import { useEffect } from 'react';
import { useOrganization } from '@/lib/providers';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

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
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black text-white'>
        <div className='flex'>
          <OrganizationSettings organizationId={organizationId} />
        </div>
      </div>
    </AuthGuard>
  );
}
