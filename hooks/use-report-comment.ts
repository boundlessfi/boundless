'use client';

import { useState } from 'react';
import {
  ReportCommentRequest,
  ReportCommentResponse,
  UseReportCommentReturn,
} from '@/types/comment';
import { reportComment as reportCommentApi } from '@/lib/api/comment';

export function useReportComment(): UseReportCommentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportComment = async (
    commentId: string,
    data: ReportCommentRequest
  ): Promise<ReportCommentResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportCommentApi(commentId, data);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to report comment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reportComment,
    loading,
    error,
  };
}
