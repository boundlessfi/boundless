'use client';

import { useState } from 'react';
import {
  CreateCommentRequest,
  CreateCommentResponse,
  UseCreateCommentReturn,
} from '@/types/comment';
import { createComment as createCommentApi } from '@/lib/api/comment';

export function useCreateComment(): UseCreateCommentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = async (
    data: CreateCommentRequest
  ): Promise<CreateCommentResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createCommentApi(data);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComment,
    loading,
    error,
  };
}
