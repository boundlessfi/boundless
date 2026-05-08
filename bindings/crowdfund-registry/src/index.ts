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
  824: { message: 'NotSubmitted' },
  825: { message: 'VoteThresholdNotMet' },
  826: { message: 'NoVoteSession' },
  827: { message: 'MilestoneNotDisputed' },
  828: { message: 'MilestoneNotFlagged' },
  829: { message: 'GracePeriodNotExpired' },
};

/**
 * On-chain campaign state.
 * Metadata (title, description, team, etc.) lives in the backend database.
 * Only financial and access-control state is stored here.
 */
export interface Campaign {
  asset: string;
  backer_count: u32;
  current_funding: i128;
  deadline: u64;
  funding_goal: i128;
  id: u64;
  milestone_count: u32;
  min_pledge: i128;
  owner: string;
  pool_id: Buffer;
  status: CampaignStatus;
  vote_session_id: Option<Buffer>;
}

/**
 * On-chain milestone state.
 * Descriptions live in the backend database — only financial state is stored here.
 */
export interface Milestone {
  flagged_at: u64;
  id: u32;
  pct: u32;
  status: CrowdfundMilestoneStatus;
}

export interface VoteOption {
  id: u32;
  label: string;
  votes: u32;
  weighted_votes: u64;
}

export type VoteStatus =
  | { tag: 'Pending'; values: void }
  | { tag: 'Active'; values: void }
  | { tag: 'Concluded'; values: void }
  | { tag: 'Cancelled'; values: void };

export type VoteContext =
  | { tag: 'CampaignValidation'; values: void }
  | { tag: 'RetrospectiveGrant'; values: void }
  | { tag: 'QFRound'; values: void }
  | { tag: 'HackathonJudging'; values: void };

export interface VotingSession {
  context: VoteContext;
  created_at: u64;
  end_at: u64;
  module_id: u64;
  quorum: Option<u32>;
  session_id: Buffer;
  start_at: u64;
  status: VoteStatus;
  threshold: Option<u32>;
  threshold_reached: boolean;
  total_votes: u32;
  weight_by_reputation: boolean;
}

export type CampaignStatus =
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
  | { tag: 'Pledge'; values: readonly [u64, string] };

export type DisputeResolution =
  | { tag: 'ApproveCreator'; values: void }
  | { tag: 'ApproveBacker'; values: void };

/**
 * Reason a community vote rejected a campaign.
 * Replaces the old free-form String so the indexer can distinguish cases
 * without parsing strings.
 */
