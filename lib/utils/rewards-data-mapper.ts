import { JudgingSubmission } from '@/lib/api/hackathons';
import { Submission } from '@/components/organization/hackathons/rewards/types';

/**
 * Maps JudgingSubmission from API to Submission type for rewards page
 */
export const mapJudgingSubmissionToRewardSubmission = (
  judgingSubmission: JudgingSubmission
): Submission => {
  const sub = judgingSubmission as any;
  const participant = sub.participant || sub;
  const submissionData = sub.submission || sub;
  const userProfile =
    participant.user?.profile || participant.submitterProfile || {};

  // Get participant name - exhaustively like JudgingParticipant.tsx
  let pName = 'Unknown';
  if (participant.name && participant.name !== submissionData.projectName) {
    pName = participant.name;
  } else if (
    participant.user?.name &&
    participant.user.name !== submissionData.projectName
  ) {
    pName = participant.user.name;
  } else if (userProfile.firstName || userProfile.lastName) {
    pName =
      `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  } else if (
    participant.submitterName &&
    participant.submitterName !== submissionData.projectName
  ) {
    pName = participant.submitterName;
  } else if (participant.name) {
    pName = participant.name; // Use it as last resort if no other info
  } else if (
    userProfile.username ||
    participant.username ||
    (participant.user as any)?.username
  ) {
    pName =
      userProfile.username ||
      participant.username ||
      (participant.user as any)?.username;
  }
  const name = pName || 'Unknown';

  // Get avatar - exhaustively
  const avatar =
    participant.image ||
    participant.user?.image ||
    userProfile.avatar ||
    userProfile.image ||
    participant.submitterAvatar ||
    '';

  // Get submission title
  const submissionTitle = submissionData.projectName || 'Untitled Project';

  // Map average score
  const averageScore = sub.averageScore ?? 0;
  const score = Math.round(Number(averageScore));
  const maxScore = 100;

  return {
    id: participant.id || sub.id || '',
    participantId: participant.id || sub.id || '',
    name,
    projectName: submissionData.projectName || '',
    avatar,
    score,
    maxScore,
    averageScore: Number(averageScore),
    judgeCount: sub.judgeCount,
    rank: submissionData.rank,
    submissionTitle,
    category: submissionData.category || sub.category || 'General',
    commentCount: sub.commentCount || 0,
  };
};

/**
 * Maps array of JudgingSubmissions to Submissions
 */
export const mapJudgingSubmissionsToRewardSubmissions = (
  judgingSubmissions: JudgingSubmission[]
): Submission[] => {
  if (!Array.isArray(judgingSubmissions)) return [];
  return judgingSubmissions.map(mapJudgingSubmissionToRewardSubmission);
};
