import { type SmartAccountConfig } from 'smart-account-kit';

const isMainnet =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ||
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet';

export const walletConfig: SmartAccountConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL!,
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE!,
  accountWasmHash: process.env.NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH!,
  webauthnVerifierAddress: process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS!,
  rpName: 'Boundless',
  rpId: process.env.NEXT_PUBLIC_RP_ID,
  indexerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_INDEXER_URL || false,
  relayerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_RELAYER_URL || undefined,
};

export const nativeTokenContract =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT ||
  (isMainnet ? '' : 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');

export interface CurrencyInfo {
  code: string;
  name: string;
  contractId: string;
  issuer: string;
  decimals: number;
  icon: string;
}

export type AssetSymbol = 'XLM' | 'USDC' | 'EURC';

export const SUPPORTED_ASSETS: Record<AssetSymbol, CurrencyInfo> = {
  XLM: {
    code: 'XLM',
    name: 'Stellar Lumens',
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    issuer: 'native',
    decimals: 7,
    icon: '/assets/xlm.svg',
  },
  USDC: {
    code: 'USDC',
    name: 'USD Coin',
    contractId: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
    issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    decimals: 6,
    icon: '/assets/usdc.svg',
  },
  EURC: {
    code: 'EURC',
    name: 'Euro Coin',
    contractId: 'CCUUDM434BMZMYWYDITHFXHDMIVTGGD6T2I5UKNX5BSLXLW7HVR4MCGZ',
    issuer: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
    decimals: 6,
    icon: '/assets/eurc.png',
  },
};

export type Asset = (typeof SUPPORTED_ASSETS)[AssetSymbol];
export const ASSETS_LIST = Object.values(SUPPORTED_ASSETS);

export interface PolicyInfo {
  type: 'threshold' | 'spending_limit' | 'weighted_threshold' | 'custom';
  name: string;
  description: string;
  address: string;
}

const TESTNET_POLICIES: PolicyInfo[] = [
  {
    type: 'threshold',
    name: 'Threshold (M-of-N)',
    description: 'Requires M signatures out of N total signers',
    address:
      process.env.NEXT_PUBLIC_THRESHOLD_POLICY_ADDRESS ||
      'CB2WQXF2XXDGUV2CTVQ23RLN3ESI3IY5KKX3KVXWBNRTTWDHZM76NVKJ',
  },
  {
    type: 'spending_limit',
    name: 'Spending Limit',
    description: 'Limits spending to a maximum amount per time period',
    address:
      process.env.NEXT_PUBLIC_SPENDING_LIMIT_POLICY_ADDRESS ||
      'CBBZ2XP4LBDEO2EELTZKJSPQZDREFKCULL6CKIUQO53S42RZABOYQUK3',
  },
  {
    type: 'weighted_threshold',
    name: 'Weighted Threshold',
    description:
      'Requires minimum total weight from signers with different voting weights',
    address:
      process.env.NEXT_PUBLIC_WEIGHTED_THRESHOLD_POLICY_ADDRESS ||
      'CCF65VXVORNOZBRR3EG3GZYSFS3ALDG44CDYN5T5KRWKYX6RXLKLXER4',
  },
];

export const KNOWN_POLICIES: PolicyInfo[] = isMainnet ? [] : TESTNET_POLICIES;
