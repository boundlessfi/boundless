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
  category?: string;
  commentCount?: number;
  // ── Track winner enrichment (post-publish only) ──
  // Populated by useHackathonRewards from the published winners
  // payload. `rank` stays null for track winners (their win lives on
  // SubmissionTrackEntry.wonRank, not submission.rank), so consumers
  // that need to count winners must OR `rank` with `isTrackWinner`.
  isTrackWinner?: boolean;
  trackId?: string;
  trackName?: string;
  trackPrize?: string;
  /** Placement within the track. Currently always 1 in P1. */
  trackWonRank?: number;
}
