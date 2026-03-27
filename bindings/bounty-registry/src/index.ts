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
    contractId: 'CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY',
  },
} as const;

export const BountyError = {
  700: { message: 'AlreadyInitialized' },
  701: { message: 'NotInitialized' },
  702: { message: 'NotAuthorized' },
  703: { message: 'BountyNotFound' },
  704: { message: 'BountyNotOpen' },
  705: { message: 'DeadlinePassed' },
  706: { message: 'AlreadyApplied' },
  707: { message: 'ApplicationNotFound' },
  708: { message: 'ApplicationNotPending' },
  709: { message: 'InvalidRating' },
  710: { message: 'NoEscrowPool' },
  711: { message: 'AmountNotPositive' },
  712: { message: 'NotCreator' },
  713: { message: 'NotAssignee' },
  714: { message: 'NotInProgress' },
  715: { message: 'NotReviewable' },
  716: { message: 'InvalidSubType' },
  717: { message: 'AlreadyClaimed' },
  718: { message: 'InsufficientCredits' },
  719: { message: 'BountyNotCompleted' },
  720: { message: 'InvalidSplitShares' },
  721: { message: 'NotContestType' },
  722: { message: 'NotSplitType' },
  723: { message: 'SlotNotFound' },
  724: { message: 'CannotCancel' },
  725: { message: 'NotFCFSType' },
  726: { message: 'AutoReleaseNotReady' },
};

export interface Bounty {
  amount: i128;
  asset: string;
  assignee: Option<string>;
  bounty_type: BountyType;
  category: ActivityCategory;
  created_at: u64;
  creator: string;
  deadline: u64;
  escrow_pool_id: Buffer;
  id: u64;
  metadata_cid: string;
  status: BountyStatus;
  title: string;
  winner_count: u32;
}

export type BountyType =
  | { tag: 'FCFS'; values: void }
  | { tag: 'Application'; values: void }
  | { tag: 'Contest'; values: void }
  | { tag: 'Split'; values: void };

export interface Application {
  applicant: string;
  bounty_id: u64;
  proposal: string;
  status: ApplicationStatus;
  submitted_at: u64;
}

export type BountyStatus =
  | { tag: 'Open'; values: void }
  | { tag: 'InProgress'; values: void }
  | { tag: 'InReview'; values: void }
  | { tag: 'Completed'; values: void }
  | { tag: 'Cancelled'; values: void };

export type BountyDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'CoreEscrow'; values: void }
  | { tag: 'ReputationRegistry'; values: void }
  | { tag: 'BountyCount'; values: void }
  | { tag: 'Bounty'; values: readonly [u64] }
  | { tag: 'Application'; values: readonly [u64, string] }
  | { tag: 'ApplicantCount'; values: readonly [u64] }
  | { tag: 'Applicant'; values: readonly [u64, u32] }
  | { tag: 'SplitRecipient'; values: readonly [u64, u32] };

