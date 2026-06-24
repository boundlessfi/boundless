import React, { Suspense } from 'react';

import NewBountyTab from '@/components/organization/bounties/new/NewBountyTab';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

interface BountyDraftPageProps {
  params: Promise<{ id: string; draftId: string }>;
}

const BountyDraftPage = async ({ params }: BountyDraftPageProps) => {
  const { id, draftId } = await params;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div>
        <Suspense fallback={<Loading />}>
          <NewBountyTab organizationId={id} draftId={draftId} />
        </Suspense>
      </div>
    </AuthGuard>
  );
};

export default BountyDraftPage;
