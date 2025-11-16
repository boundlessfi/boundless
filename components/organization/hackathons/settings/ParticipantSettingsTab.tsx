'use client';

import React from 'react';
import ParticipantTab from '@/components/organization/hackathons/new/tabs/ParticipantTab';
import { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';

interface ParticipantSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  initialData?: ParticipantFormData;
  onSave?: (data: ParticipantFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ParticipantSettingsTab({
  initialData,
  onSave,
  isLoading = false,
}: ParticipantSettingsTabProps) {
  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white'>
          Participant Settings
        </h2>
        <p className='mt-1 text-sm text-gray-400'>
          Configure participant types, team settings, requirements, and tab
          visibility.
        </p>
      </div>

      <ParticipantTab
        initialData={initialData}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
