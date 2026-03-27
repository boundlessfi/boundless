import { Buffer } from 'buffer';
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN',
  },
} as const;

export const EscrowError = {
  100: { message: 'AlreadyInitialized' },
  101: { message: 'NotInitialized' },
  102: { message: 'NotAuthorized' },
  103: { message: 'PoolNotFound' },
  104: { message: 'PoolAlreadyExists' },
  105: { message: 'PoolLocked' },
  106: { message: 'PoolNotLocked' },
  107: { message: 'InvalidAsset' },
  108: { message: 'InsufficientFunds' },
  109: { message: 'SlotNotFound' },
  110: { message: 'SlotAlreadyReleased' },
  111: { message: 'SlotsExceedDeposit' },
  112: { message: 'InvalidAmount' },
  113: { message: 'RateExceedsLimit' },
  114: { message: 'RoutingPaused' },
  115: { message: 'InsuranceCutOutOfRange' },
  116: { message: 'Overflow' },
  117: { message: 'ModuleNotAuthorized' },
  118: { message: 'PoolExpired' },
  119: { message: 'InsuranceInsufficient' },
};

export interface FeeConfig {
  bounty_fee_bps: u32;
  crowdfund_fee_bps: u32;
  grant_fee_bps: u32;
  hackathon_fee_bps: u32;
  insurance_cut_bps: u32;
}

export interface FeeRecord {
  fee_amount: i128;
  gross_amount: i128;
  insurance_cut: i128;
  net_to_escrow: i128;
  payer: string;
  pool_id: Buffer;
  sub_type: SubType;
  timestamp: u64;
  treasury_cut: i128;
}

export interface EscrowPool {
  asset: string;
  authorized_caller: string;
  created_at: u64;
  expires_at: u64;
  locked: boolean;
  module: ModuleType;
  owner: string;
  pool_id: Buffer;
  total_deposited: i128;
  total_refunded: i128;
  total_released: i128;
}

export interface ReleaseSlot {
  amount: i128;
  pool_id: Buffer;
  recipient: string;
  released: boolean;
  released_at: Option<u64>;
  slot_index: u32;
}

export type EscrowDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'Treasury'; values: void }
  | { tag: 'FeeConfig'; values: void }
  | { tag: 'InsuranceFund'; values: void }
  | { tag: 'RoutingPaused'; values: void }
  | { tag: 'Version'; values: void }
  | { tag: 'EscrowPool'; values: readonly [Buffer] }
  | { tag: 'ReleaseSlot'; values: readonly [Buffer, u32] }
  | { tag: 'SlotCount'; values: readonly [Buffer] }
  | { tag: 'FeeRecord'; values: readonly [Buffer] }
  | { tag: 'AuthorizedModule'; values: readonly [string] };

export interface InsuranceFund {
  balance: i128;
  total_contributions: i128;
  total_paid_out: i128;
}

/**
 * Granular sub-type for fee rate lookup and audit trail.
 */
export type SubType =
  | { tag: 'BountyFCFS'; values: void }
  | { tag: 'BountyApplication'; values: void }
  | { tag: 'BountyContest'; values: void }
  | { tag: 'BountySplit'; values: void }
  | { tag: 'CrowdfundPledge'; values: void }
  | { tag: 'GrantMilestone'; values: void }
  | { tag: 'GrantRetrospective'; values: void }
  | { tag: 'GrantQFMatchingPool'; values: void }
  | { tag: 'HackathonMain'; values: void }
  | { tag: 'HackathonTrack'; values: void };

/**
 * Identifies which platform module owns a resource (escrow pool, fee record, etc.)
 */
export type ModuleType =
  | { tag: 'Bounty'; values: void }
  | { tag: 'Crowdfund'; values: void }
  | { tag: 'Grant'; values: void }
  | { tag: 'Hackathon'; values: void };

/**
 * Skill/activity categories used across reputation scoring and bounty tagging.
 */
