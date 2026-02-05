import { useState } from 'react';
import { toast } from 'sonner';
import {
  bulkActionSubmissions,
  type BulkActionRequest,
  type BulkActionResponse,
} from '@/lib/api/hackathons';

export function useBulkAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performBulkAction = async (
    organizationId: string,
    hackathonId: string,
    data: BulkActionRequest
  ): Promise<BulkActionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await bulkActionSubmissions(
        organizationId,
        hackathonId,
        data
      );
      toast.success(result.message || 'Bulk action completed successfully');
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to perform bulk action';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { performBulkAction, isLoading, error };
}
