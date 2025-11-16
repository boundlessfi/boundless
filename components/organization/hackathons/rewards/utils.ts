export const calculatePercentage = (score: number, maxScore: number) => {
  return Math.round((score / maxScore) * 100);
};

export const getScoreColor = (percentage: number) => {
  if (percentage >= 60) return 'text-primary';
  return 'text-red-500';
};

export const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-blue-400';
  if (rank === 3) return 'text-red-400';
  return 'text-gray-400';
};
