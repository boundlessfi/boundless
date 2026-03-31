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
    contractId: 'CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4',
  },
} as const;

export const ReputationError = {
  300: { message: 'AlreadyInitialized' },
  301: { message: 'NotInitialized' },
  302: { message: 'ProfileNotFound' },
  303: { message: 'ModuleNotAuthorized' },
  304: { message: 'InsufficientCredits' },
  305: { message: 'RechargeNotReady' },
};

/**
 * SparkCredits data (merged from SparkCredits contract)
 */
export interface CreditData {
  credits: u32;
  last_recharge: u64;
  max_credits: u32;
  total_earned: u32;
  total_spent: u32;
}

export type ReputationDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'Version'; values: void }
  | { tag: 'Profile'; values: readonly [string] }
  | { tag: 'CreditData'; values: readonly [string] }
  | { tag: 'AuthorizedModule'; values: readonly [string] };

export interface ContributorProfile {
  address: string;
  bounties_completed: u32;
  campaigns_backed: u32;
  category_scores: Map<ActivityCategory, u32>;
  grants_received: u32;
  hackathons_entered: u32;
  hackathons_won: u32;
  joined_at: u64;
  level: u32;
  metadata_cid: string;
  overall_score: u32;
  total_earned: i128;
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
   * Construct and simulate a can_apply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  can_apply: (
    { user }: { user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<boolean>>;

  /**
   * Construct and simulate a get_level transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_level: (
    { contributor }: { contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a get_credits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_credits: (
    { user }: { user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a get_profile transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_profile: (
    { contributor }: { contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<ContributorProfile>>>;

  /**
   * Construct and simulate a init_profile transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init_profile: (
    { contributor }: { contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_fraud transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Record fraud. Admin-only. Deducts 100 reputation points.
   */
  record_fraud: (
    { contributor }: { contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a spend_credit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  spend_credit: (
    { module, user }: { module: string; user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a try_recharge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permissionless: anyone can trigger recharge for a user after 14 days.
   */
  try_recharge: (
    { user }: { user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a award_credits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  award_credits: (
    { module, user, amount }: { module: string; user: string; amount: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_penalty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_penalty: (
    { contributor, points }: { contributor: string; points: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a restore_credit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  restore_credit: (
    { module, user }: { module: string; user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a next_recharge_at transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the timestamp when the user can next recharge credits.
   */
  next_recharge_at: (
    { user }: { user: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a record_completion transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_completion: (
    {
      module,
      contributor,
      category,
      points,
    }: {
      module: string;
      contributor: string;
      category: ActivityCategory;
      points: u32;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a meets_requirements transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  meets_requirements: (
    { contributor, min_level }: { contributor: string; min_level: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a record_abandonment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Record a contributor abandoning a bounty/task. Called by authorized modules.
   * Deducts 10 reputation points.
   */
  record_abandonment: (
    { module, contributor }: { module: string; contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a add_community_bonus transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add community bonus points. Admin-only.
   */
  add_community_bonus: (
    {
      contributor,
      reason,
      points,
    }: { contributor: string; reason: string; points: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_late_delivery transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Record a late delivery. Called by authorized modules.
   * Deducts 5 reputation points.
   */
  record_late_delivery: (
    { module, contributor }: { module: string; contributor: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_profile_metadata transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_profile_metadata: (
    { contributor, cid }: { contributor: string; cid: string },
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
   * Construct and simulate a record_grant_received transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_grant_received: (
    {
      module,
      recipient,
      amount,
    }: { module: string; recipient: string; amount: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_campaign_backed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_campaign_backed: (
    { module, backer }: { module: string; backer: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a record_hackathon_result transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_hackathon_result: (
    {
      module,
      contributor,
      points,
      is_win,
    }: { module: string; contributor: string; points: u32; is_win: boolean },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a meets_skill_requirements transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check requirements including optional category skill rating.
   */
  meets_skill_requirements: (
    {
      contributor,
      min_level,
      required_category,
      min_category_score,
    }: {
      contributor: string;
      min_level: u32;
      required_category: ActivityCategory;
      min_category_score: u32;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

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
        'AAAABAAAAAAAAAAAAAAAD1JlcHV0YXRpb25FcnJvcgAAAAAGAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAASwAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAEtAAAAAAAAAA9Qcm9maWxlTm90Rm91bmQAAAABLgAAAAAAAAATTW9kdWxlTm90QXV0aG9yaXplZAAAAAEvAAAAAAAAABNJbnN1ZmZpY2llbnRDcmVkaXRzAAAAATAAAAAAAAAAEFJlY2hhcmdlTm90UmVhZHkAAAEx',
        'AAAABQAAAAAAAAAAAAAADENyZWRpdHNTcGVudAAAAAEAAAANY3JlZGl0c19zcGVudAAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAQAAAAAAAAAJcmVtYWluaW5nAAAAAAAABAAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADFNjb3JlVXBkYXRlZAAAAAEAAAANc2NvcmVfdXBkYXRlZAAAAAAAAAMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAABAAAAAAAAAA1vdmVyYWxsX3Njb3JlAAAAAAAABAAAAAAAAAAAAAAABWxldmVsAAAAAAAABAAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADUZyYXVkUmVjb3JkZWQAAAAAAAABAAAADmZyYXVkX3JlY29yZGVkAAAAAAACAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAQAAAAAAAAANb3ZlcmFsbF9zY29yZQAAAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAADkNyZWRpdHNBd2FyZGVkAAAAAAABAAAAD2NyZWRpdHNfYXdhcmRlZAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAAAAAAABmFtb3VudAAAAAAABAAAAAAAAAAAAAAACXJlbWFpbmluZwAAAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEENyZWRpdHNSZWNoYXJnZWQAAAABAAAAEWNyZWRpdHNfcmVjaGFyZ2VkAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAABAAAAAAAAAAlyZW1haW5pbmcAAAAAAAAEAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEE1vZHVsZUF1dGhvcml6ZWQAAAABAAAAEW1vZHVsZV9hdXRob3JpemVkAAAAAAAAAgAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAAAAAAAAKYXV0aG9yaXplZAAAAAAAAQAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAAE0NvbW11bml0eUJvbnVzQWRkZWQAAAAAAQAAABVjb21tdW5pdHlfYm9udXNfYWRkZWQAAAAAAAADAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAQAAAAAAAAAGcmVhc29uAAAAAAAQAAAAAAAAAAAAAAAGcG9pbnRzAAAAAAAEAAAAAAAAAAI=',
        'AAAAAQAAADVTcGFya0NyZWRpdHMgZGF0YSAobWVyZ2VkIGZyb20gU3BhcmtDcmVkaXRzIGNvbnRyYWN0KQAAAAAAAAAAAAAKQ3JlZGl0RGF0YQAAAAAABQAAAAAAAAAHY3JlZGl0cwAAAAAEAAAAAAAAAA1sYXN0X3JlY2hhcmdlAAAAAAAABgAAAAAAAAALbWF4X2NyZWRpdHMAAAAABAAAAAAAAAAMdG90YWxfZWFybmVkAAAABAAAAAAAAAALdG90YWxfc3BlbnQAAAAABA==',
        'AAAAAgAAAAAAAAAAAAAAEVJlcHV0YXRpb25EYXRhS2V5AAAAAAAABQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAHVmVyc2lvbgAAAAABAAAAAAAAAAdQcm9maWxlAAAAAAEAAAATAAAAAQAAAAAAAAAKQ3JlZGl0RGF0YQAAAAAAAQAAABMAAAABAAAAAAAAABBBdXRob3JpemVkTW9kdWxlAAAAAQAAABM=',
        'AAAAAQAAAAAAAAAAAAAAEkNvbnRyaWJ1dG9yUHJvZmlsZQAAAAAADAAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAAAAABJib3VudGllc19jb21wbGV0ZWQAAAAAAAQAAAAAAAAAEGNhbXBhaWduc19iYWNrZWQAAAAEAAAAAAAAAA9jYXRlZ29yeV9zY29yZXMAAAAD7AAAB9AAAAAQQWN0aXZpdHlDYXRlZ29yeQAAAAQAAAAAAAAAD2dyYW50c19yZWNlaXZlZAAAAAAEAAAAAAAAABJoYWNrYXRob25zX2VudGVyZWQAAAAAAAQAAAAAAAAADmhhY2thdGhvbnNfd29uAAAAAAAEAAAAAAAAAAlqb2luZWRfYXQAAAAAAAAGAAAAAAAAAAVsZXZlbAAAAAAAAAQAAAAAAAAADG1ldGFkYXRhX2NpZAAAABAAAAAAAAAADW92ZXJhbGxfc2NvcmUAAAAAAAAEAAAAAAAAAAx0b3RhbF9lYXJuZWQAAAAL',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAAJY2FuX2FwcGx5AAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAAAQ==',
        'AAAAAAAAAAAAAAAJZ2V0X2xldmVsAAAAAAAAAQAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAEAAAPpAAAABAAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAALZ2V0X2NyZWRpdHMAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAQAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAALZ2V0X3Byb2ZpbGUAAAAAAQAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAEAAAPpAAAH0AAAABJDb250cmlidXRvclByb2ZpbGUAAAAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAMaW5pdF9wcm9maWxlAAAAAQAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAADhSZWNvcmQgZnJhdWQuIEFkbWluLW9ubHkuIERlZHVjdHMgMTAwIHJlcHV0YXRpb24gcG9pbnRzLgAAAAxyZWNvcmRfZnJhdWQAAAABAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA9SZXB1dGF0aW9uRXJyb3IA',
        'AAAAAAAAAAAAAAAMc3BlbmRfY3JlZGl0AAAAAgAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPpAAAAAQAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAEVQZXJtaXNzaW9ubGVzczogYW55b25lIGNhbiB0cmlnZ2VyIHJlY2hhcmdlIGZvciBhIHVzZXIgYWZ0ZXIgMTQgZGF5cy4AAAAAAAAMdHJ5X3JlY2hhcmdlAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAANYXdhcmRfY3JlZGl0cwAAAAAAAAMAAAAAAAAABm1vZHVsZQAAAAAAEwAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAOcmVjb3JkX3BlbmFsdHkAAAAAAAIAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAAAAAAABnBvaW50cwAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAOcmVzdG9yZV9jcmVkaXQAAAAAAAIAAAAAAAAABm1vZHVsZQAAAAAAEwAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAD5SZXR1cm5zIHRoZSB0aW1lc3RhbXAgd2hlbiB0aGUgdXNlciBjYW4gbmV4dCByZWNoYXJnZSBjcmVkaXRzLgAAAAAAEG5leHRfcmVjaGFyZ2VfYXQAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPpAAAABgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAARcmVjb3JkX2NvbXBsZXRpb24AAAAAAAAEAAAAAAAAAAZtb2R1bGUAAAAAABMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAAAAAAACGNhdGVnb3J5AAAH0AAAABBBY3Rpdml0eUNhdGVnb3J5AAAAAAAAAAZwb2ludHMAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAASbWVldHNfcmVxdWlyZW1lbnRzAAAAAAACAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAAAAAAltaW5fbGV2ZWwAAAAAAAAEAAAAAQAAA+kAAAABAAAH0AAAAA9SZXB1dGF0aW9uRXJyb3IA',
        'AAAAAAAAAGpSZWNvcmQgYSBjb250cmlidXRvciBhYmFuZG9uaW5nIGEgYm91bnR5L3Rhc2suIENhbGxlZCBieSBhdXRob3JpemVkIG1vZHVsZXMuCkRlZHVjdHMgMTAgcmVwdXRhdGlvbiBwb2ludHMuAAAAAAAScmVjb3JkX2FiYW5kb25tZW50AAAAAAACAAAAAAAAAAZtb2R1bGUAAAAAABMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAACdBZGQgY29tbXVuaXR5IGJvbnVzIHBvaW50cy4gQWRtaW4tb25seS4AAAAAE2FkZF9jb21tdW5pdHlfYm9udXMAAAAAAwAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAGcmVhc29uAAAAAAAQAAAAAAAAAAZwb2ludHMAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAFJSZWNvcmQgYSBsYXRlIGRlbGl2ZXJ5LiBDYWxsZWQgYnkgYXV0aG9yaXplZCBtb2R1bGVzLgpEZWR1Y3RzIDUgcmVwdXRhdGlvbiBwb2ludHMuAAAAAAAUcmVjb3JkX2xhdGVfZGVsaXZlcnkAAAACAAAAAAAAAAZtb2R1bGUAAAAAABMAAAAAAAAAC2NvbnRyaWJ1dG9yAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAAUc2V0X3Byb2ZpbGVfbWV0YWRhdGEAAAACAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAAAAAANjaWQAAAAAEAAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAVYWRkX2F1dGhvcml6ZWRfbW9kdWxlAAAAAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA9SZXB1dGF0aW9uRXJyb3IA',
        'AAAAAAAAAAAAAAAVcmVjb3JkX2dyYW50X3JlY2VpdmVkAAAAAAAAAwAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAAWcmVjb3JkX2NhbXBhaWduX2JhY2tlZAAAAAAAAgAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAAZiYWNrZXIAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAD1JlcHV0YXRpb25FcnJvcgA=',
        'AAAAAAAAAAAAAAAXcmVjb3JkX2hhY2thdGhvbl9yZXN1bHQAAAAABAAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAAtjb250cmlidXRvcgAAAAATAAAAAAAAAAZwb2ludHMAAAAAAAQAAAAAAAAABmlzX3dpbgAAAAAAAQAAAAEAAAPpAAAAAgAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAADxDaGVjayByZXF1aXJlbWVudHMgaW5jbHVkaW5nIG9wdGlvbmFsIGNhdGVnb3J5IHNraWxsIHJhdGluZy4AAAAYbWVldHNfc2tpbGxfcmVxdWlyZW1lbnRzAAAABAAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAJbWluX2xldmVsAAAAAAAABAAAAAAAAAARcmVxdWlyZWRfY2F0ZWdvcnkAAAAAAAfQAAAAEEFjdGl2aXR5Q2F0ZWdvcnkAAAAAAAAAEm1pbl9jYXRlZ29yeV9zY29yZQAAAAAABAAAAAEAAAPpAAAAAQAAB9AAAAAPUmVwdXRhdGlvbkVycm9yAA==',
        'AAAAAAAAAAAAAAAYcmVtb3ZlX2F1dGhvcml6ZWRfbW9kdWxlAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA9SZXB1dGF0aW9uRXJyb3IA',
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
    can_apply: this.txFromJSON<boolean>,
    get_level: this.txFromJSON<Result<u32>>,
    get_credits: this.txFromJSON<Result<u32>>,
    get_profile: this.txFromJSON<Result<ContributorProfile>>,
    init_profile: this.txFromJSON<Result<void>>,
    record_fraud: this.txFromJSON<Result<void>>,
    spend_credit: this.txFromJSON<Result<boolean>>,
    try_recharge: this.txFromJSON<Result<void>>,
    award_credits: this.txFromJSON<Result<void>>,
    record_penalty: this.txFromJSON<Result<void>>,
    restore_credit: this.txFromJSON<Result<void>>,
    next_recharge_at: this.txFromJSON<Result<u64>>,
    record_completion: this.txFromJSON<Result<void>>,
    meets_requirements: this.txFromJSON<Result<boolean>>,
    record_abandonment: this.txFromJSON<Result<void>>,
    add_community_bonus: this.txFromJSON<Result<void>>,
    record_late_delivery: this.txFromJSON<Result<void>>,
    set_profile_metadata: this.txFromJSON<Result<void>>,
    add_authorized_module: this.txFromJSON<Result<void>>,
    record_grant_received: this.txFromJSON<Result<void>>,
    record_campaign_backed: this.txFromJSON<Result<void>>,
    record_hackathon_result: this.txFromJSON<Result<void>>,
    meets_skill_requirements: this.txFromJSON<Result<boolean>>,
    remove_authorized_module: this.txFromJSON<Result<void>>,
  };
}
