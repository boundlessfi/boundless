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
    contractId: 'CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT',
  },
} as const;

export const ProjectError = {
  600: { message: 'AlreadyInitialized' },
  601: { message: 'NotInitialized' },
  602: { message: 'NotAuthorized' },
  603: { message: 'ProjectNotFound' },
  604: { message: 'ProjectSuspended' },
  605: { message: 'BudgetExceedsLimit' },
  606: { message: 'ModuleNotAuthorized' },
  607: { message: 'InsufficientDeposit' },
  608: { message: 'NoDepositHeld' },
  609: { message: 'InvalidAmount' },
  610: { message: 'Overflow' },
};

export interface Project {
  active_bounty_budget: i128;
  avg_rating: u32;
  bounties_posted: u32;
  campaigns_launched: u32;
  deposit_held: i128;
  dispute_count: u32;
  grants_distributed: i128;
  hackathons_hosted: u32;
  id: u64;
  metadata_cid: string;
  missed_milestones: u32;
  owner: string;
  suspended: boolean;
  total_paid_out: i128;
  total_platform_spend: i128;
  verification_level: u32;
  warning_level: u32;
}

export type ProjectDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'Version'; values: void }
  | { tag: 'ProjectCount'; values: void }
  | { tag: 'Project'; values: readonly [u64] }
  | { tag: 'AuthorizedModule'; values: readonly [string] };

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
    { admin }: { admin: string },
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
   * Construct and simulate a get_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project: (
    { project_id }: { project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Project>>>;

  /**
   * Construct and simulate a is_suspended transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_suspended: (
    { project_id }: { project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a lock_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lock a deposit for a project. Called by the project owner before posting a bounty/campaign.
   */
  lock_deposit: (
    {
      project_id,
      amount,
      asset,
    }: { project_id: u64; amount: i128; asset: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_payout: (
    {
      module,
      project_id,
      amount,
    }: { module: string; project_id: u64; amount: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_dispute: (
    { module, project_id }: { module: string; project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a forfeit_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Forfeit deposit to treasury. Called by admin on violations.
   */
  forfeit_deposit: (
    {
      project_id,
      amount,
      asset,
      treasury,
    }: { project_id: u64; amount: i128; asset: string; treasury: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a release_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Release deposit back to project owner. Called by authorized module on successful completion.
   */
  release_deposit: (
    {
      module,
      project_id,
      amount,
      asset,
    }: { module: string; project_id: u64; amount: i128; asset: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a suspend_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  suspend_project: (
    { project_id }: { project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a validate_budget transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  validate_budget: (
    { project_id, budget }: { project_id: u64; budget: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a get_deposit_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the deposit rate in basis points for a verification level.
   */
  get_deposit_rate: (
    { verification_level }: { verification_level: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a register_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_project: (
    { owner, metadata_cid }: { owner: string; metadata_cid: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a calculate_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Calculate the deposit required for a given budget based on project verification level.
   */
  calculate_deposit: (
    { project_id, budget }: { project_id: u64; budget: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<i128>>>;

  /**
   * Construct and simulate a unsuspend_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unsuspend_project: (
    { project_id }: { project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_bounty_posted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_bounty_posted: (
    {
      module,
      project_id,
      budget,
    }: { module: string; project_id: u64; budget: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a upgrade_verification transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade_verification: (
    { project_id, new_level }: { project_id: u64; new_level: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a add_authorized_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_authorized_module: (
    { module }: { module: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_missed_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_missed_milestone: (
    { module, project_id }: { module: string; project_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a remove_authorized_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_authorized_module: (
    { module }: { module: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;
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
        'AAAABAAAAAAAAAAAAAAADFByb2plY3RFcnJvcgAAAAsAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAACWAAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAlkAAAAAAAAADU5vdEF1dGhvcml6ZWQAAAAAAAJaAAAAAAAAAA9Qcm9qZWN0Tm90Rm91bmQAAAACWwAAAAAAAAAQUHJvamVjdFN1c3BlbmRlZAAAAlwAAAAAAAAAEkJ1ZGdldEV4Y2VlZHNMaW1pdAAAAAACXQAAAAAAAAATTW9kdWxlTm90QXV0aG9yaXplZAAAAAJeAAAAAAAAABNJbnN1ZmZpY2llbnREZXBvc2l0AAAAAl8AAAAAAAAADU5vRGVwb3NpdEhlbGQAAAAAAAJgAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAACYQAAAAAAAAAIT3ZlcmZsb3cAAAJi',
        'AAAABQAAAAAAAAAAAAAADVdhcm5pbmdJc3N1ZWQAAAAAAAABAAAADndhcm5pbmdfaXNzdWVkAAAAAAACAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAAAAAAAANd2FybmluZ19sZXZlbAAAAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEFByb2plY3RTdXNwZW5kZWQAAAABAAAAEXByb2plY3Rfc3VzcGVuZGVkAAAAAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAAEVByb2plY3RSZWdpc3RlcmVkAAAAAAAAAQAAABJwcm9qZWN0X3JlZ2lzdGVyZWQAAAAAAAIAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAFFZlcmlmaWNhdGlvblVwZ3JhZGVkAAAAAQAAABV2ZXJpZmljYXRpb25fdXBncmFkZWQAAAAAAAACAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAAAAAAAAJbmV3X2xldmVsAAAAAAAABAAAAAAAAAAC',
        'AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAAEQAAAAAAAAAUYWN0aXZlX2JvdW50eV9idWRnZXQAAAALAAAAAAAAAAphdmdfcmF0aW5nAAAAAAAEAAAAAAAAAA9ib3VudGllc19wb3N0ZWQAAAAABAAAAAAAAAASY2FtcGFpZ25zX2xhdW5jaGVkAAAAAAAEAAAAAAAAAAxkZXBvc2l0X2hlbGQAAAALAAAAAAAAAA1kaXNwdXRlX2NvdW50AAAAAAAABAAAAAAAAAASZ3JhbnRzX2Rpc3RyaWJ1dGVkAAAAAAALAAAAAAAAABFoYWNrYXRob25zX2hvc3RlZAAAAAAAAAQAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAAQAAAAAAAAABFtaXNzZWRfbWlsZXN0b25lcwAAAAAAAAQAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAJc3VzcGVuZGVkAAAAAAAAAQAAAAAAAAAOdG90YWxfcGFpZF9vdXQAAAAAAAsAAAAAAAAAFHRvdGFsX3BsYXRmb3JtX3NwZW5kAAAACwAAAAAAAAASdmVyaWZpY2F0aW9uX2xldmVsAAAAAAAEAAAAAAAAAA13YXJuaW5nX2xldmVsAAAAAAAABA==',
        'AAAAAgAAAAAAAAAAAAAADlByb2plY3REYXRhS2V5AAAAAAAFAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAAdWZXJzaW9uAAAAAAAAAAAAAAAADFByb2plY3RDb3VudAAAAAEAAAAAAAAAB1Byb2plY3QAAAAAAQAAAAYAAAABAAAAAAAAABBBdXRob3JpemVkTW9kdWxlAAAAAQAAABM=',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADFByb2plY3RFcnJvcg==',
        'AAAAAAAAAAAAAAALZ2V0X3Byb2plY3QAAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAPpAAAH0AAAAAdQcm9qZWN0AAAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAAAAAAAMaXNfc3VzcGVuZGVkAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAPpAAAAAQAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAFtMb2NrIGEgZGVwb3NpdCBmb3IgYSBwcm9qZWN0LiBDYWxsZWQgYnkgdGhlIHByb2plY3Qgb3duZXIgYmVmb3JlIHBvc3RpbmcgYSBib3VudHkvY2FtcGFpZ24uAAAAAAxsb2NrX2RlcG9zaXQAAAADAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAAAAAAANcmVjb3JkX3BheW91dAAAAAAAAAMAAAAAAAAABm1vZHVsZQAAAAAAEwAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAAOcmVjb3JkX2Rpc3B1dGUAAAAAAAIAAAAAAAAABm1vZHVsZQAAAAAAEwAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAPpAAAAAgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAADtGb3JmZWl0IGRlcG9zaXQgdG8gdHJlYXN1cnkuIENhbGxlZCBieSBhZG1pbiBvbiB2aW9sYXRpb25zLgAAAAAPZm9yZmVpdF9kZXBvc2l0AAAAAAQAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAh0cmVhc3VyeQAAABMAAAABAAAD6QAAAAIAAAfQAAAADFByb2plY3RFcnJvcg==',
        'AAAAAAAAAFxSZWxlYXNlIGRlcG9zaXQgYmFjayB0byBwcm9qZWN0IG93bmVyLiBDYWxsZWQgYnkgYXV0aG9yaXplZCBtb2R1bGUgb24gc3VjY2Vzc2Z1bCBjb21wbGV0aW9uLgAAAA9yZWxlYXNlX2RlcG9zaXQAAAAABAAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAAAAAAAPc3VzcGVuZF9wcm9qZWN0AAAAAAEAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADFByb2plY3RFcnJvcg==',
        'AAAAAAAAAAAAAAAPdmFsaWRhdGVfYnVkZ2V0AAAAAAIAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAAAAAAABmJ1ZGdldAAAAAAACwAAAAEAAAPpAAAAAQAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAD5HZXQgdGhlIGRlcG9zaXQgcmF0ZSBpbiBiYXNpcyBwb2ludHMgZm9yIGEgdmVyaWZpY2F0aW9uIGxldmVsLgAAAAAAEGdldF9kZXBvc2l0X3JhdGUAAAABAAAAAAAAABJ2ZXJpZmljYXRpb25fbGV2ZWwAAAAAAAQAAAABAAAABA==',
        'AAAAAAAAAAAAAAAQcmVnaXN0ZXJfcHJvamVjdAAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAMbWV0YWRhdGFfY2lkAAAAEAAAAAEAAAPpAAAABgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAFZDYWxjdWxhdGUgdGhlIGRlcG9zaXQgcmVxdWlyZWQgZm9yIGEgZ2l2ZW4gYnVkZ2V0IGJhc2VkIG9uIHByb2plY3QgdmVyaWZpY2F0aW9uIGxldmVsLgAAAAAAEWNhbGN1bGF0ZV9kZXBvc2l0AAAAAAAAAgAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAAAAAAGYnVkZ2V0AAAAAAALAAAAAQAAA+kAAAALAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAARdW5zdXNwZW5kX3Byb2plY3QAAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAAUcmVjb3JkX2JvdW50eV9wb3N0ZWQAAAADAAAAAAAAAAZtb2R1bGUAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAAAAAAABmJ1ZGdldAAAAAAACwAAAAEAAAPpAAAAAgAAB9AAAAAMUHJvamVjdEVycm9y',
        'AAAAAAAAAAAAAAAUdXBncmFkZV92ZXJpZmljYXRpb24AAAACAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAluZXdfbGV2ZWwAAAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAAVYWRkX2F1dGhvcml6ZWRfbW9kdWxlAAAAAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAAXcmVjb3JkX21pc3NlZF9taWxlc3RvbmUAAAAAAgAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAAAAAAAAAAAYcmVtb3ZlX2F1dGhvcml6ZWRfbW9kdWxlAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAAxQcm9qZWN0RXJyb3I=',
        'AAAAAgAAADZHcmFudWxhciBzdWItdHlwZSBmb3IgZmVlIHJhdGUgbG9va3VwIGFuZCBhdWRpdCB0cmFpbC4AAAAAAAAAAAAHU3ViVHlwZQAAAAAKAAAAAAAAAAAAAAAKQm91bnR5RkNGUwAAAAAAAAAAAAAAAAARQm91bnR5QXBwbGljYXRpb24AAAAAAAAAAAAAAAAAAA1Cb3VudHlDb250ZXN0AAAAAAAAAAAAAAAAAAALQm91bnR5U3BsaXQAAAAAAAAAAAAAAAAPQ3Jvd2RmdW5kUGxlZGdlAAAAAAAAAAAAAAAADkdyYW50TWlsZXN0b25lAAAAAAAAAAAAAAAAABJHcmFudFJldHJvc3BlY3RpdmUAAAAAAAAAAAAAAAAAE0dyYW50UUZNYXRjaGluZ1Bvb2wAAAAAAAAAAAAAAAANSGFja2F0aG9uTWFpbgAAAAAAAAAAAAAAAAAADkhhY2thdGhvblRyYWNrAAA=',
        'AAAAAgAAAFBJZGVudGlmaWVzIHdoaWNoIHBsYXRmb3JtIG1vZHVsZSBvd25zIGEgcmVzb3VyY2UgKGVzY3JvdyBwb29sLCBmZWUgcmVjb3JkLCBldGMuKQAAAAAAAAAKTW9kdWxlVHlwZQAAAAAABAAAAAAAAAAAAAAABkJvdW50eQAAAAAAAAAAAAAAAAAJQ3Jvd2RmdW5kAAAAAAAAAAAAAAAAAAAFR3JhbnQAAAAAAAAAAAAAAAAAAAlIYWNrYXRob24AAAA=',
        'AAAAAgAAAExTa2lsbC9hY3Rpdml0eSBjYXRlZ29yaWVzIHVzZWQgYWNyb3NzIHJlcHV0YXRpb24gc2NvcmluZyBhbmQgYm91bnR5IHRhZ2dpbmcuAAAAAAAAABBBY3Rpdml0eUNhdGVnb3J5AAAABQAAAAAAAAAAAAAAC0RldmVsb3BtZW50AAAAAAAAAAAAAAAABkRlc2lnbgAAAAAAAAAAAAAAAAAJTWFya2V0aW5nAAAAAAAAAAAAAAAAAAAIU2VjdXJpdHkAAAAAAAAAAAAAAAlDb21tdW5pdHkAAAA=',
      ]),
      options
    );
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
    get_project: this.txFromJSON<Result<Project>>,
    is_suspended: this.txFromJSON<Result<boolean>>,
    lock_deposit: this.txFromJSON<Result<void>>,
    record_payout: this.txFromJSON<Result<void>>,
    record_dispute: this.txFromJSON<Result<void>>,
    forfeit_deposit: this.txFromJSON<Result<void>>,
    release_deposit: this.txFromJSON<Result<void>>,
    suspend_project: this.txFromJSON<Result<void>>,
    validate_budget: this.txFromJSON<Result<boolean>>,
    get_deposit_rate: this.txFromJSON<u32>,
    register_project: this.txFromJSON<Result<u64>>,
    calculate_deposit: this.txFromJSON<Result<i128>>,
    unsuspend_project: this.txFromJSON<Result<void>>,
    record_bounty_posted: this.txFromJSON<Result<void>>,
    upgrade_verification: this.txFromJSON<Result<void>>,
    add_authorized_module: this.txFromJSON<Result<void>>,
    record_missed_milestone: this.txFromJSON<Result<void>>,
    remove_authorized_module: this.txFromJSON<Result<void>>,
  };
}
