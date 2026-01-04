// Judging Types
import type { JudgingCriterion } from './core';

export interface CriterionScore {
  criterionTitle: string;
  score: number; // 0-100
}

export interface JudgeScore {
  id: string;
  judge: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  };
  scores: CriterionScore[];
  weightedScore: number;
  notes?: string;
  judgedAt: string;
  updatedAt: string;
}

export interface JudgingSubmission {
  participant: {
    id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    participationType: 'individual' | 'team';
    teamId?: string;
    teamName?: string;
  };
  submission: {
    id: string;
    projectName: string;
    category: string;
    description: string;
    logo?: string;
    videoUrl?: string;
    introduction?: string;
    links?: Array<{ type: string; url: string }>;
    submissionDate: string;
    status: 'shortlisted';
    rank?: number;
  };
  criteria: JudgingCriterion[];
  scores: JudgeScore[];
  averageScore: number | null;
  judgeCount: number;
}

export interface SubmissionScoresResponse {
  participant: {
    id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    participationType: 'individual' | 'team';
    teamId?: string;
    teamName?: string;
    submission: {
      id: string;
      projectName: string;
      category: string;
      description: string;
      logo?: string;
      videoUrl?: string;
      introduction?: string;
      links?: Array<{ type: string; url: string }>;
      submissionDate: string;
      status: 'shortlisted';
    };
  };
  criteria: JudgingCriterion[];
  scores: JudgeScore[];
  statistics: {
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
    judgeCount: number;
  };
}

export interface GradeSubmissionRequest {
  scores: CriterionScore[];
  notes?: string;
}

export interface GradeSubmissionResponse {
  submission: {
    id: string;
    projectName: string;
    category: string;
    status: 'shortlisted';
  };
  score: {
    id: string;
    weightedScore: number;
    scores: CriterionScore[];
    judgedBy: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    notes?: string;
    judgedAt: string;
    updatedAt: string;
  };
  statistics: {
    averageScore: number;
    judgeCount: number;
  };
}
