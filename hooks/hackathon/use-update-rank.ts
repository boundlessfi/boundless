import { useState } from 'react';
import { toast } from 'sonner';
import {
  updateSubmissionRank,
  type UpdateRankResponse,
} from '@/lib/api/hackathons';

export function useUpdateRank() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRank = async (
    organizationId: string,
    hackathonId: string,
    submissionId: string,
    rank: number
  ): Promise<UpdateRankResponse> => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateSubmissionRank(
        organizationId,
        hackathonId,
        submissionId,
        rank
      );
      toast.success('Rank updated successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update rank';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateRank, isUpdating, error };
}
