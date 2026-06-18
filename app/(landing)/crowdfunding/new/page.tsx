import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth';
import { Suspense } from 'react';
import NewCampaignWizard from '@/components/crowdfunding/new/NewCampaignWizard';

export const metadata: Metadata = {
  title: 'New Campaign | Boundless',
  description: 'Create a new crowdfunding campaign on Boundless',
};

export default function NewCampaignPage() {
  return (
    <AuthGuard
      redirectTo='/auth?mode=signin'
      fallback={<div className='p-8 text-center'>Authenticating...</div>}
    >
      <Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
        <NewCampaignWizard />
      </Suspense>
    </AuthGuard>
  );
}
