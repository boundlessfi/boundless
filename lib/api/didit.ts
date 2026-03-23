import api from './api';
import type { ApiResponse } from './types';

/** Backend response shape from POST /didit/create-session. */
interface DiditSessionData {
  session_id: string;
  session_number?: number;
  session_token: string;
  verification_url: string;
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
  if (!session?.session_token || !session?.verification_url) {
    throw new Error('Invalid session response');
  }
  return {
    session_id: session.session_id,
    session_token: session.session_token,
    verification_url: session.verification_url,
    status: session.status,
  };
};
