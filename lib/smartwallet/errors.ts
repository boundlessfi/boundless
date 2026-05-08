import {
  WebAuthnError,
  WalletNotConnectedError,
  CredentialNotFoundError,
  SignerNotFoundError,
  SimulationError,
  SubmissionError,
  ValidationError,
  SessionError,
} from 'smart-account-kit';
import { api, type ApiError } from '@/lib/api/api';

export {
  WebAuthnError,
  WalletNotConnectedError,
  CredentialNotFoundError,
  SignerNotFoundError,
  SimulationError,
  SubmissionError,
  ValidationError,
  SessionError,
};

export class WalletApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'WalletApiError';
  }
}

export function parseWalletError(error: unknown): string {
  if (error instanceof WebAuthnError)
    return 'Passkey failed. Please try again.';
  if (error instanceof WalletNotConnectedError)
    return 'No wallet connected. Please connect first.';
  if (error instanceof CredentialNotFoundError)
    return 'Credential not found. Try reconnecting.';
  if (error instanceof SignerNotFoundError)
    return 'Signer not found on this wallet.';
  if (error instanceof SimulationError)
    return 'Transaction simulation failed. Check your balance.';
  if (error instanceof SubmissionError)
    return 'Transaction failed to submit. Please try again.';
  if (error instanceof ValidationError)
    return 'Invalid input. Please check the values entered.';
  if (error instanceof SessionError)
    return 'Session expired. Please reconnect your wallet.';
  if (error instanceof WalletApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export async function fetchOrThrow<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const path = input.replace(/^\/api(?=\/|$)/, '') || '/';
  const body = init?.body
    ? typeof init.body === 'string'
      ? safeJsonParse(init.body)
      : init.body
    : undefined;

  try {
    switch (method) {
      case 'GET':
        return (await api.get<T>(path)).data;
      case 'POST':
        return (await api.post<T>(path, body)).data;
      case 'PUT':
        return (await api.put<T>(path, body)).data;
      case 'PATCH':
        return (await api.patch<T>(path, body)).data;
      case 'DELETE':
        return (await api.delete<T>(path)).data;
      default:
        throw new WalletApiError(`Unsupported method: ${method}`);
    }
  } catch (err) {
    if (err instanceof WalletApiError) throw err;
    if (err && typeof err === 'object' && 'status' in err) {
      const apiErr = err as ApiError;
      throw new WalletApiError(apiErr.message, apiErr.status, apiErr.code);
    }
    throw err instanceof Error ? err : new WalletApiError('Request failed');
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
