export interface Submission {
  id: string;
  name: string;
  projectName: string;
  avatar?: string;
  score: number;
  maxScore: number;
  rank?: number;
  submissionTitle: string;
  participantId?: string;
  walletAddress?: string;
  averageScore?: number;
  judgeCount?: number;
}
