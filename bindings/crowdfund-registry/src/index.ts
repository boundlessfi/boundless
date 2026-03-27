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
    contractId: 'CBH5URRJX6A34P5XJ2RWHYGQK4HXICO2OTTYLFZEM55FCI2XAW6QCOKN',
  },
} as const;

export const CrowdfundError = {
  800: { message: 'AlreadyInitialized' },
  801: { message: 'NotInitialized' },
  802: { message: 'NotAuthorized' },
  803: { message: 'CampaignNotFound' },
  804: { message: 'DeadlinePassed' },
  805: { message: 'NotCampaigning' },
  806: { message: 'BelowMinPledge' },
  807: { message: 'InvalidState' },
  808: { message: 'MilestoneNotPending' },
  809: { message: 'MilestoneNotFound' },
  810: { message: 'MilestoneNotSubmitted' },
  811: { message: 'CampaignAlreadyFunded' },
  812: { message: 'CampaignActive' },
  813: { message: 'NoPledgeFound' },
  814: { message: 'AlreadyRefunded' },
  815: { message: 'NotOwner' },
  816: { message: 'InvalidMilestones' },
  817: { message: 'RefundBatchDone' },
  818: { message: 'DeadlineNotPassed' },
  819: { message: 'AmountNotPositive' },
  820: { message: 'Overflow' },
  821: { message: 'MilestoneNotOverdue' },
  822: { message: 'NotBacker' },
  823: { message: 'NotDraft' },
  824: { message: 'NotSubmitted' },
  825: { message: 'VoteThresholdNotMet' },
  826: { message: 'NoVoteSession' },
};

export interface Campaign {
  asset: string;
  backer_count: u32;
  current_funding: i128;
  deadline: u64;
  funding_goal: i128;
  id: u64;
  metadata_cid: string;
  milestone_count: u32;
  min_pledge: i128;
  owner: string;
  pool_id: Buffer;
  refund_progress: u32;
  status: CampaignStatus;
  vote_session_id: Option<Buffer>;
}

export interface Milestone {
  description: string;
  id: u32;
  pct: u32;
  status: CrowdfundMilestoneStatus;
}

export type VoteContext =
  | { tag: 'CampaignValidation'; values: void }
  | { tag: 'RetrospectiveGrant'; values: void }
  | { tag: 'QFRound'; values: void }
  | { tag: 'HackathonJudging'; values: void };

export type CampaignStatus =
  | { tag: 'Draft'; values: void }
  | { tag: 'Submitted'; values: void }
  | { tag: 'Validated'; values: void }
  | { tag: 'Campaigning'; values: void }
  | { tag: 'Funded'; values: void }
  | { tag: 'Executing'; values: void }
  | { tag: 'Completed'; values: void }
  | { tag: 'Failed'; values: void }
  | { tag: 'Cancelled'; values: void };

export type CrowdfundDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'CoreEscrow'; values: void }
  | { tag: 'ReputationRegistry'; values: void }
  | { tag: 'GovernanceVoting'; values: void }
  | { tag: 'CampaignCount'; values: void }
  | { tag: 'Campaign'; values: readonly [u64] }
  | { tag: 'CampaignMilestone'; values: readonly [u64, u32] }
  | { tag: 'Pledge'; values: readonly [u64, string] }
  | { tag: 'BackerBatch'; values: readonly [u64, u32] };

