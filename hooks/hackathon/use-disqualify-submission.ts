import { useState } from 'react';
import { toast } from 'sonner';
import {
  disqualifyHackathonSubmission,
  type DisqualifySubmissionRequest,
  type DisqualifySubmissionResponse,
} from '@/lib/api/hackathons';

export function useDisqualifySubmission() {
  const [isDisqualifying, setIsDisqualifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disqualify = async (
    organizationId: string,
    hackathonId: string,
    submissionId: string,
    data: DisqualifySubmissionRequest
  ): Promise<DisqualifySubmissionResponse> => {
    setIsDisqualifying(true);
    setError(null);

    try {
      const result = await disqualifyHackathonSubmission(
        organizationId,
        hackathonId,
        submissionId,
        data
      );
      toast.success(result.message || 'Submission disqualified successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to disqualify submission';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDisqualifying(false);
    }
  };

  return { disqualify, isDisqualifying, error };
}
