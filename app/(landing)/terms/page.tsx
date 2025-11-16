import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import { InitializeEscrowButton } from '@/components/escrow/InitializeEscrowButton';
import { EscrowDisplay } from '@/components/escrow/EscrowDisplay';
import { FundEscrowButton } from '@/components/escrow/FundEscrowButton';
import { ChangeMilestoneStatus } from '@/components/escrow/ChangeMilestoneStatus';
import { ApproveMilestone } from '@/components/escrow/ApproveMilestone';
import { ReleaseFunds } from '@/components/escrow/ReleaseFunds';
import { StartDispute } from '@/components/escrow/StartDispute';
import { ResolveDispute } from '@/components/escrow/ResolveDispute';

export const metadata: Metadata = generatePageMetadata('terms');

const TermsPage = () => {
  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 text-center text-4xl font-bold text-white md:px-[50px] lg:px-[100px]'>
      <div className='space-y-6'>
        <InitializeEscrowButton />
        <EscrowDisplay />
        <FundEscrowButton />
        <ChangeMilestoneStatus />
        <ApproveMilestone />
        <ReleaseFunds />
        <StartDispute />
        <ResolveDispute />
      </div>
    </div>
  );
};

export default TermsPage;
