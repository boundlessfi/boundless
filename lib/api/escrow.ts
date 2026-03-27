import { api } from '@/lib/api/api';

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

// =========================================================================
// Types
// =========================================================================

export interface EscrowPool {
  poolId: string;
  owner: string;
  module: string;
  totalDeposited: string;
  totalReleased: string;
  totalRefunded: string;
  locked: boolean;
  asset: string;
}

export interface EscrowSlot {
  recipient: string;
  amount: string;
  released: boolean;
}

export interface MilestoneSlot {
  recipient: string;
  amount: string;
}

export interface InitializeEscrowParams {
  module: 'Bounty' | 'Crowdfund' | 'Grant' | 'Hackathon';
  moduleId?: string;
  totalAmount: string;
  asset?: string;
  milestones: MilestoneSlot[];
}

export interface InitializeEscrowResponse {
  poolId: string;
  module: string;
  totalAmount: string;
  milestones: number;
}

export interface FundPoolParams {
  poolId: string;
  amount: string;
  asset?: string;
}

export interface ReleaseSlotParams {
  poolId: string;
  slotIndex: number;
}

export interface RefundParams {
  poolId: string;
}

// =========================================================================
// API calls
// =========================================================================

export const getPool = async (poolId: string): Promise<EscrowPool> => {
  const { data } = await api.get<EscrowPool | BackendWrapped<EscrowPool>>(
    `escrow/pool/${poolId}`
  );
  return unwrap(data);
};

export const getSlot = async (
  poolId: string,
  index: number
): Promise<EscrowSlot> => {
  const { data } = await api.get<EscrowSlot | BackendWrapped<EscrowSlot>>(
    `escrow/pool/${poolId}/slot/${index}`
  );
  return unwrap(data);
};

export const isPoolLocked = async (
  poolId: string
): Promise<{ locked: boolean }> => {
  const { data } = await api.get<
    { locked: boolean } | BackendWrapped<{ locked: boolean }>
  >(`escrow/pool/${poolId}/locked`);
  return unwrap(data);
};

export const getFeeConfig = async (): Promise<Record<string, unknown>> => {
  const { data } = await api.get<
    Record<string, unknown> | BackendWrapped<Record<string, unknown>>
  >('escrow/fee-config');
  return unwrap(data);
};

export const initializeEscrow = async (
  params: InitializeEscrowParams
): Promise<InitializeEscrowResponse> => {
  const { data } = await api.post<
    InitializeEscrowResponse | BackendWrapped<InitializeEscrowResponse>
  >('escrow/initialize', params);
  return unwrap(data);
};

export const fundPool = async (
  params: FundPoolParams
): Promise<{ poolId: string; amount: string; message: string }> => {
  const { data } = await api.post<
    | { poolId: string; amount: string; message: string }
    | BackendWrapped<{ poolId: string; amount: string; message: string }>
  >('escrow/fund', params);
  return unwrap(data);
};

export const lockPool = async (
  poolId: string
): Promise<{ poolId: string; locked: boolean }> => {
  const { data } = await api.post<
    | { poolId: string; locked: boolean }
    | BackendWrapped<{ poolId: string; locked: boolean }>
  >('escrow/lock', { poolId });
  return unwrap(data);
};

export const releaseSlot = async (
  params: ReleaseSlotParams
): Promise<{ poolId: string; slotIndex: number; message: string }> => {
  const { data } = await api.post<
    | { poolId: string; slotIndex: number; message: string }
    | BackendWrapped<{ poolId: string; slotIndex: number; message: string }>
  >('escrow/release', params);
  return unwrap(data);
};

export const refundPool = async (
  params: RefundParams
): Promise<{ poolId: string; message: string }> => {
  const { data } = await api.post<
    | { poolId: string; message: string }
    | BackendWrapped<{ poolId: string; message: string }>
  >('escrow/refund', params);
  return unwrap(data);
};

export const refundRemaining = async (
  params: RefundParams
): Promise<{ poolId: string; message: string }> => {
  const { data } = await api.post<
    | { poolId: string; message: string }
    | BackendWrapped<{ poolId: string; message: string }>
  >('escrow/refund-remaining', params);
  return unwrap(data);
};

export const escrowApi = {
  getPool,
  getSlot,
  isPoolLocked,
  getFeeConfig,
  initializeEscrow,
  fundPool,
  lockPool,
  releaseSlot,
  refundPool,
  refundRemaining,
};
