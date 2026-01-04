'use client';

import { useState } from 'react';
import {
  ReactionType,
  AddReactionResponse,
  RemoveReactionResponse,
  GetReactionsResponse,
  UseReactionsReturn,
} from '@/types/comment';
import { addReaction, removeReaction, getReactions } from '@/lib/api/comment';

export function useCommentReactions(): UseReactionsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReactionToComment = async (
    commentId: string,
    reactionType: ReactionType
  ): Promise<AddReactionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await addReaction(commentId, { reactionType });
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add reaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeReactionFromComment = async (
    commentId: string,
    reactionType: ReactionType
  ): Promise<RemoveReactionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await removeReaction(commentId, reactionType);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove reaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCommentReactions = async (
    commentId: string
  ): Promise<GetReactionsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReactions(commentId);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get reactions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addReaction: addReactionToComment,
    removeReaction: removeReactionFromComment,
    getReactions: getCommentReactions,
    loading,
    error,
  };
}
