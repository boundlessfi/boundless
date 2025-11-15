import { useState, useEffect } from 'react';
import { getHackathon, type JudgingCriterion } from '@/lib/api/hackathons';

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
      getHackathon(organizationId, hackathonId)
        .then(response => {
          if (response.success) {
            const criteria = response.data.judging?.criteria || [];
            if (criteria && criteria.length > 0) {
              setLocalCriteria(criteria);
            }
          }
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
