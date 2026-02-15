import { useState, useEffect } from 'react';
import {
  getJudgingCriteria,
  type JudgingCriterion,
} from '@/lib/api/hackathons/judging';

interface UseJudgingCriteriaProps {
  open: boolean;
  organizationId: string;
  hackathonId: string;
  initialCriteria?: JudgingCriterion[];
}

export const useJudgingCriteria = ({
  open,
  organizationId,
  hackathonId,
  initialCriteria,
}: UseJudgingCriteriaProps) => {
  const [localCriteria, setLocalCriteria] = useState<JudgingCriterion[]>(
    initialCriteria || []
  );
  const [isFetchingCriteria, setIsFetchingCriteria] = useState(false);

  useEffect(() => {
    if (initialCriteria && initialCriteria.length > 0) {
      setLocalCriteria(initialCriteria);
    }
  }, [initialCriteria]);

  useEffect(() => {
    if (
      open &&
      organizationId &&
      hackathonId &&
      (!localCriteria || localCriteria.length === 0)
    ) {
      setIsFetchingCriteria(true);
      getJudgingCriteria(hackathonId)
        .then((criteria: JudgingCriterion[]) => {
          // Double check that we have an array
          setLocalCriteria(Array.isArray(criteria) ? criteria : []);
        })
        .catch(() => {})
        .finally(() => {
          setIsFetchingCriteria(false);
        });
    }
  }, [open, organizationId, hackathonId, localCriteria]);

  return {
    criteria: localCriteria,
    isFetchingCriteria,
  };
};
