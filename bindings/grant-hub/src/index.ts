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
    contractId: 'CAWFSZRB4PM3UPXAF7GTIDWS3OTAVMHN2ZPYZVG4DUIE2BLBUBAER5YL',
  },
} as const;

export const GrantError = {
  900: { message: 'AlreadyInitialized' },
  901: { message: 'NotInitialized' },
  902: { message: 'GrantNotFound' },
  903: { message: 'NotMilestoneGrant' },
  904: { message: 'NotRetrospectiveGrant' },
  905: { message: 'NotQFGrant' },
  906: { message: 'NotRecipient' },
  907: { message: 'MilestoneNotFound' },
  908: { message: 'InvalidMilestoneStatus' },
  909: { message: 'MilestoneNotSubmitted' },
  910: { message: 'InvalidAmount' },
  911: { message: 'InvalidMilestonePercents' },
  912: { message: 'GrantNotActive' },
  913: { message: 'VotingNotEnded' },
  914: { message: 'NoVoteSession' },
  915: { message: 'InvalidProjectIndex' },
  916: { message: 'CannotCancel' },
  917: { message: 'NotCreator' },
  918: { message: 'Overflow' },
};

export interface Grant {
  amount: i128;
  asset: string;
  created_at: u64;
  creator: string;
  grant_type: GrantType;
  id: u64;
  metadata_cid: string;
  milestone_count: u32;
  pool_id: Buffer;
  status: GrantStatus;
}

export type GrantType =
  | { tag: 'Milestone'; values: void }
  | { tag: 'Retrospective'; values: void }
  | { tag: 'QF'; values: void };

export interface VoteOption {
  id: u32;
  label: string;
  votes: u32;
  weighted_votes: u64;
}

export type GrantStatus =
  | { tag: 'Pending'; values: void }
  | { tag: 'Active'; values: void }
  | { tag: 'Executing'; values: void }
  | { tag: 'Completed'; values: void }
  | { tag: 'Cancelled'; values: void };

export interface QFRoundData {
  matching_pool: i128;
  project_count: u32;
  session_id: Buffer;
}

export type VoteContext =
  | { tag: 'CampaignValidation'; values: void }
  | { tag: 'RetrospectiveGrant'; values: void }
  | { tag: 'QFRound'; values: void }
  | { tag: 'HackathonJudging'; values: void };

export type GrantDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'CoreEscrow'; values: void }
  | { tag: 'ReputationRegistry'; values: void }
  | { tag: 'GovernanceVoting'; values: void }
  | { tag: 'GrantCount'; values: void }
  | { tag: 'Grant'; values: readonly [u64] }
  | { tag: 'GrantMilestone'; values: readonly [u64, u32] }
  | { tag: 'GrantRecipient'; values: readonly [u64] }
  | { tag: 'QFRound'; values: readonly [u64] }
  | { tag: 'RetroSession'; values: readonly [u64] };

export interface GrantMilestone {
  description: string;
  id: u32;
  pct: u32;
  status: GrantMilestoneStatus;
}

