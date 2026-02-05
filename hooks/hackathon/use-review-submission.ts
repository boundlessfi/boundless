import { useState } from 'react';
import { toast } from 'sonner';
import {
  reviewSubmission,
  type ReviewSubmissionRequest,
  type ReviewSubmissionResponse,
} from '@/lib/api/hackathons';

export function useReviewSubmission() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = async (
    organizationId: string,
    hackathonId: string,
    submissionId: string,
    data: ReviewSubmissionRequest
  ): Promise<ReviewSubmissionResponse> => {
    setIsReviewing(true);
    setError(null);

    try {
      const result = await reviewSubmission(
        organizationId,
        hackathonId,
        submissionId,
        data
      );
      toast.success(result.message || 'Submission reviewed successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to review submission';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsReviewing(false);
    }
  };

  return { review, isReviewing, error };
}
