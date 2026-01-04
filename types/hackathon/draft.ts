// Hackathon Draft Types
import type {
  HackathonInformation,
  HackathonTimeline,
  HackathonParticipation,
  HackathonRewards,
  HackathonResources,
  HackathonJudging,
  HackathonCollaboration,
} from './core';

export interface HackathonDraftData {
  information?: HackathonInformation;
  timeline?: HackathonTimeline;
  participation?: HackathonParticipation;
  rewards?: HackathonRewards;
  resources?: HackathonResources;
  judging?: HackathonJudging;
  collaboration?: HackathonCollaboration;
}

export interface HackathonDraft {
  id: string;
  status: 'draft';
  currentStep: number;
  completedSteps: string[];
  data: HackathonDraftData;
  isValidForPublish: boolean;
  validationErrors: Record<string, Array<{ field: string; message: string }>>;
  createdAt: string;
  updatedAt: string;
}

export type CreateDraftRequest = Partial<HackathonDraftData>;
export type UpdateDraftRequest = Partial<HackathonDraftData>;
