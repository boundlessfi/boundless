import { useMemo } from 'react';
import type { JudgingCriterion } from '@/lib/api/hackathons';

interface UseScoreCalculationProps {
  criteria: JudgingCriterion[];
  scores: Record<string, number | string>;
}

export const useScoreCalculation = ({
  criteria,
  scores,
}: UseScoreCalculationProps) => {
  const totalScore = useMemo(() => {
    if (criteria.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach(criterion => {
      const score =
        typeof scores[criterion.title] === 'number'
          ? (scores[criterion.title] as number)
          : 0;
      totalWeightedScore += score * criterion.weight;
      totalWeight += criterion.weight;
    });

    return totalWeight > 0 ? totalWeightedScore / 100 : 0;
  }, [criteria, scores]);

  const percentage = useMemo(() => Math.round(totalScore), [totalScore]);

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-success-500';
    if (percentage >= 60) return 'bg-primary';
    if (percentage >= 40) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return {
    totalScore,
    percentage,
    getScoreColor,
  };
};
