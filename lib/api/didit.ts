import api from './api';
import type { ApiResponse } from './types';

/** Backend response shape: session is in data, verification URL is "url". */
interface DiditSessionData {
  session_id: string;
  session_number?: number;
  session_token: string;
  url: string;
  vendor_data?: string;
  metadata?: unknown;
  status: string;
  callback?: string;
  workflow_id?: string;
}

export interface DiditCreateSessionResponse {
  session_id: string;
  session_token: string;
  verification_url: string;
  status: string;
}

export interface CreateDiditSessionParams {
  /** Optional user id for vendor_data. If omitted, backend uses authenticated user id. */
  user_id?: string;
}

/**
 * Create a Didit verification session. Backend (NestJS) creates the session and returns
 * session_token and url (mapped to verification_url) for use with @didit-protocol/sdk-web.
 * Requires authentication (cookies sent via api client).
 */
export const createDiditSession = async (
  params?: CreateDiditSessionParams
): Promise<DiditCreateSessionResponse> => {
  const res = await api.post<ApiResponse<DiditSessionData>>(
    '/didit/create-session',
    params ?? {}
  );
  const session = res.data?.data;
  if (!session?.session_token || !session?.url) {
    throw new Error('Invalid session response');
  }
  return {
    session_id: session.session_id,
    session_token: session.session_token,
    verification_url: session.url,
    status: session.status,
  };
};

export type VerificationState =
  | 'not_started'
  | 'in_progress'
  | 'in_review'
  | 'approved'
  | 'declined'
  | 'abandoned'
  | 'expired';

export interface VerificationReviewWindow {
  minBusinessDays: number;
  maxBusinessDays: number;
  estimatedCompletionAt: string;
}

export interface VerificationDecline {
  reason?: string;
  canRetry: boolean;
}

export interface VerificationStatus {
  state: VerificationState;
  canStartNew: boolean;
  message: string;
  verifiedAt?: string;
  reviewedAt?: string;
  reviewWindow?: VerificationReviewWindow;
  decline?: VerificationDecline;
}

export const getDiditStatus = async (): Promise<VerificationStatus> => {
  const res = await api.get<ApiResponse<VerificationStatus>>('/didit/status');
  if (!res.data?.data?.state) {
    throw new Error('Invalid verification status response');
  }
  return res.data.data;
};
