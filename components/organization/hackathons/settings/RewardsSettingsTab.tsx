'use client';

import React from 'react';
import RewardsTab from '@/components/organization/hackathons/new/tabs/RewardsTab';
import { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';

interface RewardsSettingsTabProps {
  organizationId?: string;
  hackathonId?: string;
  initialData?: RewardsFormData;
  onSave?: (data: RewardsFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RewardsSettingsTab({
  initialData,
  onSave,
  isLoading = false,
}: RewardsSettingsTabProps) {
  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>Rewards & Prizes</h2>
        <p className='mt-1 text-sm text-gray-400'>
          Configure prize tiers, amounts, and judging criteria.
        </p>
      </div>

      <RewardsTab
        initialData={initialData}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
