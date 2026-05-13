import { useMemo } from 'react';
import type { JudgingCriterion } from '@/lib/api/hackathons';

interface UseScoreCalculationProps {
  criteria: JudgingCriterion[];
  scores: Record<string, number | string>;
}

/**
 * Weighted-average scoring math for the legacy grading modal.
 *
 * `totalScore` is a 0-10 weighted average: each criterion's score is in
 * 0-10, and the contribution is `score * weight / sum(weights)`. The
 * answer stays in 0-10 regardless of what scale the weights are entered
 * on (the previous implementation divided by a hardcoded 10, which only
 * gave correct totals when weights happened to sum to 100).
 *
 * `percentage` is the same value expressed as 0-100 for the progress bar
 * and color tone thresholds.
 *
 * `getWeightPercent(criterion)` returns the display "% weight" — the
 * relative contribution of the criterion, which is what an organizer or
 * judge actually wants to see. With weights `[1, 1]` it returns `50%`
 * each; with `[50, 50]` it also returns `50%` each.
 */
export const useScoreCalculation = ({
  criteria,
  scores,
}: UseScoreCalculationProps) => {
  const totalWeight = useMemo(
    () =>
      criteria.reduce(
        (sum, c) => sum + (typeof c.weight === 'number' ? c.weight : 0),
        0
      ),
    [criteria]
  );

  const totalScore = useMemo(() => {
    if (criteria.length === 0 || totalWeight === 0) return 0;

    let weightedSum = 0;
    criteria.forEach(criterion => {
      const score =
        typeof scores[criterion.id] === 'number'
          ? (scores[criterion.id] as number)
          : 0;
      weightedSum += score * (criterion.weight ?? 0);
    });

    // Result is in 0-10 regardless of the absolute weight scale.
    return weightedSum / totalWeight;
  }, [criteria, scores, totalWeight]);

  const percentage = useMemo(() => Math.round(totalScore * 10), [totalScore]);

  const getWeightPercent = (criterion: JudgingCriterion): number => {
    if (totalWeight === 0) return 0;
    return Math.round(((criterion.weight ?? 0) / totalWeight) * 100);
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-primary text-background';
    if (percentage >= 60) return 'bg-chart-2 text-white';
    if (percentage >= 40) return 'bg-warning-500 text-background';
    return 'bg-error-500 text-white';
  };

  return {
    totalScore,
    percentage,
    totalWeight,
    getWeightPercent,
    getScoreColor,
  };
};
