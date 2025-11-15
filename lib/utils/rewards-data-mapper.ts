import { JudgingSubmission } from '@/lib/api/hackathons';
import { Submission } from '@/components/organization/hackathons/rewards/types';

/**
 * Maps JudgingSubmission from API to Submission type for rewards page
 */
export const mapJudgingSubmissionToRewardSubmission = (
  judgingSubmission: JudgingSubmission
): Submission => {
  const participant = judgingSubmission.participant;
  const submission = judgingSubmission.submission;
  const user = participant.user;

  // Get participant name
  const name =
    participant.participationType === 'team' && participant.teamName
      ? participant.teamName
      : `${user.profile.firstName} ${user.profile.lastName}`.trim() ||
        user.profile.username;

  // Get submission title (use projectName as fallback)
  const submissionTitle = submission.projectName || 'Untitled Project';

  // Map average score (0-100 scale) to score and maxScore
  const averageScore = judgingSubmission.averageScore ?? 0;
  const score = Math.round(averageScore); // Round to integer
  const maxScore = 100; // Judging uses 0-100 scale

  return {
    id: participant._id,
    participantId: participant._id,
    name,
    projectName: submission.projectName,
    avatar: user.profile.avatar,
    score,
    maxScore,
    averageScore,
    judgeCount: judgingSubmission.judgeCount,
    rank: submission.rank, // Use rank from submission object
    submissionTitle,
    walletAddress: undefined, // Will be collected when creating milestones
  };
};

/**
 * Maps array of JudgingSubmissions to Submissions
 */
export const mapJudgingSubmissionsToRewardSubmissions = (
  judgingSubmissions: JudgingSubmission[]
): Submission[] => {
  return judgingSubmissions.map(mapJudgingSubmissionToRewardSubmission);
};
