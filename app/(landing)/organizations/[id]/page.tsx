'use client';

import OrganizationAnalytics from '@/components/organization/OrganizationAnalytics';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrganization } from '@/lib/providers/OrganizationProvider';

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
    <div className='bg-background-main-bg min-h-screen text-white'>
      <OrganizationAnalytics />
    </div>
  );
};

export default OrganizationPage;
