import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  overrideSubmissionScore,
  submitJudgingScore,
  type CriterionScore,
  type JudgingCriterion,
} from '@/lib/api/hackathons/judging';

interface UseScoreFormProps {
  scores: Record<string, number | string>;
  setScores: React.Dispatch<
    React.SetStateAction<Record<string, number | string>>
  >;
  comments: Record<string, string>;
  setComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  overallComment: string;
  setOverallComment: React.Dispatch<React.SetStateAction<string>>;
  criteria: JudgingCriterion[];
  organizationId: string;
  hackathonId: string;
  participantId: string;
  existingScore: { scores: CriterionScore[]; notes?: string } | null;
  mode?: 'judge' | 'organizer-override';
  overrideJudgeId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useScoreForm = ({
  scores,
  setScores,
  comments,
  setComments,
  overallComment,
  setOverallComment,
  criteria,
  organizationId,
  hackathonId,
  participantId,
  existingScore,
  mode = 'judge',
  overrideJudgeId,
  onSuccess,
  onClose,
}: UseScoreFormProps) => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | null>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const getCriterionKey = (criterion: JudgingCriterion) => {
    return criterion.id || criterion.name || criterion.title;
  };

  const handleScoreChange = (criterionKey: string, value: string | number) => {
    // If empty string, set it and let scoring section handle it
    if (value === '') {
      setScores(prev => ({ ...prev, [criterionKey]: '' }));
      return;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return;

    // Clamp between 0 and 10
    const clampedValue = Math.min(10, Math.max(0, numValue));

    setScores(prev => ({ ...prev, [criterionKey]: clampedValue }));

    // Clear validation error when user types
    if (validationErrors[criterionKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [criterionKey]: null,
      }));
    }
  };

  const handleCommentChange = (criterionKey: string, value: string) => {
    setComments(prev => ({ ...prev, [criterionKey]: value }));
  };

  const handleInputBlur = (criterionKey: string) => {
    // Ensure the value is properly formatted on blur
    const currentScore = scores[criterionKey];

    if (typeof currentScore === 'number') {
      // Round to 1 decimal place
      const roundedScore = Math.round(currentScore * 10) / 10;
      setScores(prev => ({ ...prev, [criterionKey]: roundedScore }));
    }

    if (focusedInput === criterionKey) {
      setFocusedInput(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    criterionKey: string
  ) => {
    if (e.key === 'Enter') {
      const currentIndex = criteria.findIndex(
        c => getCriterionKey(c) === criterionKey
      );
      if (currentIndex < criteria.length - 1) {
        setFocusedInput(getCriterionKey(criteria[currentIndex + 1]));
      } else {
        // Last input, trigger submit
        handleSubmit();
      }
    }
  };

  const validate = () => {
    const errors: Record<string, string | null> = {};
    let isValid = true;

    criteria.forEach(criterion => {
      const key = getCriterionKey(criterion);
      const score = scores[key];
      if (typeof score !== 'number') {
        errors[key] = 'Score required';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please provide scores for all criteria');
      return;
    }

    setIsLoading(true);

    try {
      const includeComments = mode !== 'organizer-override';
      const scoreData = criteria.map(criterion => {
        const key = getCriterionKey(criterion);
        const payload: {
          criterionId: string;
          score: number;
          comment?: string;
        } = {
          criterionId: criterion.id || criterion.name || criterion.title,
          score: typeof scores[key] === 'number' ? (scores[key] as number) : 0,
        };
        if (includeComments) {
          payload.comment = comments[key] || '';
        }
        return payload;
      });

      const response =
        mode === 'organizer-override'
          ? await overrideSubmissionScore(
              organizationId,
              hackathonId,
              participantId,
              {
                criteriaScores: scoreData,
                judgeId: overrideJudgeId,
              }
            )
          : await submitJudgingScore({
              submissionId: participantId,
              criteriaScores: scoreData,
              comment: overallComment,
            });

      const isSuccess = response.success !== false;

      if (isSuccess) {
        setShowSuccess(true);
        toast.success(
          mode === 'organizer-override'
            ? 'Score override applied successfully'
            : existingScore
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
      } else {
        // Handle API error response
        const errorMessage =
          (response as any)?.message ||
          'Failed to submit grade. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // Handle network or unexpected errors
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit grade. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (criteria.length > 0) {
      setFocusedInput(getCriterionKey(criteria[0]));
    }
  }, [criteria]);

  return {
    focusedInput,
    setFocusedInput,
    showSuccess,
    validationErrors,
    isLoading,
    handleScoreChange,
    handleCommentChange,
    handleInputBlur,
    handleKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      criterionKey: string
    ) => handleKeyDown(e, criterionKey),
    handleSubmit,
  };
};
