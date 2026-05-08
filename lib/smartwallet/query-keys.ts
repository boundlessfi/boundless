export const qk = {
  assets: () => ['assets'] as const,

  balances: (contractId: string) => ['balances', contractId] as const,

  transactions: (contractId: string) => ['transactions', contractId] as const,

  credentials: () => ['credentials'] as const,
  credential: (credentialId: string) => ['credentials', credentialId] as const,

  rules: (contractId: string) => ['rules', contractId] as const,
  contractDetails: (contractId: string) =>
    ['contractDetails', contractId] as const,
} as const;
