import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  submitGrade,
  type CriterionScore,
  type JudgingCriterion,
} from '@/lib/api/hackathons';

interface UseScoreFormProps {
  scores: Record<string, number | string>;
  setScores: React.Dispatch<
    React.SetStateAction<Record<string, number | string>>
  >;
  criteria: JudgingCriterion[];
  organizationId: string;
  hackathonId: string;
  participantId: string;
  existingScore: { scores: CriterionScore[]; notes?: string } | null;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useScoreForm = ({
  scores,
  setScores,
  criteria,
  organizationId,
  hackathonId,
  participantId,
  existingScore,
  onSuccess,
  onClose,
}: UseScoreFormProps) => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | null>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const handleScoreChange = (
    criterionTitle: string,
    value: string | number
  ) => {
    let numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (value === '' || isNaN(numValue)) {
      setScores(prev => ({ ...prev, [criterionTitle]: '' }));
      setValidationErrors(prev => ({ ...prev, [criterionTitle]: null }));
      return;
    }

    numValue = Math.max(0, Math.min(100, numValue));

    setScores(prev => ({ ...prev, [criterionTitle]: numValue }));
    setValidationErrors(prev => ({ ...prev, [criterionTitle]: null }));
  };

  const handleInputBlur = (criterionTitle: string) => {
    const value = scores[criterionTitle];
    if (value === '' || value === null || value === undefined) {
      setScores(prev => ({ ...prev, [criterionTitle]: 0 }));
    }
    setFocusedInput(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    criterionTitle: string,
    onSubmit: () => void
  ) => {
    const currentScore =
      typeof scores[criterionTitle] === 'number'
        ? (scores[criterionTitle] as number)
        : 0;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleScoreChange(criterionTitle, Math.min(100, currentScore + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleScoreChange(criterionTitle, Math.max(0, currentScore - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = criteria.findIndex(c => c.title === criterionTitle);
      if (currentIndex < criteria.length - 1) {
        setFocusedInput(criteria[currentIndex + 1].title);
      } else {
        onSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    criteria.forEach(criterion => {
      const value = scores[criterion.title];
      if (value === '' || value === null || value === undefined) {
        errors[criterion.title] = 'Required';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      toast.error('Please fill in all required scores');
      return;
    }

    setIsLoading(true);

    try {
      const scoreData: CriterionScore[] = criteria.map(criterion => ({
        criterionTitle: criterion.title,
        score:
          typeof scores[criterion.title] === 'number'
            ? (scores[criterion.title] as number)
            : 0,
      }));

      const response = await submitGrade(
        organizationId,
        hackathonId,
        participantId,
        {
          scores: scoreData,
        }
      );

      if (response.success) {
        setShowSuccess(true);
        toast.success(
          existingScore
            ? 'Grade updated successfully'
            : 'Grade submitted successfully',
          {
            duration: 2000,
          }
        );

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit grade. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (criteria.length > 0) {
      setFocusedInput(criteria[0].title);
    }
  }, [criteria]);

  return {
    focusedInput,
    setFocusedInput,
    showSuccess,
    validationErrors,
    isLoading,
    handleScoreChange,
    handleInputBlur,
    handleKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      criterionTitle: string
    ) => handleKeyDown(e, criterionTitle, handleSubmit),
    handleSubmit,
  };
};
