'use client';

import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import OrganizationSettings from '@/components/organization/OrganizationSettings';

export default function NewOrganizationPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        <OrganizationSettings isCreating={true} />
      </div>
    </AuthGuard>
  );
}
