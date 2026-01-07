import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import OrganizationPage from '@/components/organization/OrganizationPage';
import React from 'react';

const page = () => {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div>
        <OrganizationPage />
      </div>
    </AuthGuard>
  );
};

export default page;
