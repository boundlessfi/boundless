import { Metadata } from 'next';

import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { generatePageMetadata } from '@/lib/metadata';
import BountyManagementDashboard from '@/components/organization/bounties/manage/BountyManagementDashboard';

export const metadata: Metadata = generatePageMetadata('bounties');

export default function BountyManagePageRoute() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='mx-auto max-w-6xl px-6 py-8'>
        <BountyManagementDashboard />
      </div>
    </AuthGuard>
  );
}
