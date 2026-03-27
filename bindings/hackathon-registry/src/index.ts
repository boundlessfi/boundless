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
    contractId: 'CDLV7OEETJ5WYP2VTKJHPE5AWBQA4JJKNI4XRLIFPRRSKBDKQO67ZPMG',
  },
} as const;

export const HackathonError = {
  1000: { message: 'AlreadyInitialized' },
  1001: { message: 'NotInitialized' },
  1002: { message: 'HackathonNotFound' },
  1003: { message: 'InvalidPrizeTiers' },
  1004: { message: 'InvalidDeadlines' },
  1005: { message: 'RegistrationClosed' },
  1006: { message: 'MaxParticipantsReached' },
  1007: { message: 'AlreadyRegistered' },
  1008: { message: 'NotRegistered' },
  1009: { message: 'SubmissionClosed' },
  1010: { message: 'AlreadySubmitted' },
  1011: { message: 'SubmissionNotFound' },
  1012: { message: 'JudgingNotActive' },
  1013: { message: 'NotAJudge' },
  1014: { message: 'AlreadyScored' },
  1015: { message: 'InvalidScore' },
  1016: { message: 'JudgingNotOver' },
  1017: { message: 'NoSubmissions' },
  1018: { message: 'NotCreator' },
  1019: { message: 'NotAdmin' },
  1020: { message: 'InvalidStatus' },
  1022: { message: 'AlreadyJudge' },
  1023: { message: 'JudgeNotFound' },
  1024: { message: 'AlreadyDisqualified' },
  1025: { message: 'HackathonNotCancellable' },
  1026: { message: 'TrackNotFound' },
  1027: { message: 'InvalidTrackStatus' },
  1028: { message: 'Overflow' },
  1029: { message: 'SubmissionPeriodNotEnded' },
};

export interface Hackathon {
  asset: string;
  creator: string;
  id: u64;
  judge_count: u32;
  judging_deadline: u64;
  max_participants: u32;
  metadata_cid: string;
  pool_id: Buffer;
  prize_pool: i128;
  registration_deadline: u64;
  status: HackathonStatus;
  submission_count: u32;
  submission_deadline: u64;
  title: string;
}

export interface Submission {
  disqualified: boolean;
  metadata_cid: string;
  score_count: u32;
  submitted_at: u64;
  team_lead: string;
  total_score: u32;
}

export interface SponsoredTrack {
  asset: string;
  hackathon_id: u64;
  pool_id: Buffer;
  prize_amount: i128;
  sponsor: string;
  track_id: u32;
  track_name: string;
}

export type HackathonStatus =
  | { tag: 'Registration'; values: void }
  | { tag: 'Submission'; values: void }
  | { tag: 'Judging'; values: void }
  | { tag: 'Completed'; values: void }
  | { tag: 'Cancelled'; values: void };

