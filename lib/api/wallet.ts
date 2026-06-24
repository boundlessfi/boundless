import { api } from '@/lib/api/api';
import type {
  WalletBalance,
  WalletData,
  WalletTransaction,
} from '@/types/wallet';

export interface WalletApiResponse {
  address: string;
  balances?: WalletBalance[];
  transactions?: WalletTransaction[];
}

export interface WalletDetailsResponse extends WalletData {
  address: string;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
}

export interface SupportedTrustlineAsset {
  assetCode: string;
  name?: string;
}

export interface ValidateSendDestinationResponse {
  valid: boolean;
  activated?: boolean;
  hasTrustline?: boolean;
}

export interface SendFundsRequest {
  destinationPublicKey: string;
  amount: number;
  currency: string;
  memo?: string;
  memoRequired?: boolean;
  idempotencyKey?: string;
}

/** Backend wraps payload in { success, message, data, meta } */
interface BackendWrapped<T> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: unknown;
}

const unwrap = <T>(body: T | BackendWrapped<T>): T => {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data !== undefined
  ) {
    return (body as BackendWrapped<T>).data;
  }
  return body as T;
};

export const getWallet = async (): Promise<WalletApiResponse> => {
  const { data } = await api.get<
    WalletApiResponse | BackendWrapped<WalletApiResponse>
  >('wallet');
  return unwrap(data);
};

export const getWalletDetails = async (): Promise<WalletDetailsResponse> => {
  const { data } = await api.get<
    WalletDetailsResponse | BackendWrapped<WalletDetailsResponse>
  >('wallet/details');
  return unwrap(data);
};

export const syncWallet = async (): Promise<{ success: boolean }> => {
  const { data } = await api.post<
    { success: boolean } | BackendWrapped<{ success: boolean }>
  >('wallet/sync');
  return unwrap(data);
};

export const getSupportedTrustlineAssets = async (): Promise<
  SupportedTrustlineAsset[]
> => {
  const { data } = await api.get<
    SupportedTrustlineAsset[] | BackendWrapped<SupportedTrustlineAsset[]>
  >('wallet/trustline/supported');
  const list = unwrap(data);
  return Array.isArray(list) ? list : [];
};

export const addTrustline = async (
  assetCode: string
): Promise<{ success: boolean }> => {
  const { data } = await api.post<
    { success: boolean } | BackendWrapped<{ success: boolean }>
  >('wallet/trustline', {
    assetCode,
  });
  return unwrap(data);
};

export const validateSendDestination = async (
  destinationPublicKey: string,
  currency: string
): Promise<ValidateSendDestinationResponse> => {
  const query = new URLSearchParams({
    destinationPublicKey,
    currency,
  }).toString();
  const { data } = await api.get<
    | ValidateSendDestinationResponse
    | BackendWrapped<ValidateSendDestinationResponse>
  >(`wallet/send/validate?${query}`);
  return unwrap(data);
};

export const sendFunds = async (
  params: SendFundsRequest
): Promise<Record<string, unknown>> => {
  const { data } = await api.post<
    Record<string, unknown> | BackendWrapped<Record<string, unknown>>
  >('wallet/send', params);
  return unwrap(data);
};

export const walletApi = {
  getWallet,
  getWalletDetails,
  syncWallet,
  getSupportedTrustlineAssets,
  addTrustline,
  validateSendDestination,
  sendFunds,
};