export type ActivityCategory =
  | { tag: 'Development'; values: void }
  | { tag: 'Design'; values: void }
  | { tag: 'Marketing'; values: void }
  | { tag: 'Security'; values: void }
  | { tag: 'Community'; values: void };

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: (
    { admin, treasury }: { admin: string; treasury: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: (
    {
      pool_id,
      amount,
      payer,
    }: { pool_id: Buffer; amount: i128; payer: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: (
    { new_wasm_hash }: { new_wasm_hash: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<EscrowPool>>>;

  /**
   * Construct and simulate a get_slot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_slot: (
    { pool_id, index }: { pool_id: Buffer; index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<ReleaseSlot>>>;

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a is_locked transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_locked: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a lock_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  lock_pool: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a refund_all transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_all: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_pool: (
    {
      owner,
      module,
      module_id,
      total_amount,
      asset,
      expires_at,
      authorized_caller,
    }: {
      owner: string;
      module: ModuleType;
      module_id: u64;
      total_amount: i128;
      asset: string;
      expires_at: u64;
      authorized_caller: string;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a get_fee_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_fee_rate: (
    { sub_type }: { sub_type: SubType },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a get_treasury transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_treasury: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a release_slot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  release_slot: (
    { pool_id, slot_index }: { pool_id: Buffer; slot_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a route_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Convenience wrapper: release escrow to recipient with no fee.
   * Calls release_partial internally.
   */
  route_payout: (
    {
      pool_id,
      recipient,
      amount,
    }: { pool_id: Buffer; recipient: string; amount: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a route_pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  route_pledge: (
    {
      backer,
      pool_id,
      pledge_amount,
      asset,
    }: { backer: string; pool_id: Buffer; pledge_amount: i128; asset: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<i128>>>;

  /**
   * Construct and simulate a route_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Convenience wrapper: refund escrowed net amount to pool owner.
   * Calls refund_all internally.
   */
  route_refund: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_fee_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_fee_rate: (
    { sub_type, new_bps }: { sub_type: SubType; new_bps: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a update_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_admin: (
    { new_admin }: { new_admin: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a calculate_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  calculate_fee: (
    { gross, sub_type }: { gross: i128; sub_type: SubType },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<readonly [i128, i128]>>>;

  /**
   * Construct and simulate a pause_routing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pause_routing: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a route_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  route_deposit: (
    {
      payer,
      pool_id,
      gross_amount,
      asset,
      sub_type,
    }: {
      payer: string;
      pool_id: Buffer;
      gross_amount: i128;
      asset: string;
      sub_type: SubType;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<i128>>>;

  /**
   * Construct and simulate a get_fee_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_fee_config: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<FeeConfig>>>;

  /**
   * Construct and simulate a get_fee_record transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_fee_record: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<FeeRecord>>>;

  /**
   * Construct and simulate a get_unreleased transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_unreleased: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<i128>>>;

  /**
   * Construct and simulate a refund_backers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_backers: (
    {
      pool_id,
      backers,
    }: { pool_id: Buffer; backers: Array<readonly [string, i128]> },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a resume_routing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resume_routing: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a claim_insurance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_insurance: (
    {
      claimant,
      amount,
      asset,
    }: { claimant: string; amount: i128; asset: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a release_partial transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  release_partial: (
    {
      pool_id,
      recipient,
      amount,
    }: { pool_id: Buffer; recipient: string; amount: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a update_treasury transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_treasury: (
    { new_treasury }: { new_treasury: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a authorize_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  authorize_module: (
    { module_addr }: { module_addr: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a refund_remaining transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_remaining: (
    { pool_id }: { pool_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_insurance_cut transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_insurance_cut: (
    { new_bps }: { new_bps: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a deauthorize_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deauthorize_module: (
    { module_addr }: { module_addr: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a contribute_insurance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  contribute_insurance: (
    { amount }: { amount: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a define_release_slots transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  define_release_slots: (
    {
      pool_id,
      slots,
    }: { pool_id: Buffer; slots: Array<readonly [string, i128]> },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a calculate_pledge_cost transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  calculate_pledge_cost: (
    { pledge }: { pledge: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<i128>>>;

  /**
   * Construct and simulate a get_insurance_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_insurance_balance: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<i128>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, 'contractId'> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: 'hex' | 'base64';
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        'AAAABAAAAAAAAAAAAAAAC0VzY3Jvd0Vycm9yAAAAABQAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAZAAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAGUAAAAAAAAADU5vdEF1dGhvcml6ZWQAAAAAAABmAAAAAAAAAAxQb29sTm90Rm91bmQAAABnAAAAAAAAABFQb29sQWxyZWFkeUV4aXN0cwAAAAAAAGgAAAAAAAAAClBvb2xMb2NrZWQAAAAAAGkAAAAAAAAADVBvb2xOb3RMb2NrZWQAAAAAAABqAAAAAAAAAAxJbnZhbGlkQXNzZXQAAABrAAAAAAAAABFJbnN1ZmZpY2llbnRGdW5kcwAAAAAAAGwAAAAAAAAADFNsb3ROb3RGb3VuZAAAAG0AAAAAAAAAE1Nsb3RBbHJlYWR5UmVsZWFzZWQAAAAAbgAAAAAAAAASU2xvdHNFeGNlZWREZXBvc2l0AAAAAABvAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAAcAAAAAAAAAAQUmF0ZUV4Y2VlZHNMaW1pdAAAAHEAAAAAAAAADVJvdXRpbmdQYXVzZWQAAAAAAAByAAAAAAAAABZJbnN1cmFuY2VDdXRPdXRPZlJhbmdlAAAAAABzAAAAAAAAAAhPdmVyZmxvdwAAAHQAAAAAAAAAE01vZHVsZU5vdEF1dGhvcml6ZWQAAAAAdQAAAAAAAAALUG9vbEV4cGlyZWQAAAAAdgAAAAAAAAAVSW5zdXJhbmNlSW5zdWZmaWNpZW50AAAAAAAAdw==',
        'AAAABQAAAAAAAAAAAAAACFJlZnVuZGVkAAAAAQAAAAhyZWZ1bmRlZAAAAAMAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAABAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAACkZlZUNoYXJnZWQAAAAAAAEAAAALZmVlX2NoYXJnZWQAAAAABwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAAAAAAACHN1Yl90eXBlAAAH0AAAAAdTdWJUeXBlAAAAAAAAAAAAAAAABWdyb3NzAAAAAAAACwAAAAAAAAAAAAAAA2ZlZQAAAAALAAAAAAAAAAAAAAAMdHJlYXN1cnlfY3V0AAAACwAAAAAAAAAAAAAADWluc3VyYW5jZV9jdXQAAAAAAAALAAAAAAAAAAAAAAADbmV0AAAAAAsAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAClBvb2xMb2NrZWQAAAAAAAEAAAALcG9vbF9sb2NrZWQAAAAAAQAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAAC1Bvb2xDcmVhdGVkAAAAAAEAAAAMcG9vbF9jcmVhdGVkAAAABAAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAAAAAABm1vZHVsZQAAAAAH0AAAAApNb2R1bGVUeXBlAAAAAAAAAAAAAAAAAAx0b3RhbF9hbW91bnQAAAALAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAADFNsb3RSZWxlYXNlZAAAAAEAAAANc2xvdF9yZWxlYXNlZAAAAAAAAAQAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAABAAAAAAAAAApzbG90X2luZGV4AAAAAAAEAAAAAAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADkZlZVJhdGVVcGRhdGVkAAAAAAABAAAAEGZlZV9yYXRlX3VwZGF0ZWQAAAACAAAAAAAAAAdvbGRfYnBzAAAAAAQAAAAAAAAAAAAAAAduZXdfYnBzAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEEluc3VyYW5jZUNsYWltZWQAAAABAAAAEWluc3VyYW5jZV9jbGFpbWVkAAAAAAAAAgAAAAAAAAAIY2xhaW1hbnQAAAATAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAFEluc3VyYW5jZUNvbnRyaWJ1dGVkAAAAAQAAABVpbnN1cmFuY2VfY29udHJpYnV0ZWQAAAAAAAABAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAAg==',
        'AAAAAQAAAAAAAAAAAAAACUZlZUNvbmZpZwAAAAAAAAUAAAAAAAAADmJvdW50eV9mZWVfYnBzAAAAAAAEAAAAAAAAABFjcm93ZGZ1bmRfZmVlX2JwcwAAAAAAAAQAAAAAAAAADWdyYW50X2ZlZV9icHMAAAAAAAAEAAAAAAAAABFoYWNrYXRob25fZmVlX2JwcwAAAAAAAAQAAAAAAAAAEWluc3VyYW5jZV9jdXRfYnBzAAAAAAAABA==',
        'AAAAAQAAAAAAAAAAAAAACUZlZVJlY29yZAAAAAAAAAkAAAAAAAAACmZlZV9hbW91bnQAAAAAAAsAAAAAAAAADGdyb3NzX2Ftb3VudAAAAAsAAAAAAAAADWluc3VyYW5jZV9jdXQAAAAAAAALAAAAAAAAAA1uZXRfdG9fZXNjcm93AAAAAAAACwAAAAAAAAAFcGF5ZXIAAAAAAAATAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAAAAAAhzdWJfdHlwZQAAB9AAAAAHU3ViVHlwZQAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAADHRyZWFzdXJ5X2N1dAAAAAs=',
        'AAAAAQAAAAAAAAAAAAAACkVzY3Jvd1Bvb2wAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAARYXV0aG9yaXplZF9jYWxsZXIAAAAAAAATAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAApleHBpcmVzX2F0AAAAAAAGAAAAAAAAAAZsb2NrZWQAAAAAAAEAAAAAAAAABm1vZHVsZQAAAAAH0AAAAApNb2R1bGVUeXBlAAAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAPdG90YWxfZGVwb3NpdGVkAAAAAAsAAAAAAAAADnRvdGFsX3JlZnVuZGVkAAAAAAALAAAAAAAAAA50b3RhbF9yZWxlYXNlZAAAAAAACw==',
        'AAAAAQAAAAAAAAAAAAAAC1JlbGVhc2VTbG90AAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAIcmVsZWFzZWQAAAABAAAAAAAAAAtyZWxlYXNlZF9hdAAAAAPoAAAABgAAAAAAAAAKc2xvdF9pbmRleAAAAAAABA==',
        'AAAAAgAAAAAAAAAAAAAADUVzY3Jvd0RhdGFLZXkAAAAAAAALAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAAhUcmVhc3VyeQAAAAAAAAAAAAAACUZlZUNvbmZpZwAAAAAAAAAAAAAAAAAADUluc3VyYW5jZUZ1bmQAAAAAAAAAAAAAAAAAAA1Sb3V0aW5nUGF1c2VkAAAAAAAAAAAAAAAAAAAHVmVyc2lvbgAAAAABAAAAAAAAAApFc2Nyb3dQb29sAAAAAAABAAAD7gAAACAAAAABAAAAAAAAAAtSZWxlYXNlU2xvdAAAAAACAAAD7gAAACAAAAAEAAAAAQAAAAAAAAAJU2xvdENvdW50AAAAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAJRmVlUmVjb3JkAAAAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAQQXV0aG9yaXplZE1vZHVsZQAAAAEAAAAT',
        'AAAAAQAAAAAAAAAAAAAADUluc3VyYW5jZUZ1bmQAAAAAAAADAAAAAAAAAAdiYWxhbmNlAAAAAAsAAAAAAAAAE3RvdGFsX2NvbnRyaWJ1dGlvbnMAAAAACwAAAAAAAAAOdG90YWxfcGFpZF9vdXQAAAAAAAs=',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIdHJlYXN1cnkAAAATAAAAAQAAA+kAAAACAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABXBheWVyAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAIZ2V0X3Bvb2wAAAABAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAQAAA+kAAAfQAAAACkVzY3Jvd1Bvb2wAAAAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAIZ2V0X3Nsb3QAAAACAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAAAAAAVpbmRleAAAAAAAAAQAAAABAAAD6QAAB9AAAAALUmVsZWFzZVNsb3QAAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAJaXNfbG9ja2VkAAAAAAAAAQAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAPpAAAAAQAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAJbG9ja19wb29sAAAAAAAAAQAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAKcmVmdW5kX2FsbAAAAAAAAQAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAALY3JlYXRlX3Bvb2wAAAAABwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAZtb2R1bGUAAAAAB9AAAAAKTW9kdWxlVHlwZQAAAAAAAAAAAAltb2R1bGVfaWQAAAAAAAAGAAAAAAAAAAx0b3RhbF9hbW91bnQAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACmV4cGlyZXNfYXQAAAAAAAYAAAAAAAAAEWF1dGhvcml6ZWRfY2FsbGVyAAAAAAAAEwAAAAEAAAPpAAAD7gAAACAAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAMZ2V0X2ZlZV9yYXRlAAAAAQAAAAAAAAAIc3ViX3R5cGUAAAfQAAAAB1N1YlR5cGUAAAAAAQAAA+kAAAAEAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAMZ2V0X3RyZWFzdXJ5AAAAAAAAAAEAAAPpAAAAEwAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAMcmVsZWFzZV9zbG90AAAAAgAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAKc2xvdF9pbmRleAAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAF9Db252ZW5pZW5jZSB3cmFwcGVyOiByZWxlYXNlIGVzY3JvdyB0byByZWNpcGllbnQgd2l0aCBubyBmZWUuCkNhbGxzIHJlbGVhc2VfcGFydGlhbCBpbnRlcm5hbGx5LgAAAAAMcm91dGVfcGF5b3V0AAAAAwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAMcm91dGVfcGxlZGdlAAAABAAAAAAAAAAGYmFja2VyAAAAAAATAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAAAAAA1wbGVkZ2VfYW1vdW50AAAAAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAQAAA+kAAAALAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAFtDb252ZW5pZW5jZSB3cmFwcGVyOiByZWZ1bmQgZXNjcm93ZWQgbmV0IGFtb3VudCB0byBwb29sIG93bmVyLgpDYWxscyByZWZ1bmRfYWxsIGludGVybmFsbHkuAAAAAAxyb3V0ZV9yZWZ1bmQAAAABAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAMc2V0X2ZlZV9yYXRlAAAAAgAAAAAAAAAIc3ViX3R5cGUAAAfQAAAAB1N1YlR5cGUAAAAAAAAAAAduZXdfYnBzAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAMdXBkYXRlX2FkbWluAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAANY2FsY3VsYXRlX2ZlZQAAAAAAAAIAAAAAAAAABWdyb3NzAAAAAAAACwAAAAAAAAAIc3ViX3R5cGUAAAfQAAAAB1N1YlR5cGUAAAAAAQAAA+kAAAPtAAAAAgAAAAsAAAALAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAANcGF1c2Vfcm91dGluZwAAAAAAAAAAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAANcm91dGVfZGVwb3NpdAAAAAAAAAUAAAAAAAAABXBheWVyAAAAAAAAEwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAMZ3Jvc3NfYW1vdW50AAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAhzdWJfdHlwZQAAB9AAAAAHU3ViVHlwZQAAAAABAAAD6QAAAAsAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAOZ2V0X2ZlZV9jb25maWcAAAAAAAAAAAABAAAD6QAAB9AAAAAJRmVlQ29uZmlnAAAAAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAOZ2V0X2ZlZV9yZWNvcmQAAAAAAAEAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAABAAAD6QAAB9AAAAAJRmVlUmVjb3JkAAAAAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAOZ2V0X3VucmVsZWFzZWQAAAAAAAEAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAABAAAD6QAAAAsAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAOcmVmdW5kX2JhY2tlcnMAAAAAAAIAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAAAAAAAB2JhY2tlcnMAAAAD6gAAA+0AAAACAAAAEwAAAAsAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAOcmVzdW1lX3JvdXRpbmcAAAAAAAAAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAPY2xhaW1faW5zdXJhbmNlAAAAAAMAAAAAAAAACGNsYWltYW50AAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAPcmVsZWFzZV9wYXJ0aWFsAAAAAAMAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAgAAB9AAAAALRXNjcm93RXJyb3IA',
        'AAAAAAAAAAAAAAAPdXBkYXRlX3RyZWFzdXJ5AAAAAAEAAAAAAAAADG5ld190cmVhc3VyeQAAABMAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAQYXV0aG9yaXplX21vZHVsZQAAAAEAAAAAAAAAC21vZHVsZV9hZGRyAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAQcmVmdW5kX3JlbWFpbmluZwAAAAEAAAAAAAAAB3Bvb2xfaWQAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAARc2V0X2luc3VyYW5jZV9jdXQAAAAAAAABAAAAAAAAAAduZXdfYnBzAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAASZGVhdXRob3JpemVfbW9kdWxlAAAAAAABAAAAAAAAAAttb2R1bGVfYWRkcgAAAAATAAAAAQAAA+kAAAACAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAUY29udHJpYnV0ZV9pbnN1cmFuY2UAAAABAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAfQAAAAC0VzY3Jvd0Vycm9yAA==',
        'AAAAAAAAAAAAAAAUZGVmaW5lX3JlbGVhc2Vfc2xvdHMAAAACAAAAAAAAAAdwb29sX2lkAAAAA+4AAAAgAAAAAAAAAAVzbG90cwAAAAAAA+oAAAPtAAAAAgAAABMAAAALAAAAAQAAA+kAAAACAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAVY2FsY3VsYXRlX3BsZWRnZV9jb3N0AAAAAAAAAQAAAAAAAAAGcGxlZGdlAAAAAAALAAAAAQAAA+kAAAALAAAH0AAAAAtFc2Nyb3dFcnJvcgA=',
        'AAAAAAAAAAAAAAAVZ2V0X2luc3VyYW5jZV9iYWxhbmNlAAAAAAAAAAAAAAEAAAAL',
        'AAAAAgAAADZHcmFudWxhciBzdWItdHlwZSBmb3IgZmVlIHJhdGUgbG9va3VwIGFuZCBhdWRpdCB0cmFpbC4AAAAAAAAAAAAHU3ViVHlwZQAAAAAKAAAAAAAAAAAAAAAKQm91bnR5RkNGUwAAAAAAAAAAAAAAAAARQm91bnR5QXBwbGljYXRpb24AAAAAAAAAAAAAAAAAAA1Cb3VudHlDb250ZXN0AAAAAAAAAAAAAAAAAAALQm91bnR5U3BsaXQAAAAAAAAAAAAAAAAPQ3Jvd2RmdW5kUGxlZGdlAAAAAAAAAAAAAAAADkdyYW50TWlsZXN0b25lAAAAAAAAAAAAAAAAABJHcmFudFJldHJvc3BlY3RpdmUAAAAAAAAAAAAAAAAAE0dyYW50UUZNYXRjaGluZ1Bvb2wAAAAAAAAAAAAAAAANSGFja2F0aG9uTWFpbgAAAAAAAAAAAAAAAAAADkhhY2thdGhvblRyYWNrAAA=',
        'AAAAAgAAAFBJZGVudGlmaWVzIHdoaWNoIHBsYXRmb3JtIG1vZHVsZSBvd25zIGEgcmVzb3VyY2UgKGVzY3JvdyBwb29sLCBmZWUgcmVjb3JkLCBldGMuKQAAAAAAAAAKTW9kdWxlVHlwZQAAAAAABAAAAAAAAAAAAAAABkJvdW50eQAAAAAAAAAAAAAAAAAJQ3Jvd2RmdW5kAAAAAAAAAAAAAAAAAAAFR3JhbnQAAAAAAAAAAAAAAAAAAAlIYWNrYXRob24AAAA=',
        'AAAAAgAAAExTa2lsbC9hY3Rpdml0eSBjYXRlZ29yaWVzIHVzZWQgYWNyb3NzIHJlcHV0YXRpb24gc2NvcmluZyBhbmQgYm91bnR5IHRhZ2dpbmcuAAAAAAAAABBBY3Rpdml0eUNhdGVnb3J5AAAABQAAAAAAAAAAAAAAC0RldmVsb3BtZW50AAAAAAAAAAAAAAAABkRlc2lnbgAAAAAAAAAAAAAAAAAJTWFya2V0aW5nAAAAAAAAAAAAAAAAAAAIU2VjdXJpdHkAAAAAAAAAAAAAAAlDb21tdW5pdHkAAAA=',
      ]),
      options
    );
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
    deposit: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
    get_pool: this.txFromJSON<Result<EscrowPool>>,
    get_slot: this.txFromJSON<Result<ReleaseSlot>>,
    get_admin: this.txFromJSON<Result<string>>,
    is_locked: this.txFromJSON<Result<boolean>>,
    lock_pool: this.txFromJSON<Result<void>>,
    refund_all: this.txFromJSON<Result<void>>,
    create_pool: this.txFromJSON<Result<Buffer>>,
    get_fee_rate: this.txFromJSON<Result<u32>>,
    get_treasury: this.txFromJSON<Result<string>>,
    release_slot: this.txFromJSON<Result<void>>,
    route_payout: this.txFromJSON<Result<void>>,
    route_pledge: this.txFromJSON<Result<i128>>,
    route_refund: this.txFromJSON<Result<void>>,
    set_fee_rate: this.txFromJSON<Result<void>>,
    update_admin: this.txFromJSON<Result<void>>,
    calculate_fee: this.txFromJSON<Result<readonly [i128, i128]>>,
    pause_routing: this.txFromJSON<Result<void>>,
    route_deposit: this.txFromJSON<Result<i128>>,
    get_fee_config: this.txFromJSON<Result<FeeConfig>>,
    get_fee_record: this.txFromJSON<Result<FeeRecord>>,
    get_unreleased: this.txFromJSON<Result<i128>>,
    refund_backers: this.txFromJSON<Result<void>>,
    resume_routing: this.txFromJSON<Result<void>>,
    claim_insurance: this.txFromJSON<Result<void>>,
    release_partial: this.txFromJSON<Result<void>>,
    update_treasury: this.txFromJSON<Result<void>>,
    authorize_module: this.txFromJSON<Result<void>>,
    refund_remaining: this.txFromJSON<Result<void>>,
    set_insurance_cut: this.txFromJSON<Result<void>>,
    deauthorize_module: this.txFromJSON<Result<void>>,
    contribute_insurance: this.txFromJSON<Result<void>>,
    define_release_slots: this.txFromJSON<Result<void>>,
    calculate_pledge_cost: this.txFromJSON<Result<i128>>,
    get_insurance_balance: this.txFromJSON<i128>,
  };
}
