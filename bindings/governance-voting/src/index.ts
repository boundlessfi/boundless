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
    contractId: 'CDVU77G53WQ4P24GBUPGJYGCDV3QSF6UWHQIHV7BCMGSUZAEA3IW6PSU',
  },
} as const;

export const GovernanceError = {
  500: { message: 'AlreadyInitialized' },
  501: { message: 'NotInitialized' },
  502: { message: 'NotAuthorized' },
  503: { message: 'ModuleNotAuthorized' },
  504: { message: 'SessionNotFound' },
  505: { message: 'SessionNotActive' },
  506: { message: 'AlreadyVoted' },
  507: { message: 'InvalidOption' },
  508: { message: 'SessionNotEnded' },
  509: { message: 'VotingNotStarted' },
  510: { message: 'InvalidTimeRange' },
  511: { message: 'Overflow' },
};

export interface QFDonation {
  amount: i128;
  donor: string;
  option_id: u32;
}

export interface VoteOption {
  id: u32;
  label: string;
  votes: u32;
  weighted_votes: u64;
}

export interface VoteRecord {
  option_id: u32;
  voted_at: u64;
  voter: string;
  weight: u32;
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

export type GovernanceDataKey =
  | { tag: 'Admin'; values: void }
  | { tag: 'Version'; values: void }
  | { tag: 'AuthorizedModule'; values: readonly [string] }
  | { tag: 'Session'; values: readonly [Buffer] }
  | { tag: 'VoteOption'; values: readonly [Buffer, u32] }
  | { tag: 'VoteRecord'; values: readonly [Buffer, string] }
  | { tag: 'QFDonation'; values: readonly [Buffer, string, u32] }
  | { tag: 'OptionCount'; values: readonly [Buffer] }
  | { tag: 'OptionSumSqrt'; values: readonly [Buffer, u32] };

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
   * Construct and simulate a cast_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cast_vote: (
    {
      voter,
      session_id,
      option_id,
    }: { voter: string; session_id: Buffer; option_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a has_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_voted: (
    { session_id, voter }: { session_id: Buffer; voter: string },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<boolean>>;

  /**
   * Construct and simulate a get_option transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_option: (
    { session_id, option_id }: { session_id: Buffer; option_id: u32 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<VoteOption>>>;

  /**
   * Construct and simulate a get_result transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_result: (
    { session_id }: { session_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Array<VoteOption>>>>;

  /**
   * Construct and simulate a get_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_session: (
    { session_id }: { session_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<VotingSession>>>;

  /**
   * Construct and simulate a cancel_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_session: (
    { session_id }: { session_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a create_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_session: (
    {
      module,
      context,
      module_id,
      vote_options,
      start_at,
      end_at,
      threshold,
      quorum,
      weight_by_reputation,
    }: {
      module: string;
      context: VoteContext;
      module_id: u64;
      vote_options: Array<string>;
      start_at: u64;
      end_at: u64;
      threshold: Option<u32>;
      quorum: Option<u32>;
      weight_by_reputation: boolean;
    },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a conclude_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  conclude_session: (
    { session_id }: { session_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a threshold_reached transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  threshold_reached: (
    { session_id }: { session_id: Buffer },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a record_qf_donation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_qf_donation: (
    {
      session_id,
      module,
      amount,
      option_id,
    }: { session_id: Buffer; module: string; amount: i128; option_id: u32 },
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
   * Construct and simulate a compute_qf_distribution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  compute_qf_distribution: (
    { session_id, matching_pool }: { session_id: Buffer; matching_pool: i128 },
    options?: MethodOptions
  ) => Promise<AssembledTransaction<Result<Array<readonly [u32, i128]>>>>;

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
        'AAAABAAAAAAAAAAAAAAAD0dvdmVybmFuY2VFcnJvcgAAAAAMAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAfQAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAH1AAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAAB9gAAAAAAAAATTW9kdWxlTm90QXV0aG9yaXplZAAAAAH3AAAAAAAAAA9TZXNzaW9uTm90Rm91bmQAAAAB+AAAAAAAAAAQU2Vzc2lvbk5vdEFjdGl2ZQAAAfkAAAAAAAAADEFscmVhZHlWb3RlZAAAAfoAAAAAAAAADUludmFsaWRPcHRpb24AAAAAAAH7AAAAAAAAAA9TZXNzaW9uTm90RW5kZWQAAAAB/AAAAAAAAAAQVm90aW5nTm90U3RhcnRlZAAAAf0AAAAAAAAAEEludmFsaWRUaW1lUmFuZ2UAAAH+AAAAAAAAAAhPdmVyZmxvdwAAAf8=',
        'AAAABQAAAAAAAAAAAAAACFZvdGVDYXN0AAAAAQAAAAl2b3RlX2Nhc3QAAAAAAAADAAAAAAAAAApzZXNzaW9uX2lkAAAAAAPuAAAAIAAAAAAAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAAAAAACW9wdGlvbl9pZAAAAAAAAAQAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAADlNlc3Npb25DcmVhdGVkAAAAAAABAAAAD3Nlc3Npb25fY3JlYXRlZAAAAAADAAAAAAAAAApzZXNzaW9uX2lkAAAAAAPuAAAAIAAAAAAAAAAAAAAAB2NvbnRleHQAAAAH0AAAAAtWb3RlQ29udGV4dAAAAAAAAAAAAAAAAAltb2R1bGVfaWQAAAAAAAAGAAAAAAAAAAI=',
        'AAAABQAAAAAAAAAAAAAAEFNlc3Npb25Db25jbHVkZWQAAAABAAAAEXNlc3Npb25fY29uY2x1ZGVkAAAAAAAAAQAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAAAAAAAAg==',
        'AAAABQAAAAAAAAAAAAAAElFGRG9uYXRpb25SZWNvcmRlZAAAAAAAAQAAABRxZl9kb25hdGlvbl9yZWNvcmRlZAAAAAQAAAAAAAAACnNlc3Npb25faWQAAAAAA+4AAAAgAAAAAAAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAAAAAAAAAAAJb3B0aW9uX2lkAAAAAAAABAAAAAAAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC',
        'AAAAAQAAAAAAAAAAAAAAClFGRG9uYXRpb24AAAAAAAMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAAAAAAlvcHRpb25faWQAAAAAAAAE',
        'AAAAAQAAAAAAAAAAAAAAClZvdGVPcHRpb24AAAAAAAQAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVsYWJlbAAAAAAAABAAAAAAAAAABXZvdGVzAAAAAAAABAAAAAAAAAAOd2VpZ2h0ZWRfdm90ZXMAAAAAAAY=',
        'AAAAAQAAAAAAAAAAAAAAClZvdGVSZWNvcmQAAAAAAAQAAAAAAAAACW9wdGlvbl9pZAAAAAAAAAQAAAAAAAAACHZvdGVkX2F0AAAABgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAZ3ZWlnaHQAAAAAAAQ=',
        'AAAAAgAAAAAAAAAAAAAAClZvdGVTdGF0dXMAAAAAAAQAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAJQ29uY2x1ZGVkAAAAAAAAAAAAAAAAAAAJQ2FuY2VsbGVkAAAA',
        'AAAAAgAAAAAAAAAAAAAAC1ZvdGVDb250ZXh0AAAAAAQAAAAAAAAAAAAAABJDYW1wYWlnblZhbGlkYXRpb24AAAAAAAAAAAAAAAAAElJldHJvc3BlY3RpdmVHcmFudAAAAAAAAAAAAAAAAAAHUUZSb3VuZAAAAAAAAAAAAAAAABBIYWNrYXRob25KdWRnaW5n',
        'AAAAAQAAAAAAAAAAAAAADVZvdGluZ1Nlc3Npb24AAAAAAAAMAAAAAAAAAAdjb250ZXh0AAAAB9AAAAALVm90ZUNvbnRleHQAAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAZlbmRfYXQAAAAAAAYAAAAAAAAACW1vZHVsZV9pZAAAAAAAAAYAAAAAAAAABnF1b3J1bQAAAAAD6AAAAAQAAAAAAAAACnNlc3Npb25faWQAAAAAA+4AAAAgAAAAAAAAAAhzdGFydF9hdAAAAAYAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApWb3RlU3RhdHVzAAAAAAAAAAAACXRocmVzaG9sZAAAAAAAA+gAAAAEAAAAAAAAABF0aHJlc2hvbGRfcmVhY2hlZAAAAAAAAAEAAAAAAAAAC3RvdGFsX3ZvdGVzAAAAAAQAAAAAAAAAFHdlaWdodF9ieV9yZXB1dGF0aW9uAAAAAQ==',
        'AAAAAgAAAAAAAAAAAAAAEUdvdmVybmFuY2VEYXRhS2V5AAAAAAAACQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAHVmVyc2lvbgAAAAABAAAAAAAAABBBdXRob3JpemVkTW9kdWxlAAAAAQAAABMAAAABAAAAAAAAAAdTZXNzaW9uAAAAAAEAAAPuAAAAIAAAAAEAAAAAAAAAClZvdGVPcHRpb24AAAAAAAIAAAPuAAAAIAAAAAQAAAABAAAAAAAAAApWb3RlUmVjb3JkAAAAAAACAAAD7gAAACAAAAATAAAAAQAAAAAAAAAKUUZEb25hdGlvbgAAAAAAAwAAA+4AAAAgAAAAEwAAAAQAAAABAAAAAAAAAAtPcHRpb25Db3VudAAAAAABAAAD7gAAACAAAAABAAAAAAAAAA1PcHRpb25TdW1TcXJ0AAAAAAAAAgAAA+4AAAAgAAAABA==',
        'AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAAD0dvdmVybmFuY2VFcnJvcgA=',
        'AAAAAAAAAAAAAAAJY2FzdF92b3RlAAAAAAAAAwAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAApzZXNzaW9uX2lkAAAAAAPuAAAAIAAAAAAAAAAJb3B0aW9uX2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAJaGFzX3ZvdGVkAAAAAAAAAgAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB',
        'AAAAAAAAAAAAAAAKZ2V0X29wdGlvbgAAAAAAAgAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAAAAAAACW9wdGlvbl9pZAAAAAAAAAQAAAABAAAD6QAAB9AAAAAKVm90ZU9wdGlvbgAAAAAH0AAAAA9Hb3Zlcm5hbmNlRXJyb3IA',
        'AAAAAAAAAAAAAAAKZ2V0X3Jlc3VsdAAAAAAAAQAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAABAAAD6QAAA+oAAAfQAAAAClZvdGVPcHRpb24AAAAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAALZ2V0X3Nlc3Npb24AAAAAAQAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAABAAAD6QAAB9AAAAANVm90aW5nU2Vzc2lvbgAAAAAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAOY2FuY2VsX3Nlc3Npb24AAAAAAAEAAAAAAAAACnNlc3Npb25faWQAAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAA9Hb3Zlcm5hbmNlRXJyb3IA',
        'AAAAAAAAAAAAAAAOY3JlYXRlX3Nlc3Npb24AAAAAAAkAAAAAAAAABm1vZHVsZQAAAAAAEwAAAAAAAAAHY29udGV4dAAAAAfQAAAAC1ZvdGVDb250ZXh0AAAAAAAAAAAJbW9kdWxlX2lkAAAAAAAABgAAAAAAAAAMdm90ZV9vcHRpb25zAAAD6gAAABAAAAAAAAAACHN0YXJ0X2F0AAAABgAAAAAAAAAGZW5kX2F0AAAAAAAGAAAAAAAAAAl0aHJlc2hvbGQAAAAAAAPoAAAABAAAAAAAAAAGcXVvcnVtAAAAAAPoAAAABAAAAAAAAAAUd2VpZ2h0X2J5X3JlcHV0YXRpb24AAAABAAAAAQAAA+kAAAPuAAAAIAAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAQY29uY2x1ZGVfc2Vzc2lvbgAAAAEAAAAAAAAACnNlc3Npb25faWQAAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAA9Hb3Zlcm5hbmNlRXJyb3IA',
        'AAAAAAAAAAAAAAARdGhyZXNob2xkX3JlYWNoZWQAAAAAAAABAAAAAAAAAApzZXNzaW9uX2lkAAAAAAPuAAAAIAAAAAEAAAPpAAAAAQAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAScmVjb3JkX3FmX2RvbmF0aW9uAAAAAAAEAAAAAAAAAApzZXNzaW9uX2lkAAAAAAPuAAAAIAAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACW9wdGlvbl9pZAAAAAAAAAQAAAABAAAD6QAAAAIAAAfQAAAAD0dvdmVybmFuY2VFcnJvcgA=',
        'AAAAAAAAAAAAAAAVYWRkX2F1dGhvcml6ZWRfbW9kdWxlAAAAAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA9Hb3Zlcm5hbmNlRXJyb3IA',
        'AAAAAAAAAAAAAAAXY29tcHV0ZV9xZl9kaXN0cmlidXRpb24AAAAAAgAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAD7gAAACAAAAAAAAAADW1hdGNoaW5nX3Bvb2wAAAAAAAALAAAAAQAAA+kAAAPqAAAD7QAAAAIAAAAEAAAACwAAB9AAAAAPR292ZXJuYW5jZUVycm9yAA==',
        'AAAAAAAAAAAAAAAYcmVtb3ZlX2F1dGhvcml6ZWRfbW9kdWxlAAAAAQAAAAAAAAAGbW9kdWxlAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA9Hb3Zlcm5hbmNlRXJyb3IA',
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
    cast_vote: this.txFromJSON<Result<void>>,
    has_voted: this.txFromJSON<boolean>,
    get_option: this.txFromJSON<Result<VoteOption>>,
    get_result: this.txFromJSON<Result<Array<VoteOption>>>,
    get_session: this.txFromJSON<Result<VotingSession>>,
    cancel_session: this.txFromJSON<Result<void>>,
    create_session: this.txFromJSON<Result<Buffer>>,
    conclude_session: this.txFromJSON<Result<void>>,
    threshold_reached: this.txFromJSON<Result<boolean>>,
    record_qf_donation: this.txFromJSON<Result<void>>,
    add_authorized_module: this.txFromJSON<Result<void>>,
    compute_qf_distribution: this.txFromJSON<
      Result<Array<readonly [u32, i128]>>
    >,
    remove_authorized_module: this.txFromJSON<Result<void>>,
  };
}
