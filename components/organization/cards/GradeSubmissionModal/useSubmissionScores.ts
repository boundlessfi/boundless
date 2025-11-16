import { useState, useEffect } from 'react';
import {
  getSubmissionScores,
  type CriterionScore,
  type JudgingCriterion,
} from '@/lib/api/hackathons';
import { useAuthStore } from '@/lib/stores/auth-store';

interface UseSubmissionScoresProps {
  open: boolean;
  organizationId: string;
  hackathonId: string;
  participantId: string;
  criteria: JudgingCriterion[];
}

interface ExistingScore {
  scores: CriterionScore[];
  notes?: string;
}

export const useSubmissionScores = ({
  open,
  organizationId,
  hackathonId,
  participantId,
  criteria,
}: UseSubmissionScoresProps) => {
  const { user } = useAuthStore();
  const [scores, setScores] = useState<Record<string, number | string>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [existingScore, setExistingScore] = useState<ExistingScore | null>(
    null
  );

  const initializeScores = (criteriaList: JudgingCriterion[]) => {
    const initialScores: Record<string, number> = {};
    criteriaList.forEach(criterion => {
      initialScores[criterion.title] = 0;
    });
    setScores(initialScores);
  };

  useEffect(() => {
    if (
      open &&
      organizationId &&
      hackathonId &&
      participantId &&
      user &&
      criteria.length > 0
    ) {
      setIsFetching(true);
      getSubmissionScores(organizationId, hackathonId, participantId)
        .then(response => {
          if (response.success && response.data.scores) {
            const currentUserScore = response.data.scores.find(
              score => score.judge._id === user.id
            );

            if (currentUserScore) {
              setExistingScore({
                scores: currentUserScore.scores,
                notes: currentUserScore.notes || '',
              });

              const initialScores: Record<string, number> = {};
              currentUserScore.scores.forEach(criterionScore => {
                initialScores[criterionScore.criterionTitle] =
                  criterionScore.score;
              });
              setScores(initialScores);
            } else {
              initializeScores(criteria);
            }
          } else {
            initializeScores(criteria);
          }
        })
        .catch(() => {
          initializeScores(criteria);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [open, organizationId, hackathonId, participantId, user, criteria]);

  useEffect(() => {
    if (!open) {
      setScores({});
      setExistingScore(null);
    }
  }, [open]);

  return {
    scores,
    setScores,
    isFetching,
    existingScore,
  };
};
