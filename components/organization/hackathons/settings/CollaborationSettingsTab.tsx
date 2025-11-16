'use client';

import React from 'react';
import CollaborationTab from '@/components/organization/hackathons/new/tabs/CollaborationTab';
import { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

interface CollaborationSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  initialData?: CollaborationFormData;
  onSave?: (data: CollaborationFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CollaborationSettingsTab({
  initialData,
  onSave,
  isLoading = false,
}: CollaborationSettingsTabProps) {
  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>Collaboration</h2>
        <p className='mt-1 text-sm text-gray-400'>
          Manage sponsors and partners for your hackathon.
        </p>
      </div>

      <CollaborationTab
        initialData={initialData}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