export type HackathonDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'CoreEscrow'; values: void }
  | { tag: 'ReputationRegistry'; values: void }
  | { tag: 'HackathonCount'; values: void }
  | { tag: 'Hackathon'; values: readonly [u64] }
  | { tag: 'Judge'; values: readonly [u64, string] }
  | { tag: 'JudgeIndex'; values: readonly [u64, u32] }
  | { tag: 'Submission'; values: readonly [u64, string] }
  | { tag: 'SubmissionIndex'; values: readonly [u64, u32] }
  | { tag: 'JudgeScore'; values: readonly [u64, string, string] }
  | { tag: 'PrizeTier'; values: readonly [u64, u32] }
  | { tag: 'HackathonTrack'; values: readonly [u64, u32] }
  | { tag: 'HackathonTrackCount'; values: readonly [u64] };

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
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: (
    { new_wasm_hash }: { new_wasm_hash: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a add_judge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_judge: (
    { hackathon_id, judge }: { hackathon_id: u64; judge: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a open_judging transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  open_judging: (
    { hackathon_id }: { hackathon_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a remove_judge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_judge: (
    { hackathon_id, judge }: { hackathon_id: u64; judge: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_hackathon: (
    { id }: { id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Hackathon>>>;

  /**
   * Construct and simulate a register_team transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_team: (
    { hackathon_id, team_lead }: { hackathon_id: u64; team_lead: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_submission: (
    { hackathon_id, team_lead }: { hackathon_id: u64; team_lead: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Submission>>>;

  /**
   * Construct and simulate a submit_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_project: (
    {
      hackathon_id,
      team_lead,
      metadata_cid,
    }: { hackathon_id: u64; team_lead: string; metadata_cid: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a cancel_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_hackathon: (
    { hackathon_id }: { hackathon_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_hackathon: (
    {
      creator,
      title,
      metadata_cid,
      prize_pool,
      asset,
      registration_deadline,
      submission_deadline,
      judging_deadline,
      max_participants,
      prize_tiers,
    }: {
      creator: string;
      title: string;
      metadata_cid: string;
      prize_pool: i128;
      asset: string;
      registration_deadline: u64;
      submission_deadline: u64;
      judging_deadline: u64;
      max_participants: u32;
      prize_tiers: Array<u32>;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a score_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  score_submission: (
    {
      hackathon_id,
      judge,
      team_lead,
      score,
    }: { hackathon_id: u64; judge: string; team_lead: string; score: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a finalize_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  finalize_hackathon: (
    { hackathon_id }: { hackathon_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a add_sponsored_track transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_sponsored_track: (
    {
      hackathon_id,
      sponsor,
      track_name,
      prize_amount,
      asset,
    }: {
      hackathon_id: u64;
      sponsor: string;
      track_name: string;
      prize_amount: i128;
      asset: string;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a disqualify_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  disqualify_submission: (
    { hackathon_id, team_lead }: { hackathon_id: u64; team_lead: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a distribute_track_prizes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  distribute_track_prizes: (
    {
      hackathon_id,
      track_id,
      winners,
    }: {
      hackathon_id: u64;
      track_id: u32;
      winners: Array<readonly [string, i128]>;
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
        'AAAABAAAAAAAAAAAAAAADkhhY2thdGhvbkVycm9yAAAAAAAdAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAA+gAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAPpAAAAAAAAABFIYWNrYXRob25Ob3RGb3VuZAAAAAAAA+oAAAAAAAAAEUludmFsaWRQcml6ZVRpZXJzAAAAAAAD6wAAAAAAAAAQSW52YWxpZERlYWRsaW5lcwAAA+wAAAAAAAAAElJlZ2lzdHJhdGlvbkNsb3NlZAAAAAAD7QAAAAAAAAAWTWF4UGFydGljaXBhbnRzUmVhY2hlZAAAAAAD7gAAAAAAAAARQWxyZWFkeVJlZ2lzdGVyZWQAAAAAAAPvAAAAAAAAAA1Ob3RSZWdpc3RlcmVkAAAAAAAD8AAAAAAAAAAQU3VibWlzc2lvbkNsb3NlZAAAA/EAAAAAAAAAEEFscmVhZHlTdWJtaXR0ZWQAAAPyAAAAAAAAABJTdWJtaXNzaW9uTm90Rm91bmQAAAAAA/MAAAAAAAAAEEp1ZGdpbmdOb3RBY3RpdmUAAAP0AAAAAAAAAAlOb3RBSnVkZ2UAAAAAAAP1AAAAAAAAAA1BbHJlYWR5U2NvcmVkAAAAAAAD9gAAAAAAAAAMSW52YWxpZFNjb3JlAAAD9wAAAAAAAAAOSnVkZ2luZ05vdE92ZXIAAAAAA/gAAAAAAAAADU5vU3VibWlzc2lvbnMAAAAAAAP5AAAAAAAAAApOb3RDcmVhdG9yAAAAAAP6AAAAAAAAAAhOb3RBZG1pbgAAA/sAAAAAAAAADUludmFsaWRTdGF0dXMAAAAAAAP8AAAAAAAAAAxBbHJlYWR5SnVkZ2UAAAP+AAAAAAAAAA1KdWRnZU5vdEZvdW5kAAAAAAAD/wAAAAAAAAATQWxyZWFkeURpc3F1YWxpZmllZAAAAAQAAAAAAAAAABdIYWNrYXRob25Ob3RDYW5jZWxsYWJsZQAAAAQBAAAAAAAAAA1UcmFja05vdEZvdW5kAAAAAAAEAgAAAAAAAAASSW52YWxpZFRyYWNrU3RhdHVzAAAAAAQDAAAAAAAAAAhPdmVyZmxvdwAABAQAAAAAAAAAGFN1Ym1pc3Npb25QZXJpb2ROb3RFbmRlZAAABAU=',
        'AAAABQAAAAAAAAAAAAAADVNjb3JlUmVjb3JkZWQAAAAAAAABAAAADnNjb3JlX3JlY29yZGVkAAAAAAAEAAAAAAAAAAxoYWNrYXRob25faWQAAAAGAAAAAQAAAAAAAAAFanVkZ2UAAAAAAAATAAAAAAAAAAAAAAAJdGVhbV9sZWFkAAAAAAAAEwAAAAAAAAAAAAAABXNjb3JlAAAAAAAABAAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAADlRlYW1SZWdpc3RlcmVkAAAAAAABAAAAD3RlYW1fcmVnaXN0ZXJlZAAAAAACAAAAAAAAAAxoYWNrYXRob25faWQAAAAGAAAAAQAAAAAAAAAJdGVhbV9sZWFkAAAAAAAAEwAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAAEEhhY2thdGhvbkNyZWF0ZWQAAAABAAAAEWhhY2thdGhvbl9jcmVhdGVkAAAAAAAAAgAAAAAAAAACaWQAAAAAAAYAAAABAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEFByb2plY3RTdWJtaXR0ZWQAAAABAAAAEXByb2plY3Rfc3VibWl0dGVkAAAAAAAAAgAAAAAAAAAMaGFja2F0aG9uX2lkAAAABgAAAAEAAAAAAAAACXRlYW1fbGVhZAAAAAAAABMAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEVByaXplc0Rpc3RyaWJ1dGVkAAAAAAAAAQAAABJwcml6ZXNfZGlzdHJpYnV0ZWQAAAAAAAEAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEkhhY2thdGhvbkNhbmNlbGxlZAAAAAAAAQAAABNoYWNrYXRob25fY2FuY2VsbGVkAAAAAAEAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAE1Nwb25zb3JlZFRyYWNrQWRkZWQAAAAAAQAAABVzcG9uc29yZWRfdHJhY2tfYWRkZWQAAAAAAAADAAAAAAAAAAxoYWNrYXRob25faWQAAAAGAAAAAQAAAAAAAAAIdHJhY2tfaWQAAAAEAAAAAAAAAAAAAAAHc3BvbnNvcgAAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAFlRyYWNrUHJpemVzRGlzdHJpYnV0ZWQAAAAAAAEAAAAYdHJhY2tfcHJpemVzX2Rpc3RyaWJ1dGVkAAAAAgAAAAAAAAAMaGFja2F0aG9uX2lkAAAABgAAAAEAAAAAAAAACHRyYWNrX2lkAAAABAAAAAAAAAAC',
        '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',
        'AAAAAAAAAAAAAAAMcmVtb3ZlX2p1ZGdlAAAAAgAAAAAAAAAMaGFja2F0aG9uX2lkAAAABgAAAAAAAAAFanVkZ2UAAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA5IYWNrYXRob25FcnJvcgAA',
        'AAAAAAAAAAAAAAANZ2V0X2hhY2thdGhvbgAAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAA+kAAAfQAAAACUhhY2thdGhvbgAAAAAAB9AAAAAOSGFja2F0aG9uRXJyb3IAAA==',
        'AAAAAAAAAAAAAAANcmVnaXN0ZXJfdGVhbQAAAAAAAAIAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAAAAAAACXRlYW1fbGVhZAAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAADkhhY2thdGhvbkVycm9yAAA=',
        'AAAAAAAAAAAAAAAOZ2V0X3N1Ym1pc3Npb24AAAAAAAIAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAAAAAAACXRlYW1fbGVhZAAAAAAAABMAAAABAAAD6QAAB9AAAAAKU3VibWlzc2lvbgAAAAAH0AAAAA5IYWNrYXRob25FcnJvcgAA',
        'AAAAAAAAAAAAAAAOc3VibWl0X3Byb2plY3QAAAAAAAMAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAAAAAAACXRlYW1fbGVhZAAAAAAAABMAAAAAAAAADG1ldGFkYXRhX2NpZAAAABAAAAABAAAD6QAAAAIAAAfQAAAADkhhY2thdGhvbkVycm9yAAA=',
        'AAAAAAAAAAAAAAAQY2FuY2VsX2hhY2thdGhvbgAAAAEAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkhhY2thdGhvbkVycm9yAAA=',
        'AAAAAAAAAAAAAAAQY3JlYXRlX2hhY2thdGhvbgAAAAoAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAAQAAAAAAAAAApwcml6ZV9wb29sAAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAAFXJlZ2lzdHJhdGlvbl9kZWFkbGluZQAAAAAAAAYAAAAAAAAAE3N1Ym1pc3Npb25fZGVhZGxpbmUAAAAABgAAAAAAAAAQanVkZ2luZ19kZWFkbGluZQAAAAYAAAAAAAAAEG1heF9wYXJ0aWNpcGFudHMAAAAEAAAAAAAAAAtwcml6ZV90aWVycwAAAAPqAAAABAAAAAEAAAPpAAAABgAAB9AAAAAOSGFja2F0aG9uRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAQc2NvcmVfc3VibWlzc2lvbgAAAAQAAAAAAAAADGhhY2thdGhvbl9pZAAAAAYAAAAAAAAABWp1ZGdlAAAAAAAAEwAAAAAAAAAJdGVhbV9sZWFkAAAAAAAAEwAAAAAAAAAFc2NvcmUAAAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5IYWNrYXRob25FcnJvcgAA',
        'AAAAAAAAAAAAAAASZmluYWxpemVfaGFja2F0aG9uAAAAAAABAAAAAAAAAAxoYWNrYXRob25faWQAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5IYWNrYXRob25FcnJvcgAA',
        'AAAAAAAAAAAAAAATYWRkX3Nwb25zb3JlZF90cmFjawAAAAAFAAAAAAAAAAxoYWNrYXRob25faWQAAAAGAAAAAAAAAAdzcG9uc29yAAAAABMAAAAAAAAACnRyYWNrX25hbWUAAAAAABAAAAAAAAAADHByaXplX2Ftb3VudAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAEAAAPpAAAABAAAB9AAAAAOSGFja2F0aG9uRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAVZGlzcXVhbGlmeV9zdWJtaXNzaW9uAAAAAAAAAgAAAAAAAAAMaGFja2F0aG9uX2lkAAAABgAAAAAAAAAJdGVhbV9sZWFkAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAOSGFja2F0aG9uRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAXZGlzdHJpYnV0ZV90cmFja19wcml6ZXMAAAAAAwAAAAAAAAAMaGFja2F0aG9uX2lkAAAABgAAAAAAAAAIdHJhY2tfaWQAAAAEAAAAAAAAAAd3aW5uZXJzAAAAA+oAAAPtAAAAAgAAABMAAAALAAAAAQAAA+kAAAACAAAH0AAAAA5IYWNrYXRob25FcnJvcgAA',
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
    add_judge: this.txFromJSON<Result<void>>,
    open_judging: this.txFromJSON<Result<void>>,
    remove_judge: this.txFromJSON<Result<void>>,
    get_hackathon: this.txFromJSON<Result<Hackathon>>,
    register_team: this.txFromJSON<Result<void>>,
    get_submission: this.txFromJSON<Result<Submission>>,
    submit_project: this.txFromJSON<Result<void>>,
    cancel_hackathon: this.txFromJSON<Result<void>>,
    create_hackathon: this.txFromJSON<Result<u64>>,
    score_submission: this.txFromJSON<Result<void>>,
    finalize_hackathon: this.txFromJSON<Result<void>>,
    add_sponsored_track: this.txFromJSON<Result<u32>>,
    disqualify_submission: this.txFromJSON<Result<void>>,
    distribute_track_prizes: this.txFromJSON<Result<void>>,
  };
}
