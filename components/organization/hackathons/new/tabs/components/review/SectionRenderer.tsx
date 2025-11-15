'use client';

import React from 'react';
import type { InfoFormData } from '../../schemas/infoSchema';
import type { TimelineFormData } from '../../schemas/timelineSchema';
import type { ParticipantFormData } from '../../schemas/participantSchema';
import type { RewardsFormData } from '../../schemas/rewardsSchema';
import type { JudgingFormData } from '../../schemas/judgingSchema';
import type { CollaborationFormData } from '../../schemas/collaborationSchema';
import InformationSection from './InformationSection';
import TimelineSection from './TimelineSection';
import ParticipationSection from './ParticipationSection';
import RewardsSection from './RewardsSection';
import JudgingSection from './JudgingSection';
import CollaborationSection from './CollaborationSection';
import { formatDate } from '@/lib/utils/format-utils';
import type { REVIEW_SECTION_CONFIG } from '../../constants/review-sections';

type SectionConfig = (typeof REVIEW_SECTION_CONFIG)[number];

interface SectionRendererProps {
  config: SectionConfig;
  data:
    | InfoFormData
    | TimelineFormData
    | ParticipantFormData
    | RewardsFormData
    | JudgingFormData
    | CollaborationFormData
    | undefined;
  onEdit?: (tab: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  config,
  data,
  onEdit,
}) => {
  if (!data) return null;

  switch (config.key) {
    case 'information':
      return (
        <InformationSection
          data={data as InfoFormData}
          onEdit={onEdit ? () => onEdit('information') : undefined}
        />
      );
    case 'timeline':
      return (
        <TimelineSection
          data={data as TimelineFormData}
          onEdit={onEdit ? () => onEdit('timeline') : undefined}
          formatDate={formatDate}
        />
      );
    case 'participation':
      return (
        <ParticipationSection
          data={data as ParticipantFormData}
          onEdit={onEdit ? () => onEdit('participation') : undefined}
        />
      );
    case 'rewards':
      return (
        <RewardsSection
          data={data as RewardsFormData}
          onEdit={onEdit ? () => onEdit('rewards') : undefined}
        />
      );
    case 'judging':
      return (
        <JudgingSection
          data={data as JudgingFormData}
          onEdit={onEdit ? () => onEdit('judging') : undefined}
        />
      );
    case 'collaboration':
      return (
        <CollaborationSection
          data={data as CollaborationFormData}
          onEdit={onEdit ? () => onEdit('collaboration') : undefined}
        />
      );
    default:
      return null;
  }
};