export type ApplicationStatus =
  | { tag: 'Pending'; values: void }
  | { tag: 'Accepted'; values: void }
  | { tag: 'Rejected'; values: void };

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
    {
      admin,
      core_escrow,
      reputation_registry,
    }: { admin: string; core_escrow: string; reputation_registry: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a apply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply: (
    {
      applicant,
      bounty_id,
      proposal,
    }: { applicant: string; bounty_id: u64; proposal: string },
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
   * Construct and simulate a get_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bounty: (
    { bounty_id }: { bounty_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Bounty>>>;

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_work: (
    {
      contributor,
      bounty_id,
      work_cid,
    }: { contributor: string; bounty_id: u64; work_cid: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_fcfs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_fcfs: (
    {
      creator,
      bounty_id,
      points,
    }: { creator: string; bounty_id: u64; points: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a claim_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_bounty: (
    { contributor, bounty_id }: { contributor: string; bounty_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_split transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_split: (
    {
      creator,
      bounty_id,
      slot_index,
      points,
    }: { creator: string; bounty_id: u64; slot_index: u32; points: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a cancel_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_bounty: (
    { creator, bounty_id }: { creator: string; bounty_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_bounty: (
    {
      creator,
      title,
      metadata_cid,
      bounty_type,
      amount,
      asset,
      category,
      deadline,
    }: {
      creator: string;
      title: string;
      metadata_cid: string;
      bounty_type: BountyType;
      amount: i128;
      asset: string;
      category: ActivityCategory;
      deadline: u64;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a define_splits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  define_splits: (
    {
      creator,
      bounty_id,
      slots,
    }: {
      creator: string;
      bounty_id: u64;
      slots: Array<readonly [string, i128]>;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a update_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_bounty: (
    {
      creator,
      bounty_id,
      title,
      metadata_cid,
      deadline,
    }: {
      creator: string;
      bounty_id: u64;
      title: Option<string>;
      metadata_cid: Option<string>;
      deadline: Option<u64>;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_application: (
    { bounty_id, applicant }: { bounty_id: u64; applicant: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Application>>>;

  /**
   * Construct and simulate a finalize_contest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  finalize_contest: (
    { creator, bounty_id }: { creator: string; bounty_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_bounty_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bounty_count: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a select_applicant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  select_applicant: (
    {
      creator,
      bounty_id,
      applicant,
    }: { creator: string; bounty_id: u64; applicant: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_submission: (
    {
      creator,
      bounty_id,
      points,
    }: { creator: string; bounty_id: u64; points: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a auto_release_check transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  auto_release_check: (
    { bounty_id }: { bounty_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a reject_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject_application: (
    {
      creator,
      bounty_id,
      applicant,
    }: { creator: string; bounty_id: u64; applicant: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_contest_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_contest_winner: (
    {
      creator,
      bounty_id,
      winner,
      payout_amount,
      points,
    }: {
      creator: string;
      bounty_id: u64;
      winner: string;
      payout_amount: i128;
      points: u32;
    },
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
        'AAAABAAAAAAAAAAAAAAAC0JvdW50eUVycm9yAAAAABsAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAACvAAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAr0AAAAAAAAADU5vdEF1dGhvcml6ZWQAAAAAAAK+AAAAAAAAAA5Cb3VudHlOb3RGb3VuZAAAAAACvwAAAAAAAAANQm91bnR5Tm90T3BlbgAAAAAAAsAAAAAAAAAADkRlYWRsaW5lUGFzc2VkAAAAAALBAAAAAAAAAA5BbHJlYWR5QXBwbGllZAAAAAACwgAAAAAAAAATQXBwbGljYXRpb25Ob3RGb3VuZAAAAALDAAAAAAAAABVBcHBsaWNhdGlvbk5vdFBlbmRpbmcAAAAAAALEAAAAAAAAAA1JbnZhbGlkUmF0aW5nAAAAAAACxQAAAAAAAAAMTm9Fc2Nyb3dQb29sAAACxgAAAAAAAAARQW1vdW50Tm90UG9zaXRpdmUAAAAAAALHAAAAAAAAAApOb3RDcmVhdG9yAAAAAALIAAAAAAAAAAtOb3RBc3NpZ25lZQAAAALJAAAAAAAAAA1Ob3RJblByb2dyZXNzAAAAAAACygAAAAAAAAANTm90UmV2aWV3YWJsZQAAAAAAAssAAAAAAAAADkludmFsaWRTdWJUeXBlAAAAAALMAAAAAAAAAA5BbHJlYWR5Q2xhaW1lZAAAAAACzQAAAAAAAAATSW5zdWZmaWNpZW50Q3JlZGl0cwAAAALOAAAAAAAAABJCb3VudHlOb3RDb21wbGV0ZWQAAAAAAs8AAAAAAAAAEkludmFsaWRTcGxpdFNoYXJlcwAAAAAC0AAAAAAAAAAOTm90Q29udGVzdFR5cGUAAAAAAtEAAAAAAAAADE5vdFNwbGl0VHlwZQAAAtIAAAAAAAAADFNsb3ROb3RGb3VuZAAAAtMAAAAAAAAADENhbm5vdENhbmNlbAAAAtQAAAAAAAAAC05vdEZDRlNUeXBlAAAAAtUAAAAAAAAAE0F1dG9SZWxlYXNlTm90UmVhZHkAAAAC1g==',
        'AAAABQAAAAAAAAAAAAAADUJvdW50eUFwcGxpZWQAAAAAAAABAAAADmJvdW50eV9hcHBsaWVkAAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADUJvdW50eUNsYWltZWQAAAAAAAABAAAADmJvdW50eV9jbGFpbWVkAAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAAHY2xhaW1lcgAAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAADUJvdW50eUNyZWF0ZWQAAAAAAAABAAAADmJvdW50eV9jcmVhdGVkAAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAADVNwbGl0QXBwcm92ZWQAAAAAAAABAAAADnNwbGl0X2FwcHJvdmVkAAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAAKc2xvdF9pbmRleAAAAAAABAAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADVdvcmtTdWJtaXR0ZWQAAAAAAAABAAAADndvcmtfc3VibWl0dGVkAAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADkJvdW50eUFzc2lnbmVkAAAAAAABAAAAD2JvdW50eV9hc3NpZ25lZAAAAAACAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAAAAAAIYXNzaWduZWUAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAD0JvdW50eUNhbmNlbGxlZAAAAAABAAAAEGJvdW50eV9jYW5jZWxsZWQAAAABAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAElN1Ym1pc3Npb25BcHByb3ZlZAAAAAAAAQAAABNzdWJtaXNzaW9uX2FwcHJvdmVkAAAAAAIAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAABAAAAAAAAAAZ3aW5uZXIAAAAAABMAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAE0FwcGxpY2F0aW9uUmVqZWN0ZWQAAAAAAQAAABRhcHBsaWNhdGlvbl9yZWplY3RlZAAAAAIAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAABAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAAI=',
        'AAAAAQAAAAAAAAAAAAAABkJvdW50eQAAAAAADgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACGFzc2lnbmVlAAAD6AAAABMAAAAAAAAAC2JvdW50eV90eXBlAAAAB9AAAAAKQm91bnR5VHlwZQAAAAAAAAAAAAhjYXRlZ29yeQAAB9AAAAAQQWN0aXZpdHlDYXRlZ29yeQAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAADmVzY3Jvd19wb29sX2lkAAAAAAPuAAAAIAAAAAAAAAACaWQAAAAAAAYAAAAAAAAADG1ldGFkYXRhX2NpZAAAABAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAAxCb3VudHlTdGF0dXMAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAAMd2lubmVyX2NvdW50AAAABA==',
        'AAAAAgAAAAAAAAAAAAAACkJvdW50eVR5cGUAAAAAAAQAAAAAAAAAAAAAAARGQ0ZTAAAAAAAAAAAAAAALQXBwbGljYXRpb24AAAAAAAAAAAAAAAAHQ29udGVzdAAAAAAAAAAAAAAAAAVTcGxpdAAAAA==',
        'AAAAAQAAAAAAAAAAAAAAC0FwcGxpY2F0aW9uAAAAAAUAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAAAAAAACHByb3Bvc2FsAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAAxzdWJtaXR0ZWRfYXQAAAAG',
        'AAAAAgAAAAAAAAAAAAAADEJvdW50eVN0YXR1cwAAAAUAAAAAAAAAAAAAAARPcGVuAAAAAAAAAAAAAAAKSW5Qcm9ncmVzcwAAAAAAAAAAAAAAAAAISW5SZXZpZXcAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAAAAAAAAAAAAAAAAAlDYW5jZWxsZWQAAAA=',
        'AAAAAgAAAAAAAAAAAAAADUJvdW50eURhdGFLZXkAAAAAAAAJAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAApDb3JlRXNjcm93AAAAAAAAAAAAAAAAABJSZXB1dGF0aW9uUmVnaXN0cnkAAAAAAAAAAAAAAAAAC0JvdW50eUNvdW50AAAAAAEAAAAAAAAABkJvdW50eQAAAAAAAQAAAAYAAAABAAAAAAAAAAtBcHBsaWNhdGlvbgAAAAACAAAABgAAABMAAAABAAAAAAAAAA5BcHBsaWNhbnRDb3VudAAAAAAAAQAAAAYAAAABAAAAAAAAAAlBcHBsaWNhbnQAAAAAAAACAAAABgAAAAQAAAABAAAAAAAAAA5TcGxpdFJlY2lwaWVudAAAAAAAAgAAAAYAAAAE',
        'AAAAAgAAAAAAAAAAAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAwAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQWNjZXB0ZWQAAAAAAAAAAAAAAAhSZWplY3RlZA==',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY29yZV9lc2Nyb3cAAAAAEwAAAAAAAAATcmVwdXRhdGlvbl9yZWdpc3RyeQAAAAATAAAAAQAAA+kAAAACAAAH0AAAAAtCb3VudHlFcnJvcgA=',
        'AAAAAAAAAAAAAAAFYXBwbHkAAAAAAAADAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAAAAAAhwcm9wb3NhbAAAABAAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAAKZ2V0X2JvdW50eQAAAAAAAQAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAEAAAPpAAAH0AAAAAZCb3VudHkAAAAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAwAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAAAAAAId29ya19jaWQAAAAQAAAAAQAAA+kAAAACAAAH0AAAAAtCb3VudHlFcnJvcgA=',
        'AAAAAAAAAAAAAAAMYXBwcm92ZV9mY2ZzAAAAAwAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAAAAAAZwb2ludHMAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAAMY2xhaW1fYm91bnR5AAAAAgAAAAAAAAALY29udHJpYnV0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAANYXBwcm92ZV9zcGxpdAAAAAAAAAQAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAAAAAAKc2xvdF9pbmRleAAAAAAABAAAAAAAAAAGcG9pbnRzAAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAAtCb3VudHlFcnJvcgA=',
        'AAAAAAAAAAAAAAANY2FuY2VsX2JvdW50eQAAAAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAANY3JlYXRlX2JvdW50eQAAAAAAAAgAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAAQAAAAAAAAAAtib3VudHlfdHlwZQAAAAfQAAAACkJvdW50eVR5cGUAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACGNhdGVnb3J5AAAH0AAAABBBY3Rpdml0eUNhdGVnb3J5AAAAAAAAAAhkZWFkbGluZQAAAAYAAAABAAAD6QAAAAYAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAANZGVmaW5lX3NwbGl0cwAAAAAAAAMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAAAAAAFc2xvdHMAAAAAAAPqAAAD7QAAAAIAAAATAAAACwAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAANdXBkYXRlX2JvdW50eQAAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAAAAAAFdGl0bGUAAAAAAAPoAAAAEAAAAAAAAAAMbWV0YWRhdGFfY2lkAAAD6AAAABAAAAAAAAAACGRlYWRsaW5lAAAD6AAAAAYAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAAPZ2V0X2FwcGxpY2F0aW9uAAAAAAIAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAABAAAD6QAAB9AAAAALQXBwbGljYXRpb24AAAAH0AAAAAtCb3VudHlFcnJvcgA=',
        'AAAAAAAAAAAAAAAQZmluYWxpemVfY29udGVzdAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAAQZ2V0X2JvdW50eV9jb3VudAAAAAAAAAABAAAABg==',
        'AAAAAAAAAAAAAAAQc2VsZWN0X2FwcGxpY2FudAAAAAMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABgAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAASYXBwcm92ZV9zdWJtaXNzaW9uAAAAAAADAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAAAAAAABnBvaW50cwAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAALQm91bnR5RXJyb3IA',
        'AAAAAAAAAAAAAAASYXV0b19yZWxlYXNlX2NoZWNrAAAAAAABAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAAtCb3VudHlFcnJvcgA=',
        'AAAAAAAAAAAAAAAScmVqZWN0X2FwcGxpY2F0aW9uAAAAAAADAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACWJvdW50eV9pZAAAAAAAAAYAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAAAAAAAAAAAWYXBwcm92ZV9jb250ZXN0X3dpbm5lcgAAAAAABQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAlib3VudHlfaWQAAAAAAAAGAAAAAAAAAAZ3aW5uZXIAAAAAABMAAAAAAAAADXBheW91dF9hbW91bnQAAAAAAAALAAAAAAAAAAZwb2ludHMAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAC0JvdW50eUVycm9yAA==',
        'AAAAAgAAADZHcmFudWxhciBzdWItdHlwZSBmb3IgZmVlIHJhdGUgbG9va3VwIGFuZCBhdWRpdCB0cmFpbC4AAAAAAAAAAAAHU3ViVHlwZQAAAAAKAAAAAAAAAAAAAAAKQm91bnR5RkNGUwAAAAAAAAAAAAAAAAARQm91bnR5QXBwbGljYXRpb24AAAAAAAAAAAAAAAAAAA1Cb3VudHlDb250ZXN0AAAAAAAAAAAAAAAAAAALQm91bnR5U3BsaXQAAAAAAAAAAAAAAAAPQ3Jvd2RmdW5kUGxlZGdlAAAAAAAAAAAAAAAADkdyYW50TWlsZXN0b25lAAAAAAAAAAAAAAAAABJHcmFudFJldHJvc3BlY3RpdmUAAAAAAAAAAAAAAAAAE0dyYW50UUZNYXRjaGluZ1Bvb2wAAAAAAAAAAAAAAAANSGFja2F0aG9uTWFpbgAAAAAAAAAAAAAAAAAADkhhY2thdGhvblRyYWNrAAA=',
        'AAAAAgAAAFBJZGVudGlmaWVzIHdoaWNoIHBsYXRmb3JtIG1vZHVsZSBvd25zIGEgcmVzb3VyY2UgKGVzY3JvdyBwb29sLCBmZWUgcmVjb3JkLCBldGMuKQAAAAAAAAAKTW9kdWxlVHlwZQAAAAAABAAAAAAAAAAAAAAABkJvdW50eQAAAAAAAAAAAAAAAAAJQ3Jvd2RmdW5kAAAAAAAAAAAAAAAAAAAFR3JhbnQAAAAAAAAAAAAAAAAAAAlIYWNrYXRob24AAAA=',
        'AAAAAgAAAExTa2lsbC9hY3Rpdml0eSBjYXRlZ29yaWVzIHVzZWQgYWNyb3NzIHJlcHV0YXRpb24gc2NvcmluZyBhbmQgYm91bnR5IHRhZ2dpbmcuAAAAAAAAABBBY3Rpdml0eUNhdGVnb3J5AAAABQAAAAAAAAAAAAAAC0RldmVsb3BtZW50AAAAAAAAAAAAAAAABkRlc2lnbgAAAAAAAAAAAAAAAAAJTWFya2V0aW5nAAAAAAAAAAAAAAAAAAAIU2VjdXJpdHkAAAAAAAAAAAAAAAlDb21tdW5pdHkAAAA=',
      ]),
      options
    );
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
    apply: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
    get_bounty: this.txFromJSON<Result<Bounty>>,
    submit_work: this.txFromJSON<Result<void>>,
    approve_fcfs: this.txFromJSON<Result<void>>,
    claim_bounty: this.txFromJSON<Result<void>>,
    approve_split: this.txFromJSON<Result<void>>,
    cancel_bounty: this.txFromJSON<Result<void>>,
    create_bounty: this.txFromJSON<Result<u64>>,
    define_splits: this.txFromJSON<Result<void>>,
    update_bounty: this.txFromJSON<Result<void>>,
    get_application: this.txFromJSON<Result<Application>>,
    finalize_contest: this.txFromJSON<Result<void>>,
    get_bounty_count: this.txFromJSON<u64>,
    select_applicant: this.txFromJSON<Result<void>>,
    approve_submission: this.txFromJSON<Result<void>>,
    auto_release_check: this.txFromJSON<Result<void>>,
    reject_application: this.txFromJSON<Result<void>>,
    approve_contest_winner: this.txFromJSON<Result<void>>,
  };
}
