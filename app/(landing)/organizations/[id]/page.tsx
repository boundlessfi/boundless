'use client';

import OrganizationAnalytics from '@/components/organization/OrganizationAnalytics';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import Loading from '@/components/Loading';
import { AuthGuard } from '@/components/auth';

const OrganizationPage = () => {
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
      <div className='bg-background-main-bg min-h-screen text-white'>
        <OrganizationAnalytics />
      </div>
    </AuthGuard>
  );
};

export default OrganizationPage;
