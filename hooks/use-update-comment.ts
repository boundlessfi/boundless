'use client';

import { useState } from 'react';
import {
  UpdateCommentRequest,
  UpdateCommentResponse,
  UseUpdateCommentReturn,
} from '@/types/comment';
import { updateComment as updateCommentApi } from '@/lib/api/comment';

export function useUpdateComment(): UseUpdateCommentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateComment = async (
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<UpdateCommentResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateCommentApi(commentId, data);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateComment,
    loading,
    error,
  };
}
