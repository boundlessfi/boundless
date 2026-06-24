import React, { Suspense } from 'react';

import NewBountyTab from '@/components/organization/bounties/new/NewBountyTab';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

interface NewBountyPageProps {
  params: Promise<{ id: string }>;
}

const NewBountyPage = async ({ params }: NewBountyPageProps) => {
  const { id } = await params;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div>
        <Suspense fallback={<Loading />}>
          <NewBountyTab organizationId={id} />
        </Suspense>
      </div>
    </AuthGuard>
  );
};

export default NewBountyPage;
