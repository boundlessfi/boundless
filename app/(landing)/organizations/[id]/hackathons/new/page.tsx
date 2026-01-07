import React from 'react';
import NewHackathonTab from '@/components/organization/hackathons/new/NewHackathonTab';
import Loading from '@/components/Loading';
import { AuthGuard } from '@/components/auth';
const page = () => {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div>
        <NewHackathonTab />
      </div>
    </AuthGuard>
  );
};

export default page;
