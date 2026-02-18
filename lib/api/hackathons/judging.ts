import api from '../api';
import { ApiResponse, PaginatedResponse } from '../types';

// Judging API Types
export interface JudgingCriterion {
  id?: string;
  name?: string;
  title: string;
  weight: number; // 0-100
  description?: string;
}

export interface CriterionScore {
  criterionId: string;
  criterionTitle?: string;
  criterionName?: string;
  score: number; // 0-10
  comment?: string;
}

export interface IndividualJudgeScore {
  judgeId: string;
  judgeName: string;
  judgeEmail?: string; // Added to match actual API response
  criteriaScores: CriterionScore[];
  comment?: string; // Qualitative feedback
  totalScore: number;
  submittedAt: string;
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

export interface JudgingResult {
  submissionId: string;
  projectName: string;
  teamId?: string | null;
  participantId: string;
  status: string;
  submittedAt: string;
  averageScore: number;
  totalScore: number;
  judgeCount: number;
  expectedJudgeCount: number;
  judgingProgress: string;
  individualScores: Array<{
    judgeId: string;
    judgeName: string;
    score: number;
  }>;
  scoreVariance: number;
  scoreRange: {
    min: number;
    max: number;
  };
  criteriaBreakdown: Array<{
    criterionId: string;
    averageScore: number;
    min: number;
    max: number;
    variance: number;
  }>;
  rank: number;
  isComplete: boolean;
  isPending: boolean;
  hasDisagreement: boolean;
  prize?: string;
}

export interface AggregatedJudgingResults {
  hackathonId: string;
  totalSubmissions: number;
  submissionsScoredCount: number;
  submissionsPendingCount: number;
  averageScoreAcrossAll: number;
  judgesAssigned: number;
  results: JudgingResult[];
  generatedAt: string;
  metadata: {
    sortedBy: string;
    includesVariance: boolean;
    includesIndividualScores: boolean;
    includesProgressTracking: boolean;
  };
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

export interface CriterionScoreRequest {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface SubmitJudgingScoreRequest {
  submissionId: string;
  criteriaScores: CriterionScoreRequest[];
  comment?: string; // Optional global feedback
}

export interface OverrideSubmissionScoreRequest {
  criteriaScores: CriterionScoreRequest[];
  judgeId?: string;
}

export interface OverrideSubmissionScoreResponse extends ApiResponse<{
  judgingScore?: unknown;
  complianceChecks?: {
    rubricValid?: boolean;
    isOrganizerOverride?: boolean;
  };
}> {}

export interface GetJudgingSubmissionsResponse extends ApiResponse<any> {
  success: true;
  data:
    | JudgingSubmission[]
    | {
        submissions: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetSubmissionScoresResponse extends ApiResponse<
  IndividualJudgeScore[]
> {}

export interface AddJudgeRequest {
  userId: string;
  email: string;
}

export interface AddJudgeResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface RemoveJudgeResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface SubmitGradeResponse extends ApiResponse<GradeSubmissionResponse> {
  success: true;
  data: GradeSubmissionResponse;
  message: string;
}

export interface GetJudgingResultsResponse extends ApiResponse<AggregatedJudgingResults> {}

export interface GetJudgingWinnersResponse extends ApiResponse<
  JudgingResult[]
> {}

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
    status: 'SHORTLISTED',
  });

