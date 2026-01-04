'use client';

import { useState } from 'react';
import { DeleteCommentResponse, UseDeleteCommentReturn } from '@/types/comment';
import { deleteComment as deleteCommentApi } from '@/lib/api/comment';

export function useDeleteComment(): UseDeleteCommentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteComment = async (
    commentId: string
  ): Promise<DeleteCommentResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteCommentApi(commentId);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteComment,
    loading,
    error,
  };
}
