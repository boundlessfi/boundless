import api from '../api';
import { ApiResponse, PaginatedResponse } from '../types';

// Judging API Types
export interface JudgingCriterion {
  title: string;
  weight: number; // 0-100
  description?: string;
}

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
  };
  allScores: JudgeScore[];
  averageScore: number;
}

export interface GetJudgingSubmissionsResponse extends PaginatedResponse<JudgingSubmission> {
  success: true;
}

export interface GetSubmissionScoresResponse extends ApiResponse<SubmissionScoresResponse> {
  success: true;
  data: SubmissionScoresResponse;
  message: string;
}

export interface SubmitGradeResponse extends ApiResponse<GradeSubmissionResponse> {
  success: true;
  data: GradeSubmissionResponse;
  message: string;
}

// Participant interface (needed for shortlist/disqualify response)
export interface Participant {
  id: string;
  userId: string;
  hackathonId: string;
  organizationId: string;
  user: {
    id: string;
    profile: {
      name: string;
      username: string;
      image?: string;
    };
    email: string;
  };
  socialLinks?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
  participationType: 'individual' | 'team';
  teamId?: string;
  teamName?: string;
  submission?: {
    status?: string;
    [key: string]: any;
  };
  registeredAt: string;
  submittedAt?: string;
}

/**
 * Shortlist a submission for judging
 */
export const shortlistSubmission = async (
  organizationId: string,
  hackathonId: string,
  participantId: string
): Promise<ApiResponse<Participant>> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants/${participantId}/shortlist`
  );
  return res.data;
};

/**
 * Disqualify a submission with optional comment
 */
export const disqualifySubmission = async (
  organizationId: string,
  hackathonId: string,
  participantId: string,
  comment?: string
): Promise<ApiResponse<Participant>> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants/${participantId}/disqualify`,
    comment ? { comment } : {}
  );
  return res.data;
};

/**
 * Get shortlisted submissions for judging
 */
export const getJudgingSubmissions = async (
  organizationId: string,
  hackathonId: string,
  page = 1,
  limit = 10
): Promise<GetJudgingSubmissionsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions?${params.toString()}`
  );
  return res.data;
};

/**
 * Submit or update grade for a shortlisted submission
 */
export const submitGrade = async (
  organizationId: string,
  hackathonId: string,
  participantId: string,
  data: GradeSubmissionRequest
): Promise<SubmitGradeResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions/${participantId}/grade`,
    data
  );
  return res.data;
};

/**
 * Get all scores for a specific submission
 */
export const getSubmissionScores = async (
  organizationId: string,
  hackathonId: string,
  participantId: string
): Promise<GetSubmissionScoresResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions/${participantId}/scores`
  );
  return res.data;
};