export type VoteRejectionReason =
  | { tag: 'RejectMajority'; values: void }
  | { tag: 'ExpiredWithoutApproval'; values: void };

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
      funding_goal,
      asset,
      deadline,
      milestone_pcts,
      min_pledge,
    }: {
      owner: string;
      funding_goal: i128;
      asset: string;
      deadline: u64;
      milestone_pcts: Array<u32>;
      min_pledge: i128;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<u64>>>;

  /**
   * Construct and simulate a reject_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin pre-vote rejection: cancels the campaign.
   * The rejection reason is recorded in the backend database, not on-chain.
   */
  reject_campaign: (
    { campaign_id }: { campaign_id: u64 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: (
    {
      campaign_id,
      milestone_index,
      resolution,
    }: {
      campaign_id: u64;
      milestone_index: u32;
      resolution: DisputeResolution;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a update_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update a campaign that is still in Submitted status (awaiting review).
   * Only financial/structural parameters are stored on-chain; metadata
   * updates (title, description, team, etc.) go through the backend only.
   */
  update_campaign: (
    {
      campaign_id,
      funding_goal,
      asset,
      deadline,
      milestone_pcts,
      min_pledge,
    }: {
      campaign_id: u64;
      funding_goal: i128;
      asset: string;
      deadline: u64;
      milestone_pcts: Array<u32>;
      min_pledge: i128;
    },
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
   * Construct and simulate a get_campaign_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign_count: (
    options?: MethodOptions
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a get_dispute_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_dispute_status: (
    {
      campaign_id,
      milestone_index,
    }: { campaign_id: u64; milestone_index: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<CrowdfundMilestoneStatus>>>;

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
   * Process a batch of refunds for a Failed or Cancelled campaign.
   *
   * The backend provides the list of backers to refund in this call.
   * The contract verifies each backer's stored pledge amount (ignoring
   * the hint amount from the caller) to prevent over-refunding, then
   * zeroes the pledge to prevent double-refunds.
   *
   * The backend is responsible for batch pagination and tracking which
   * backers have already been processed. This function is permissionless —
   * any caller may submit a batch.
   */
  process_refund_batch: (
    {
      campaign_id,
      backers,
    }: { campaign_id: u64; backers: Array<readonly [string, i128]> },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a owner_cancel_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner_cancel_campaign: (
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
   * Construct and simulate a escalate_overdue_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permissionless: escalate an overdue milestone after the 14-day grace period.
   * Rejects the milestone and cancels the campaign, enabling refunds.
   */
  escalate_overdue_milestone: (
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
        'AAAABAAAAAAAAAAAAAAADkNyb3dkZnVuZEVycm9yAAAAAAAdAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAyAAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAMhAAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAADIgAAAAAAAAAQQ2FtcGFpZ25Ob3RGb3VuZAAAAyMAAAAAAAAADkRlYWRsaW5lUGFzc2VkAAAAAAMkAAAAAAAAAA5Ob3RDYW1wYWlnbmluZwAAAAADJQAAAAAAAAAOQmVsb3dNaW5QbGVkZ2UAAAAAAyYAAAAAAAAADEludmFsaWRTdGF0ZQAAAycAAAAAAAAAE01pbGVzdG9uZU5vdFBlbmRpbmcAAAADKAAAAAAAAAARTWlsZXN0b25lTm90Rm91bmQAAAAAAAMpAAAAAAAAABVNaWxlc3RvbmVOb3RTdWJtaXR0ZWQAAAAAAAMqAAAAAAAAABVDYW1wYWlnbkFscmVhZHlGdW5kZWQAAAAAAAMrAAAAAAAAAA5DYW1wYWlnbkFjdGl2ZQAAAAADLAAAAAAAAAANTm9QbGVkZ2VGb3VuZAAAAAAAAy0AAAAAAAAAD0FscmVhZHlSZWZ1bmRlZAAAAAMuAAAAAAAAAAhOb3RPd25lcgAAAy8AAAAAAAAAEUludmFsaWRNaWxlc3RvbmVzAAAAAAADMAAAAAAAAAAPUmVmdW5kQmF0Y2hEb25lAAAAAzEAAAAAAAAAEURlYWRsaW5lTm90UGFzc2VkAAAAAAADMgAAAAAAAAARQW1vdW50Tm90UG9zaXRpdmUAAAAAAAMzAAAAAAAAAAhPdmVyZmxvdwAAAzQAAAAAAAAAE01pbGVzdG9uZU5vdE92ZXJkdWUAAAADNQAAAAAAAAAJTm90QmFja2VyAAAAAAADNgAAAAAAAAAMTm90U3VibWl0dGVkAAADOAAAAAAAAAATVm90ZVRocmVzaG9sZE5vdE1ldAAAAAM5AAAAAAAAAA1Ob1ZvdGVTZXNzaW9uAAAAAAADOgAAAAAAAAAUTWlsZXN0b25lTm90RGlzcHV0ZWQAAAM7AAAAAAAAABNNaWxlc3RvbmVOb3RGbGFnZ2VkAAAAAzwAAAAAAAAAFUdyYWNlUGVyaW9kTm90RXhwaXJlZAAAAAAAAz0=',
        'AAAABQAAAAAAAAAAAAAADkNhbXBhaWduRmFpbGVkAAAAAAABAAAAD2NhbXBhaWduX2ZhaWxlZAAAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAADkNhbXBhaWduRnVuZGVkAAAAAAABAAAAD2NhbXBhaWduX2Z1bmRlZAAAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAC',
        'AAAABQAAAAAAAAAAAAAADlBsZWRnZVJlY29yZGVkAAAAAAABAAAAD3BsZWRnZV9yZWNvcmRlZAAAAAADAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAD0NhbXBhaWduQ3JlYXRlZAAAAAABAAAAEGNhbXBhaWduX2NyZWF0ZWQAAAADAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAAAAAADGZ1bmRpbmdfZ29hbAAAAAsAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAD0NhbXBhaWduVXBkYXRlZAAAAAABAAAAEGNhbXBhaWduX3VwZGF0ZWQAAAACAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAAAAAADGZ1bmRpbmdfZ29hbAAAAAsAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAD0Rpc3B1dGVSZXNvbHZlZAAAAAABAAAAEGRpc3B1dGVfcmVzb2x2ZWQAAAADAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAAAAAAMbWlsZXN0b25lX2lkAAAABAAAAAAAAAAAAAAACnJlc29sdXRpb24AAAAAB9AAAAARRGlzcHV0ZVJlc29sdXRpb24AAAAAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEENhbXBhaWduQXBwcm92ZWQAAAABAAAAEWNhbXBhaWduX2FwcHJvdmVkAAAAAAAAAgAAAAAAAAACaWQAAAAAAAYAAAABAAAAAAAAAA92b3RlX3Nlc3Npb25faWQAAAAD7gAAACAAAAAAAAAAAg==',
        'AAAABQAAAJBFbWl0dGVkIHdoZW4gYW4gYWRtaW4gZXhwbGljaXRseSByZWplY3RzIGEgY2FtcGFpZ24gYmVmb3JlIHRoZSB2b3RlIHN0YWdlLgpUaGUgcmVqZWN0aW9uIHJlYXNvbiBpcyBzdG9yZWQgaW4gdGhlIGJhY2tlbmQgZGF0YWJhc2UsIG5vdCBvbi1jaGFpbi4AAAAAAAAAEENhbXBhaWduUmVqZWN0ZWQAAAABAAAAEWNhbXBhaWduX3JlamVjdGVkAAAAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEE1pbGVzdG9uZU92ZXJkdWUAAAABAAAAEW1pbGVzdG9uZV9vdmVyZHVlAAAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAAAAAAADG1pbGVzdG9uZV9pZAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAEUNhbXBhaWduQ2FuY2VsbGVkAAAAAAAAAQAAABJjYW1wYWlnbl9jYW5jZWxsZWQAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEUNhbXBhaWduVmFsaWRhdGVkAAAAAAAAAQAAABJjYW1wYWlnbl92YWxpZGF0ZWQAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEU1pbGVzdG9uZUFwcHJvdmVkAAAAAAAAAQAAABJtaWxlc3RvbmVfYXBwcm92ZWQAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEU1pbGVzdG9uZURpc3B1dGVkAAAAAAAAAQAAABJtaWxlc3RvbmVfZGlzcHV0ZWQAAAAAAAMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAAAAAAIZGlzcHV0ZXIAAAATAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEU1pbGVzdG9uZVJlamVjdGVkAAAAAAAAAQAAABJtaWxlc3RvbmVfcmVqZWN0ZWQAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEkNhbXBhaWduVGVybWluYXRlZAAAAAAAAQAAABNjYW1wYWlnbl90ZXJtaW5hdGVkAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEk1pbGVzdG9uZUVzY2FsYXRlZAAAAAAAAQAAABNtaWxlc3RvbmVfZXNjYWxhdGVkAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEk1pbGVzdG9uZVN1Ym1pdHRlZAAAAAAAAQAAABNtaWxlc3RvbmVfc3VibWl0dGVkAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAAAAAAI=',
        'AAAABQAAAJpFbWl0dGVkIHdoZW4gYSBjb21tdW5pdHkgdm90ZSByZXN1bHRzIGluIGNhbXBhaWduIHJlamVjdGlvbi4KYHJlYXNvbmAgZGlzdGluZ3Vpc2hlcyB0aGUgdHdvIHJlamVjdGlvbiBwYXRocyBzbyB0aGUgaW5kZXhlcgpkb2VzIG5vdCBuZWVkIHRvIHBhcnNlIHN0cmluZ3MuAAAAAAAAAAAAFENhbXBhaWduVm90ZVJlamVjdGVkAAAAAQAAABZjYW1wYWlnbl92b3RlX3JlamVjdGVkAAAAAAACAAAAAAAAAAJpZAAAAAAABgAAAAEAAAAAAAAABnJlYXNvbgAAAAAH0AAAABNWb3RlUmVqZWN0aW9uUmVhc29uAAAAAAAAAAAC',
        'AAAABQAAAK1FbWl0dGVkIGFmdGVyIGVhY2ggYHByb2Nlc3NfcmVmdW5kX2JhdGNoYCBjYWxsLgpgY291bnRgIGlzIHRoZSBudW1iZXIgb2YgYmFja2VycyByZWZ1bmRlZCBpbiB0aGlzIGNhbGwuClRoZSBiYWNrZW5kIHRyYWNrcyBiYXRjaCBwcm9ncmVzczsgbm8gYmF0Y2hfaW5kZXggaXMgc3RvcmVkIG9uLWNoYWluLgAAAAAAAAAAAAAUUmVmdW5kQmF0Y2hQcm9jZXNzZWQAAAABAAAAFnJlZnVuZF9iYXRjaF9wcm9jZXNzZWQAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAAAAAAVjb3VudAAAAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAGENhbXBhaWduQ2FuY2VsbGVkQnlPd25lcgAAAAEAAAAbY2FtcGFpZ25fY2FuY2VsbGVkX2J5X293bmVyAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAI=',
        'AAAABQAAAAAAAAAAAAAAGkNhbXBhaWduU3VibWl0dGVkRm9yUmV2aWV3AAAAAAABAAAAHWNhbXBhaWduX3N1Ym1pdHRlZF9mb3JfcmV2aWV3AAAAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAGk1pbGVzdG9uZVJldmlzaW9uUmVxdWVzdGVkAAAAAAABAAAAHG1pbGVzdG9uZV9yZXZpc2lvbl9yZXF1ZXN0ZWQAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAAAAAAMbWlsZXN0b25lX2lkAAAABAAAAAAAAAAC',
        'AAAAAQAAAJlPbi1jaGFpbiBjYW1wYWlnbiBzdGF0ZS4KTWV0YWRhdGEgKHRpdGxlLCBkZXNjcmlwdGlvbiwgdGVhbSwgZXRjLikgbGl2ZXMgaW4gdGhlIGJhY2tlbmQgZGF0YWJhc2UuCk9ubHkgZmluYW5jaWFsIGFuZCBhY2Nlc3MtY29udHJvbCBzdGF0ZSBpcyBzdG9yZWQgaGVyZS4AAAAAAAAAAAAACENhbXBhaWduAAAADAAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAxiYWNrZXJfY291bnQAAAAEAAAAAAAAAA9jdXJyZW50X2Z1bmRpbmcAAAAACwAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAAxmdW5kaW5nX2dvYWwAAAALAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAPbWlsZXN0b25lX2NvdW50AAAAAAQAAAAAAAAACm1pbl9wbGVkZ2UAAAAAAAsAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAHcG9vbF9pZAAAAAPuAAAAIAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAADkNhbXBhaWduU3RhdHVzAAAAAAAAAAAAD3ZvdGVfc2Vzc2lvbl9pZAAAAAPoAAAD7gAAACA=',
        'AAAAAQAAAGxPbi1jaGFpbiBtaWxlc3RvbmUgc3RhdGUuCkRlc2NyaXB0aW9ucyBsaXZlIGluIHRoZSBiYWNrZW5kIGRhdGFiYXNlIOKAlCBvbmx5IGZpbmFuY2lhbCBzdGF0ZSBpcyBzdG9yZWQgaGVyZS4AAAAAAAAACU1pbGVzdG9uZQAAAAAAAAQAAAAAAAAACmZsYWdnZWRfYXQAAAAAAAYAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAANwY3QAAAAABAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAGENyb3dkZnVuZE1pbGVzdG9uZVN0YXR1cw==',
        'AAAAAQAAAAAAAAAAAAAAClZvdGVPcHRpb24AAAAAAAQAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVsYWJlbAAAAAAAABAAAAAAAAAABXZvdGVzAAAAAAAABAAAAAAAAAAOd2VpZ2h0ZWRfdm90ZXMAAAAAAAY=',
        'AAAAAgAAAAAAAAAAAAAAClZvdGVTdGF0dXMAAAAAAAQAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAJQ29uY2x1ZGVkAAAAAAAAAAAAAAAAAAAJQ2FuY2VsbGVkAAAA',
        'AAAAAgAAAAAAAAAAAAAAC1ZvdGVDb250ZXh0AAAAAAQAAAAAAAAAAAAAABJDYW1wYWlnblZhbGlkYXRpb24AAAAAAAAAAAAAAAAAElJldHJvc3BlY3RpdmVHcmFudAAAAAAAAAAAAAAAAAAHUUZSb3VuZAAAAAAAAAAAAAAAABBIYWNrYXRob25KdWRnaW5n',
        'AAAAAQAAAAAAAAAAAAAADVZvdGluZ1Nlc3Npb24AAAAAAAAMAAAAAAAAAAdjb250ZXh0AAAAB9AAAAALVm90ZUNvbnRleHQAAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAZlbmRfYXQAAAAAAAYAAAAAAAAACW1vZHVsZV9pZAAAAAAAAAYAAAAAAAAABnF1b3J1bQAAAAAD6AAAAAQAAAAAAAAACnNlc3Npb25faWQAAAAAA+4AAAAgAAAAAAAAAAhzdGFydF9hdAAAAAYAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApWb3RlU3RhdHVzAAAAAAAAAAAACXRocmVzaG9sZAAAAAAAA+gAAAAEAAAAAAAAABF0aHJlc2hvbGRfcmVhY2hlZAAAAAAAAAEAAAAAAAAAC3RvdGFsX3ZvdGVzAAAAAAQAAAAAAAAAFHdlaWdodF9ieV9yZXB1dGF0aW9uAAAAAQ==',
        'AAAAAgAAAAAAAAAAAAAADkNhbXBhaWduU3RhdHVzAAAAAAAIAAAAAAAAAAAAAAAJU3VibWl0dGVkAAAAAAAAAAAAAAAAAAAJVmFsaWRhdGVkAAAAAAAAAAAAAAAAAAALQ2FtcGFpZ25pbmcAAAAAAAAAAAAAAAAGRnVuZGVkAAAAAAAAAAAAAAAAAAlFeGVjdXRpbmcAAAAAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAAAAAAAAAAAAAAAAAZGYWlsZWQAAAAAAAAAAAAAAAAACUNhbmNlbGxlZAAAAA==',
        'AAAAAgAAAAAAAAAAAAAAEENyb3dkZnVuZERhdGFLZXkAAAAIAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAAApDb3JlRXNjcm93AAAAAAAAAAAAAAAAABJSZXB1dGF0aW9uUmVnaXN0cnkAAAAAAAAAAAAAAAAAEEdvdmVybmFuY2VWb3RpbmcAAAAAAAAAAAAAAA1DYW1wYWlnbkNvdW50AAAAAAAAAQAAAAAAAAAIQ2FtcGFpZ24AAAABAAAABgAAAAEAAAAAAAAAEUNhbXBhaWduTWlsZXN0b25lAAAAAAAAAgAAAAYAAAAEAAAAAQAAAAAAAAAGUGxlZGdlAAAAAAACAAAABgAAABM=',
        'AAAAAgAAAAAAAAAAAAAAEURpc3B1dGVSZXNvbHV0aW9uAAAAAAAAAgAAAAAAAAAAAAAADkFwcHJvdmVDcmVhdG9yAAAAAAAAAAAAAAAAAA1BcHByb3ZlQmFja2VyAAAA',
        'AAAAAgAAAIxSZWFzb24gYSBjb21tdW5pdHkgdm90ZSByZWplY3RlZCBhIGNhbXBhaWduLgpSZXBsYWNlcyB0aGUgb2xkIGZyZWUtZm9ybSBTdHJpbmcgc28gdGhlIGluZGV4ZXIgY2FuIGRpc3Rpbmd1aXNoIGNhc2VzCndpdGhvdXQgcGFyc2luZyBzdHJpbmdzLgAAAAAAAAATVm90ZVJlamVjdGlvblJlYXNvbgAAAAACAAAAAAAAACsiUmVqZWN0IiBvcHRpb24gcmVjZWl2ZWQgbWFqb3JpdHkgb2Ygdm90ZXMuAAAAAA5SZWplY3RNYWpvcml0eQAAAAAAAAAAAEBWb3RpbmcgcGVyaW9kIGV4cGlyZWQgYmVmb3JlIHRoZSBhcHByb3ZhbCB0aHJlc2hvbGQgd2FzIHJlYWNoZWQuAAAAFkV4cGlyZWRXaXRob3V0QXBwcm92YWwAAA==',
        'AAAAAgAAAAAAAAAAAAAAGENyb3dkZnVuZE1pbGVzdG9uZVN0YXR1cwAAAAYAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAACVN1Ym1pdHRlZAAAAAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIUmVsZWFzZWQAAAAAAAAAAAAAAAhSZWplY3RlZAAAAAAAAAAAAAAACERpc3B1dGVk',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALY29yZV9lc2Nyb3cAAAAAEwAAAAAAAAATcmVwdXRhdGlvbl9yZWdpc3RyeQAAAAATAAAAAAAAABFnb3Zlcm5hbmNlX3ZvdGluZwAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAGcGxlZGdlAAAAAAADAAAAAAAAAAZiYWNrZXIAAAAAABMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAKZ2V0X3BsZWRnZQAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAGYmFja2VyAAAAAAATAAAAAQAAAAs=',
        'AAAAAAAAAAAAAAAMZ2V0X2NhbXBhaWduAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAPpAAAH0AAAAAhDYW1wYWlnbgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAANZ2V0X21pbGVzdG9uZQAAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAfQAAAACU1pbGVzdG9uZQAAAAAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAANdm90ZV9jYW1wYWlnbgAAAAAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAJb3B0aW9uX2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAOY2hlY2tfZGVhZGxpbmUAAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAPY2FuY2VsX2NhbXBhaWduAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAYAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAMZnVuZGluZ19nb2FsAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAADm1pbGVzdG9uZV9wY3RzAAAAAAPqAAAABAAAAAAAAAAKbWluX3BsZWRnZQAAAAAACwAAAAEAAAPpAAAABgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAHdBZG1pbiBwcmUtdm90ZSByZWplY3Rpb246IGNhbmNlbHMgdGhlIGNhbXBhaWduLgpUaGUgcmVqZWN0aW9uIHJlYXNvbiBpcyByZWNvcmRlZCBpbiB0aGUgYmFja2VuZCBkYXRhYmFzZSwgbm90IG9uLWNoYWluLgAAAAAPcmVqZWN0X2NhbXBhaWduAAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAAAAAApyZXNvbHV0aW9uAAAAAAfQAAAAEURpc3B1dGVSZXNvbHV0aW9uAAAAAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAM9VcGRhdGUgYSBjYW1wYWlnbiB0aGF0IGlzIHN0aWxsIGluIFN1Ym1pdHRlZCBzdGF0dXMgKGF3YWl0aW5nIHJldmlldykuCk9ubHkgZmluYW5jaWFsL3N0cnVjdHVyYWwgcGFyYW1ldGVycyBhcmUgc3RvcmVkIG9uLWNoYWluOyBtZXRhZGF0YQp1cGRhdGVzICh0aXRsZSwgZGVzY3JpcHRpb24sIHRlYW0sIGV0Yy4pIGdvIHRocm91Z2ggdGhlIGJhY2tlbmQgb25seS4AAAAAD3VwZGF0ZV9jYW1wYWlnbgAAAAAGAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAxmdW5kaW5nX2dvYWwAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAObWlsZXN0b25lX3BjdHMAAAAAA+oAAAAEAAAAAAAAAAptaW5fcGxlZGdlAAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAQYXBwcm92ZV9jYW1wYWlnbgAAAAMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD3ZvdGluZ19kdXJhdGlvbgAAAAAGAAAAAAAAAA52b3RlX3RocmVzaG9sZAAAAAAABAAAAAEAAAPpAAAD7gAAACAAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAAQZ2V0X3ZvdGVfc2Vzc2lvbgAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAD6QAAA+4AAAAgAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAQcmVqZWN0X21pbGVzdG9uZQAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAQc3VibWl0X21pbGVzdG9uZQAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAARYXBwcm92ZV9taWxlc3RvbmUAAAAAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAARZGlzcHV0ZV9taWxlc3RvbmUAAAAAAAADAAAAAAAAAAhkaXNwdXRlcgAAABMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAASZ2V0X2NhbXBhaWduX2NvdW50AAAAAAAAAAAAAQAAAAY=',
        'AAAAAAAAAAAAAAASZ2V0X2Rpc3B1dGVfc3RhdHVzAAAAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAH0AAAABhDcm93ZGZ1bmRNaWxlc3RvbmVTdGF0dXMAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAAAAAAASdGVybWluYXRlX2NhbXBhaWduAAAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAUY2hlY2tfdm90ZV90aHJlc2hvbGQAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAd1Qcm9jZXNzIGEgYmF0Y2ggb2YgcmVmdW5kcyBmb3IgYSBGYWlsZWQgb3IgQ2FuY2VsbGVkIGNhbXBhaWduLgoKVGhlIGJhY2tlbmQgcHJvdmlkZXMgdGhlIGxpc3Qgb2YgYmFja2VycyB0byByZWZ1bmQgaW4gdGhpcyBjYWxsLgpUaGUgY29udHJhY3QgdmVyaWZpZXMgZWFjaCBiYWNrZXIncyBzdG9yZWQgcGxlZGdlIGFtb3VudCAoaWdub3JpbmcKdGhlIGhpbnQgYW1vdW50IGZyb20gdGhlIGNhbGxlcikgdG8gcHJldmVudCBvdmVyLXJlZnVuZGluZywgdGhlbgp6ZXJvZXMgdGhlIHBsZWRnZSB0byBwcmV2ZW50IGRvdWJsZS1yZWZ1bmRzLgoKVGhlIGJhY2tlbmQgaXMgcmVzcG9uc2libGUgZm9yIGJhdGNoIHBhZ2luYXRpb24gYW5kIHRyYWNraW5nIHdoaWNoCmJhY2tlcnMgaGF2ZSBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkLiBUaGlzIGZ1bmN0aW9uIGlzIHBlcm1pc3Npb25sZXNzIOKAlAphbnkgY2FsbGVyIG1heSBzdWJtaXQgYSBiYXRjaC4AAAAAAAAUcHJvY2Vzc19yZWZ1bmRfYmF0Y2gAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAdiYWNrZXJzAAAAA+oAAAPtAAAAAgAAABMAAAALAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
        'AAAAAAAAAAAAAAAVb3duZXJfY2FuY2VsX2NhbXBhaWduAAAAAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAPpAAAAAgAAB9AAAAAOQ3Jvd2RmdW5kRXJyb3IAAA==',
        'AAAAAAAAAAAAAAAWZmxhZ19vdmVyZHVlX21pbGVzdG9uZQAAAAAAAgAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAAAAAAPbWlsZXN0b25lX2luZGV4AAAAAAQAAAABAAAD6QAAAAIAAAfQAAAADkNyb3dkZnVuZEVycm9yAAA=',
        'AAAAAAAAAI5QZXJtaXNzaW9ubGVzczogZXNjYWxhdGUgYW4gb3ZlcmR1ZSBtaWxlc3RvbmUgYWZ0ZXIgdGhlIDE0LWRheSBncmFjZSBwZXJpb2QuClJlamVjdHMgdGhlIG1pbGVzdG9uZSBhbmQgY2FuY2VscyB0aGUgY2FtcGFpZ24sIGVuYWJsaW5nIHJlZnVuZHMuAAAAAAAaZXNjYWxhdGVfb3ZlcmR1ZV9taWxlc3RvbmUAAAAAAAIAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA5Dcm93ZGZ1bmRFcnJvcgAA',
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
    resolve_dispute: this.txFromJSON<Result<void>>,
    update_campaign: this.txFromJSON<Result<void>>,
    approve_campaign: this.txFromJSON<Result<Buffer>>,
    get_vote_session: this.txFromJSON<Result<Buffer>>,
    reject_milestone: this.txFromJSON<Result<void>>,
    submit_milestone: this.txFromJSON<Result<void>>,
    approve_milestone: this.txFromJSON<Result<void>>,
    dispute_milestone: this.txFromJSON<Result<void>>,
    get_campaign_count: this.txFromJSON<u64>,
    get_dispute_status: this.txFromJSON<Result<CrowdfundMilestoneStatus>>,
    terminate_campaign: this.txFromJSON<Result<void>>,
    check_vote_threshold: this.txFromJSON<Result<void>>,
    process_refund_batch: this.txFromJSON<Result<void>>,
    owner_cancel_campaign: this.txFromJSON<Result<void>>,
    flag_overdue_milestone: this.txFromJSON<Result<void>>,
    escalate_overdue_milestone: this.txFromJSON<Result<void>>,
    request_milestone_revision: this.txFromJSON<Result<void>>,
  };
}