  const res = await api.get(
    `/hackathons/${hackathonId}/submissions?${params.toString()}`
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
 * Get all scores for a specific submission (individual judge breakdown)
 */
export const getSubmissionScores = async (
  organizationId: string,
  hackathonId: string,
  participantId: string
): Promise<GetSubmissionScoresResponse> => {
  const res = await api.get<
    IndividualJudgeScore[] | ApiResponse<IndividualJudgeScore[]>
  >(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions/${participantId}/scores`
  );

  // Handle raw array response format
  if (Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
      message: 'Scores retrieved successfully',
    } as GetSubmissionScoresResponse;
  }

  return (res.data || {}) as GetSubmissionScoresResponse;
};

/**
 * Get judging criteria for a hackathon
 */
export const getJudgingCriteria = async (
  idOrSlug: string
): Promise<JudgingCriterion[]> => {
  const res = await api.get(`/hackathons/${idOrSlug}/judging/criteria`);
  // Handle both array and wrapped response formats
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return (res.data as any)?.data || [];
};

/**
 * Submit score for a submission
 */
export const submitJudgingScore = async (
  data: SubmitJudgingScoreRequest
): Promise<ApiResponse<any>> => {
  const res = await api.post(`/hackathons/judging/score`, data);
  return res.data;
};

/**
 * Organizer override for submission scores
 */
export const overrideSubmissionScore = async (
  organizationId: string,
  hackathonId: string,
  submissionId: string,
  data: OverrideSubmissionScoreRequest
): Promise<OverrideSubmissionScoreResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/submissions/${submissionId}/score-override`,
    data
  );
  return res.data as OverrideSubmissionScoreResponse;
};

/**
 * Get aggregated judging results for a hackathon
 */
export const getJudgingResults = async (
  organizationId: string,
  hackathonId: string
): Promise<GetJudgingResultsResponse> => {
  const res = await api.get<
    AggregatedJudgingResults | ApiResponse<AggregatedJudgingResults>
  >(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/results`
  );

  // Handle case where backend returns AggregatedJudgingResults directly vs ApiResponse wrapped
  if (res.data && 'results' in res.data) {
    return {
      success: true,
      data: res.data as AggregatedJudgingResults,
      message: 'Results retrieved successfully',
    } as GetJudgingResultsResponse;
  }

  return (res.data || {}) as GetJudgingResultsResponse;
};

/**
 * Add a judge to a hackathon
 */
export const addJudge = async (
  organizationId: string,
  hackathonId: string,
  data: AddJudgeRequest
): Promise<AddJudgeResponse> => {
  const res = await api.post<AddJudgeResponse>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/judges`,
    data
  );
  return res.data;
};

/**
 * Remove a judge from a hackathon
 */
export const removeJudge = async (
  organizationId: string,
  hackathonId: string,
  userId: string
): Promise<RemoveJudgeResponse> => {
  const res = await api.delete<RemoveJudgeResponse>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/judges/${userId}`
  );
  return res.data;
};

/**
 * Get judges list for a hackathon
 */
export const getHackathonJudges = async (
  organizationId: string,
  hackathonId: string
): Promise<ApiResponse<any[]>> => {
  const res = await api.get<any[]>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/judges`
  );

  // If the backend returns a raw array, wrap it in our ApiResponse structure
  if (Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
      message: 'Judges retrieved successfully',
    };
  }

  return res.data as unknown as ApiResponse<any[]>;
};

/**
 * Get winner ranking (finalized results)
 */
export const getJudgingWinners = async (
  organizationId: string,
  hackathonId: string
): Promise<GetJudgingWinnersResponse> => {
  const res = await api.get<
    JudgingResult[] | ApiResponse<JudgingResult[]> | AggregatedJudgingResults
  >(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/winners`
  );

  if (Array.isArray(res.data)) {
    return {
      success: true,
      data: res.data,
      message: 'Winners retrieved successfully',
    } as GetJudgingWinnersResponse;
  }

  if (res.data && 'results' in res.data) {
    return {
      success: true,
      data: (res.data as AggregatedJudgingResults).results || [],
      message: 'Winners retrieved successfully',
    } as GetJudgingWinnersResponse;
  }

  return {
    success: false,
    data: [],
    message: 'No winners found or unexpected response format',
  } as GetJudgingWinnersResponse;
};

/**
 * Publish judging results (finalize rankings)
 */
export const publishJudgingResults = async (
  organizationId: string,
  hackathonId: string
): Promise<ApiResponse<null>> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/publish-results`
  );
  return res.data;
};