export type CrowdfundMilestoneStatus =
  | { tag: 'Pending'; values: void }
  | { tag: 'Submitted'; values: void }
  | { tag: 'Approved'; values: void }
  | { tag: 'Released'; values: void }
  | { tag: 'Rejected'; values: void }
  | { tag: 'Disputed'; values: void };

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
   * Construct and simulate a pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pledge: (
    {
      backer,
      campaign_id,
      amount,
    }: { backer: string; campaign_id: u64; amount: i128 },
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
   * Construct and simulate a get_pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pledge: (
    { campaign_id, backer }: { campaign_id: u64; backer: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<i128>>;

  /**
   * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Campaign>>>;

  /**
   * Construct and simulate a get_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_milestone: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Milestone>>>;

  /**
   * Construct and simulate a vote_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote_campaign: (
    {
      voter,
      campaign_id,
      option_id,
    }: { voter: string; campaign_id: u64; option_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a check_deadline transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  check_deadline: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a cancel_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_campaign: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_campaign: (
    {
      owner,
      metadata_cid,
      funding_goal,
      asset,
      deadline,
      milestone_descs,
      min_pledge,
    }: {
      owner: string;
      metadata_cid: string;
      funding_goal: i128;
      asset: string;
      deadline: u64;
      milestone_descs: Array<readonly [string, u32]>;
      min_pledge: i128;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a reject_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject_campaign: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_campaign: (
    {
      campaign_id,
      voting_duration,
      vote_threshold,
    }: { campaign_id: u64; voting_duration: u64; vote_threshold: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a get_vote_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_vote_session: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a reject_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject_milestone: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a submit_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_milestone: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_milestone: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a dispute_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  dispute_milestone: (
    {
      disputer,
      campaign_id,
      milestone_index,
    }: { disputer: string; campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a submit_for_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_for_review: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_campaign_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign_count: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a terminate_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  terminate_campaign: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a check_vote_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  check_vote_threshold: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a process_refund_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  process_refund_batch: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a flag_overdue_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  flag_overdue_milestone: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a request_milestone_revision transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  request_milestone_revision: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
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
        'AAAABAAAAAAAAAAAAAAADkNyb3dkZnVuZEVycm9yAAAAAAAbAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAyAAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAMhAAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAADIgAAAAAAAAAQQ2FtcGFpZ25Ob3RGb3VuZAAAAyMAAAAAAAAADkRlYWRsaW5lUGFzc2VkAAAAAAMkAAAAAAAAAA5Ob3RDYW1wYWlnbmluZwAAAAADJQAAAAAAAAAOQmVsb3dNaW5QbGVkZ2UAAAAAAyYAAAAAAAAADEludmFsaWRTdGF0ZQAAAycAAAAAAAAAE01pbGVzdG9uZU5vdFBlbmRpbmcAAAADKAAAAAAAAAARTWlsZXN0b25lTm90Rm91bmQAAAAAAAMpAAAAAAAAABVNaWxlc3RvbmVOb3RTdWJtaXR0ZWQAAAAAAAMqAAAAAAAAABVDYW1wYWlnbkFscmVhZHlGdW5kZWQAAAAAAAMrAAAAAAAAAA5DYW1wYWlnbkFjdGl2ZQAAAAADLAAAAAAAAAANTm9QbGVkZ2VGb3VuZAAAAAAAAy0AAAAAAAAAD0FscmVhZHlSZWZ1bmRlZAAAAAMuAAAAAAAAAAhOb3RPd25lcgAAAy8AAAAAAAAAEUludmFsaWRNaWxlc3RvbmVzAAAAAAADMAAAAAAAAAAPUmVmdW5kQmF0Y2hEb25lAAAAAzEAAAAAAAAAEURlYWRsaW5lTm90UGFzc2VkAAAAAAADMgAAAAAAAAARQW1vdW50Tm90UG9zaXRpdmUAAAAAAAMzAAAAAAAAAAhPdmVyZmxvdwAAAzQAAAAAAAAAE01pbGVzdG9uZU5vdE92ZXJkdWUAAAADNQAAAAAAAAAJTm90QmFja2VyAAAAAAADNgAAAAAAAAAITm90RHJhZnQAAAM3AAAAAAAAAAxOb3RTdWJtaXR0ZWQAAAM4AAAAAAAAABNWb3RlVGhyZXNob2xkTm90TWV0AAAAAzkAAAAAAAAADU5vVm90ZVNlc3Npb24AAAAAAAM6',
        'AAAABQAAAAAAAAAAAAAADkNhbXBhaWduRmFpbGVkAAAAAAABAAAAD2NhbXBhaWduX2ZhaWxlZAAAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAADkNhbXBhaWduRnVuZGVkAAAAAAABAAAAD2NhbXBhaWduX2Z1bmRlZAAAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAADlBsZWRnZVJlY29yZGVkAAAAAAABAAAAD3BsZWRnZV9yZWNvcmRlZAAAAAADAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAD0NhbXBhaWduQ3JlYXRlZAAAAAABAAAAEGNhbXBhaWduX2NyZWF0ZWQAAAADAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAAAAAADGZ1bmRpbmdfZ29hbAAAAAsAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEENhbXBhaWduQXBwcm92ZWQAAAABAAAAEWNhbXBhaWduX2FwcHJvdmVkAAAAAAAAAgAAAAAAAAACaWQAAAAAAAYAAAABAAAAAAAAAA92b3RlX3Nlc3Npb25faWQAAAAD7gAAACAAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEENhbXBhaWduUmVqZWN0ZWQAAAABAAAAEWNhbXBhaWduX3JlamVjdGVkAAAAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEE1pbGVzdG9uZU92ZXJkdWUAAAABAAAAEW1pbGVzdG9uZV9vdmVyZHVlAAAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAAAAAAADG1pbGVzdG9uZV9pZAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEUNhbXBhaWduQ2FuY2VsbGVkAAAAAAAAAQAAABJjYW1wYWlnbl9jYW5jZWxsZWQAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEUNhbXBhaWduVmFsaWRhdGVkAAAAAAAAAQAAABJjYW1wYWlnbl92YWxpZGF0ZWQAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEU1pbGVzdG9uZUFwcHJvdmVkAAAAAAAAAQAAABJtaWxlc3RvbmVfYXBwcm92ZWQAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAI=',
        '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',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY29yZV9lc2Nyb3cAAAAAEwAAAAAAAAATcmVwdXRhdGlvbl9yZWdpc3RyeQAAAAATAAAAAAAAABFnb3Zlcm5hbmNlX3ZvdGluZwAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAGcGxlZGdlAAAAAAADAAAAAAAAAAZiYWNrZXIAAAAAABMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAKZ2V0X3BsZWRnZQAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAGYmFja2VyAAAAAAATAAAAAQAAAAs=',
        'AAAAAAAAAAAAAAAMZ2V0X2NhbXBhaWduAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAPpAAAH0AAAAAhDYW1wYWlnbgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAANZ2V0X21pbGVzdG9uZQAAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAfQAAAACU1pbGVzdG9uZQAAAAAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAANdm90ZV9jYW1wYWlnbgAAAAAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAJb3B0aW9uX2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAOY2hlY2tfZGVhZGxpbmUAAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAPY2FuY2VsX2NhbXBhaWduAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAcAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAMbWV0YWRhdGFfY2lkAAAAEAAAAAAAAAAMZnVuZGluZ19nb2FsAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAAD21pbGVzdG9uZV9kZXNjcwAAAAPqAAAD7QAAAAIAAAAQAAAABAAAAAAAAAAKbWluX3BsZWRnZQAAAAAACwAAAAEAAAPpAAAABgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAPcmVqZWN0X2NhbXBhaWduAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAQYXBwcm92ZV9jYW1wYWlnbgAAAAMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD3ZvdGluZ19kdXJhdGlvbgAAAAAGAAAAAAAAAA52b3RlX3RocmVzaG9sZAAAAAAABAAAAAEAAAPpAAAD7gAAACAAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAQZ2V0X3ZvdGVfc2Vzc2lvbgAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAA+4AAAAgAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAQcmVqZWN0X21pbGVzdG9uZQAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAQc3VibWl0X21pbGVzdG9uZQAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAARYXBwcm92ZV9taWxlc3RvbmUAAAAAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAARZGlzcHV0ZV9taWxlc3RvbmUAAAAAAAADAAAAAAAAAAhkaXNwdXRlcgAAABMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAARc3VibWl0X2Zvcl9yZXZpZXcAAAAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAASZ2V0X2NhbXBhaWduX2NvdW50AAAAAAAAAAAAAQAAAAY=',
        'AAAAAAAAAAAAAAASdGVybWluYXRlX2NhbXBhaWduAAAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAUY2hlY2tfdm90ZV90aHJlc2hvbGQAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAUcHJvY2Vzc19yZWZ1bmRfYmF0Y2gAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAWZmxhZ19vdmVyZHVlX21pbGVzdG9uZQAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAPbWlsZXN0b25lX2luZGV4AAAAAAQAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAacmVxdWVzdF9taWxlc3RvbmVfcmV2aXNpb24AAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAgAAADZHcmFudWxhciBzdWItdHlwZSBmb3IgZmVlIHJhdGUgbG9va3VwIGFuZCBhdWRpdCB0cmFpbC4AAAAAAAAAAAAHU3ViVHlwZQAAAAAKAAAAAAAAAAAAAAAKQm91bnR5RkNGUwAAAAAAAAAAAAAAAAARQm91bnR5QXBwbGljYXRpb24AAAAAAAAAAAAAAAAAAA1Cb3VudHlDb250ZXN0AAAAAAAAAAAAAAAAAAALQm91bnR5U3BsaXQAAAAAAAAAAAAAAAAPQ3Jvd2RmdW5kUGxlZGdlAAAAAAAAAAAAAAAADkdyYW50TWlsZXN0b25lAAAAAAAAAAAAAAAAABJHcmFudFJldHJvc3BlY3RpdmUAAAAAAAAAAAAAAAAAE0dyYW50UUZNYXRjaGluZ1Bvb2wAAAAAAAAAAAAAAAANSGFja2F0aG9uTWFpbgAAAAAAAAAAAAAAAAAADkhhY2thdGhvblRyYWNrAAA=',
        'AAAAAgAAAFBJZGVudGlmaWVzIHdoaWNoIHBsYXRmb3JtIG1vZHVsZSBvd25zIGEgcmVzb3VyY2UgKGVzY3JvdyBwb29sLCBmZWUgcmVjb3JkLCBldGMuKQAAAAAAAAAKTW9kdWxlVHlwZQAAAAAABAAAAAAAAAAAAAAABkJvdW50eQAAAAAAAAAAAAAAAAAJQ3Jvd2RmdW5kAAAAAAAAAAAAAAAAAAAFR3JhbnQAAAAAAAAAAAAAAAAAAAlIYWNrYXRob24AAAA=',
        'AAAAAgAAAExTa2lsbC9hY3Rpdml0eSBjYXRlZ29yaWVzIHVzZWQgYWNyb3NzIHJlcHV0YXRpb24gc2NvcmluZyBhbmQgYm91bnR5IHRhZ2dpbmcuAAAAAAAAABBBY3Rpdml0eUNhdGVnb3J5AAAABQAAAAAAAAAAAAAAC0RldmVsb3BtZW50AAAAAAAAAAAAAAAABkRlc2lnbgAAAAAAAAAAAAAAAAAJTWFya2V0aW5nAAAAAAAAAAAAAAAAAAAIU2VjdXJpdHkAAAAAAAAAAAAAAAlDb21tdW5pdHkAAAA=',
      ]),
      options
    );
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
    pledge: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
    get_pledge: this.txFromJSON<i128>,
    get_campaign: this.txFromJSON<Result<Campaign>>,
    get_milestone: this.txFromJSON<Result<Milestone>>,
    vote_campaign: this.txFromJSON<Result<void>>,
    check_deadline: this.txFromJSON<Result<void>>,
    cancel_campaign: this.txFromJSON<Result<void>>,
    create_campaign: this.txFromJSON<Result<u64>>,
    reject_campaign: this.txFromJSON<Result<void>>,
    approve_campaign: this.txFromJSON<Result<Buffer>>,
    get_vote_session: this.txFromJSON<Result<Buffer>>,
    reject_milestone: this.txFromJSON<Result<void>>,
    submit_milestone: this.txFromJSON<Result<void>>,
    approve_milestone: this.txFromJSON<Result<void>>,
    dispute_milestone: this.txFromJSON<Result<void>>,
    submit_for_review: this.txFromJSON<Result<void>>,
    get_campaign_count: this.txFromJSON<u64>,
    terminate_campaign: this.txFromJSON<Result<void>>,
    check_vote_threshold: this.txFromJSON<Result<void>>,
    process_refund_batch: this.txFromJSON<Result<void>>,
    flag_overdue_milestone: this.txFromJSON<Result<void>>,
    request_milestone_revision: this.txFromJSON<Result<void>>,
  };
}
