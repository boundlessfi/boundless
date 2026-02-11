export interface WalletBalance {
  asset_type: 'credit_alphanum4' | 'credit_alphanum12' | 'native';
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
  usdPrice?: number;
  usdValue?: number;
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | string;
  amount: string;
  currency: string;
  state: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  externalTxId?: string | null;
  idempotencyKey?: string;
  note?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  walletId: string;
}

export interface WalletData {
  address: string;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
}