export type GrantMilestoneStatus =
  | { tag: 'Pending'; values: void }
  | { tag: 'Submitted'; values: void }
  | { tag: 'Approved'; values: void }
  | { tag: 'Released'; values: void }
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
      governance_voting,
    }: {
      admin: string;
      core_escrow: string;
      reputation_registry: string;
      governance_voting: string;
    },
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
   * Construct and simulate a get_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_grant: (
    { grant_id }: { grant_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Grant>>>;

  /**
   * Construct and simulate a cancel_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_grant: (
    { creator, grant_id }: { creator: string; grant_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_qf_round: (
    { grant_id }: { grant_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<QFRoundData>>>;

  /**
   * Construct and simulate a get_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_milestone: (
    { grant_id, milestone_index }: { grant_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<GrantMilestone>>>;

  /**
   * Construct and simulate a create_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_qf_round: (
    {
      creator,
      matching_pool,
      asset,
      project_names,
      duration,
    }: {
      creator: string;
      matching_pool: i128;
      asset: string;
      project_names: Array<string>;
      duration: u64;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a donate_to_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  donate_to_project: (
    {
      grant_id,
      amount,
      project_index,
    }: { grant_id: u64; amount: i128; project_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a finalize_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  finalize_qf_round: (
    {
      grant_id,
      project_addresses,
    }: { grant_id: u64; project_addresses: Array<string> },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_retro_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_retro_session: (
    { grant_id }: { grant_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a create_milestone_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_milestone_grant: (
    {
      creator,
      recipient,
      amount,
      asset,
      milestone_descs,
    }: {
      creator: string;
      recipient: string;
      amount: i128;
      asset: string;
      milestone_descs: Array<readonly [string, u32]>;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a finalize_retrospective transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  finalize_retrospective: (
    { grant_id, recipients }: { grant_id: u64; recipients: Array<string> },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a submit_grant_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_grant_milestone: (
    {
      recipient,
      grant_id,
      milestone_index,
    }: { recipient: string; grant_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_grant_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_grant_milestone: (
    { grant_id, milestone_index }: { grant_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_retrospective_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_retrospective_grant: (
    {
      creator,
      amount,
      asset,
      vote_options,
      voting_duration,
    }: {
      creator: string;
      amount: i128;
      asset: string;
      vote_options: Array<string>;
      voting_duration: u64;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;
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
        'AAAABAAAAAAAAAAAAAAACkdyYW50RXJyb3IAAAAAABMAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAADhAAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAA4UAAAAAAAAADUdyYW50Tm90Rm91bmQAAAAAAAOGAAAAAAAAABFOb3RNaWxlc3RvbmVHcmFudAAAAAAAA4cAAAAAAAAAFU5vdFJldHJvc3BlY3RpdmVHcmFudAAAAAAAA4gAAAAAAAAACk5vdFFGR3JhbnQAAAAAA4kAAAAAAAAADE5vdFJlY2lwaWVudAAAA4oAAAAAAAAAEU1pbGVzdG9uZU5vdEZvdW5kAAAAAAADiwAAAAAAAAAWSW52YWxpZE1pbGVzdG9uZVN0YXR1cwAAAAADjAAAAAAAAAAVTWlsZXN0b25lTm90U3VibWl0dGVkAAAAAAADjQAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAA44AAAAAAAAAGEludmFsaWRNaWxlc3RvbmVQZXJjZW50cwAAA48AAAAAAAAADkdyYW50Tm90QWN0aXZlAAAAAAOQAAAAAAAAAA5Wb3RpbmdOb3RFbmRlZAAAAAADkQAAAAAAAAANTm9Wb3RlU2Vzc2lvbgAAAAAAA5IAAAAAAAAAE0ludmFsaWRQcm9qZWN0SW5kZXgAAAADkwAAAAAAAAAMQ2Fubm90Q2FuY2VsAAADlAAAAAAAAAAKTm90Q3JlYXRvcgAAAAADlQAAAAAAAAAIT3ZlcmZsb3cAAAOW',
        'AAAABQAAAAAAAAAAAAAADEdyYW50Q3JlYXRlZAAAAAEAAAANZ3JhbnRfY3JlYXRlZAAAAAAAAAQAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAAAAAAKZ3JhbnRfdHlwZQAAAAAH0AAAAAlHcmFudFR5cGUAAAAAAAAAAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAADkdyYW50Q29tcGxldGVkAAAAAAABAAAAD2dyYW50X2NvbXBsZXRlZAAAAAABAAAAAAAAAAhncmFudF9pZAAAAAYAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAADlFGRG9uYXRpb25NYWRlAAAAAAABAAAAEHFmX2RvbmF0aW9uX21hZGUAAAADAAAAAAAAAAhncmFudF9pZAAAAAYAAAAAAAAAAAAAAA1wcm9qZWN0X2luZGV4AAAAAAAABAAAAAAAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC',
        'AAAABQAAAAAAAAAAAAAAEU1pbGVzdG9uZUFwcHJvdmVkAAAAAAAAAQAAABJtaWxlc3RvbmVfYXBwcm92ZWQAAAAAAAIAAAAAAAAACGdyYW50X2lkAAAABgAAAAAAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEk1pbGVzdG9uZVN1Ym1pdHRlZAAAAAAAAQAAABNtaWxlc3RvbmVfc3VibWl0dGVkAAAAAAIAAAAAAAAACGdyYW50X2lkAAAABgAAAAAAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAAAAAAI=',
        'AAAAAQAAAAAAAAAAAAAABUdyYW50AAAAAAAACgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAKZ3JhbnRfdHlwZQAAAAAH0AAAAAlHcmFudFR5cGUAAAAAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAAQAAAAAAAAAA9taWxlc3RvbmVfY291bnQAAAAABAAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAC0dyYW50U3RhdHVzAA==',
        'AAAAAgAAAAAAAAAAAAAACUdyYW50VHlwZQAAAAAAAAMAAAAAAAAAAAAAAAlNaWxlc3RvbmUAAAAAAAAAAAAAAAAAAA1SZXRyb3NwZWN0aXZlAAAAAAAAAAAAAAAAAAACUUYAAA==',
        'AAAAAQAAAAAAAAAAAAAAClZvdGVPcHRpb24AAAAAAAQAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVsYWJlbAAAAAAAABAAAAAAAAAABXZvdGVzAAAAAAAABAAAAAAAAAAOd2VpZ2h0ZWRfdm90ZXMAAAAAAAY=',
        'AAAAAgAAAAAAAAAAAAAAC0dyYW50U3RhdHVzAAAAAAUAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAJRXhlY3V0aW5nAAAAAAAAAAAAAAAAAAAJQ29tcGxldGVkAAAAAAAAAAAAAAAAAAAJQ2FuY2VsbGVkAAAA',
        'AAAAAQAAAAAAAAAAAAAAC1FGUm91bmREYXRhAAAAAAMAAAAAAAAADW1hdGNoaW5nX3Bvb2wAAAAAAAALAAAAAAAAAA1wcm9qZWN0X2NvdW50AAAAAAAABAAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACA=',
        'AAAAAgAAAAAAAAAAAAAAC1ZvdGVDb250ZXh0AAAAAAQAAAAAAAAAAAAAABJDYW1wYWlnblZhbGlkYXRpb24AAAAAAAAAAAAAAAAAElJldHJvc3BlY3RpdmVHcmFudAAAAAAAAAAAAAAAAAAHUUZSb3VuZAAAAAAAAAAAAAAAABBIYWNrYXRob25KdWRnaW5n',
        'AAAAAgAAAAAAAAAAAAAADEdyYW50RGF0YUtleQAAAAoAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAAAAAAAAAAACkNvcmVFc2Nyb3cAAAAAAAAAAAAAAAAAElJlcHV0YXRpb25SZWdpc3RyeQAAAAAAAAAAAAAAAAAQR292ZXJuYW5jZVZvdGluZwAAAAAAAAAAAAAACkdyYW50Q291bnQAAAAAAAEAAAAAAAAABUdyYW50AAAAAAAAAQAAAAYAAAABAAAAAAAAAA5HcmFudE1pbGVzdG9uZQAAAAAAAgAAAAYAAAAEAAAAAQAAAAAAAAAOR3JhbnRSZWNpcGllbnQAAAAAAAEAAAAGAAAAAQAAAAAAAAAHUUZSb3VuZAAAAAABAAAABgAAAAEAAAAAAAAADFJldHJvU2Vzc2lvbgAAAAEAAAAG',
        'AAAAAQAAAAAAAAAAAAAADkdyYW50TWlsZXN0b25lAAAAAAAEAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAADcGN0AAAAAAQAAAAAAAAABnN0YXR1cwAAAAAH0AAAABRHcmFudE1pbGVzdG9uZVN0YXR1cw==',
        'AAAAAgAAAAAAAAAAAAAAFEdyYW50TWlsZXN0b25lU3RhdHVzAAAABQAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAJU3VibWl0dGVkAAAAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAAAAAAAAAAAAAhSZWxlYXNlZAAAAAAAAAAAAAAACFJlamVjdGVk',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY29yZV9lc2Nyb3cAAAAAEwAAAAAAAAATcmVwdXRhdGlvbl9yZWdpc3RyeQAAAAATAAAAAAAAABFnb3Zlcm5hbmNlX3ZvdGluZwAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAAJZ2V0X2dyYW50AAAAAAAAAQAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAQAAA+kAAAfQAAAABUdyYW50AAAAAAAH0AAAAApHcmFudEVycm9yAAA=',
        'AAAAAAAAAAAAAAAMY2FuY2VsX2dyYW50AAAAAgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAhncmFudF9pZAAAAAYAAAABAAAD6QAAAAIAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAAMZ2V0X3FmX3JvdW5kAAAAAQAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAQAAA+kAAAfQAAAAC1FGUm91bmREYXRhAAAAB9AAAAAKR3JhbnRFcnJvcgAA',
        'AAAAAAAAAAAAAAANZ2V0X21pbGVzdG9uZQAAAAAAAAIAAAAAAAAACGdyYW50X2lkAAAABgAAAAAAAAAPbWlsZXN0b25lX2luZGV4AAAAAAQAAAABAAAD6QAAB9AAAAAOR3JhbnRNaWxlc3RvbmUAAAAAB9AAAAAKR3JhbnRFcnJvcgAA',
        'AAAAAAAAAAAAAAAPY3JlYXRlX3FmX3JvdW5kAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAANbWF0Y2hpbmdfcG9vbAAAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAANcHJvamVjdF9uYW1lcwAAAAAAA+oAAAAQAAAAAAAAAAhkdXJhdGlvbgAAAAYAAAABAAAD6QAAAAYAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAARZG9uYXRlX3RvX3Byb2plY3QAAAAAAAADAAAAAAAAAAhncmFudF9pZAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAANcHJvamVjdF9pbmRleAAAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAARZmluYWxpemVfcWZfcm91bmQAAAAAAAACAAAAAAAAAAhncmFudF9pZAAAAAYAAAAAAAAAEXByb2plY3RfYWRkcmVzc2VzAAAAAAAD6gAAABMAAAABAAAD6QAAAAIAAAfQAAAACkdyYW50RXJyb3IAAA==',
        'AAAAAAAAAAAAAAARZ2V0X3JldHJvX3Nlc3Npb24AAAAAAAABAAAAAAAAAAhncmFudF9pZAAAAAYAAAABAAAD6QAAA+4AAAAgAAAH0AAAAApHcmFudEVycm9yAAA=',
        'AAAAAAAAAAAAAAAWY3JlYXRlX21pbGVzdG9uZV9ncmFudAAAAAAABQAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAPbWlsZXN0b25lX2Rlc2NzAAAAA+oAAAPtAAAAAgAAABAAAAAEAAAAAQAAA+kAAAAGAAAH0AAAAApHcmFudEVycm9yAAA=',
        'AAAAAAAAAAAAAAAWZmluYWxpemVfcmV0cm9zcGVjdGl2ZQAAAAAAAgAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAAAAAApyZWNpcGllbnRzAAAAAAPqAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAKR3JhbnRFcnJvcgAA',
        'AAAAAAAAAAAAAAAWc3VibWl0X2dyYW50X21pbGVzdG9uZQAAAAAAAwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAKR3JhbnRFcnJvcgAA',
        'AAAAAAAAAAAAAAAXYXBwcm92ZV9ncmFudF9taWxlc3RvbmUAAAAAAgAAAAAAAAAIZ3JhbnRfaWQAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAKR3JhbnRFcnJvcgAA',
        'AAAAAAAAAAAAAAAaY3JlYXRlX3JldHJvc3BlY3RpdmVfZ3JhbnQAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAADHZvdGVfb3B0aW9ucwAAA+oAAAAQAAAAAAAAAA92b3RpbmdfZHVyYXRpb24AAAAABgAAAAEAAAPpAAAABgAAB9AAAAAKR3JhbnRFcnJvcgAA',
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
    get_grant: this.txFromJSON<Result<Grant>>,
    cancel_grant: this.txFromJSON<Result<void>>,
    get_qf_round: this.txFromJSON<Result<QFRoundData>>,
    get_milestone: this.txFromJSON<Result<GrantMilestone>>,
    create_qf_round: this.txFromJSON<Result<u64>>,
    donate_to_project: this.txFromJSON<Result<void>>,
    finalize_qf_round: this.txFromJSON<Result<void>>,
    get_retro_session: this.txFromJSON<Result<Buffer>>,
    create_milestone_grant: this.txFromJSON<Result<u64>>,
    finalize_retrospective: this.txFromJSON<Result<void>>,
    submit_grant_milestone: this.txFromJSON<Result<void>>,
    approve_grant_milestone: this.txFromJSON<Result<void>>,
    create_retrospective_grant: this.txFromJSON<Result<u64>>,
  };
}
