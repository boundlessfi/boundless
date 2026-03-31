import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBH5URRJX6A34P5XJ2RWHYGQK4HXICO2OTTYLFZEM55FCI2XAW6QCOKN";
    };
};
export declare const CrowdfundError: {
    800: {
        message: string;
    };
    801: {
        message: string;
    };
    802: {
        message: string;
    };
    803: {
        message: string;
    };
    804: {
        message: string;
    };
    805: {
        message: string;
    };
    806: {
        message: string;
    };
    807: {
        message: string;
    };
    808: {
        message: string;
    };
    809: {
        message: string;
    };
    810: {
        message: string;
    };
    811: {
        message: string;
    };
    812: {
        message: string;
    };
    813: {
        message: string;
    };
    814: {
        message: string;
    };
    815: {
        message: string;
    };
    816: {
        message: string;
    };
    817: {
        message: string;
    };
    818: {
        message: string;
    };
    819: {
        message: string;
    };
    820: {
        message: string;
    };
    821: {
        message: string;
    };
    822: {
        message: string;
    };
    823: {
        message: string;
    };
    824: {
        message: string;
    };
    825: {
        message: string;
    };
    826: {
        message: string;
    };
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
export type VoteContext = {
    tag: "CampaignValidation";
    values: void;
} | {
    tag: "RetrospectiveGrant";
    values: void;
} | {
    tag: "QFRound";
    values: void;
} | {
    tag: "HackathonJudging";
    values: void;
};
export type CampaignStatus = {
    tag: "Draft";
    values: void;
} | {
    tag: "Submitted";
    values: void;
} | {
    tag: "Validated";
    values: void;
} | {
    tag: "Campaigning";
    values: void;
} | {
    tag: "Funded";
    values: void;
} | {
    tag: "Executing";
    values: void;
} | {
    tag: "Completed";
    values: void;
} | {
    tag: "Failed";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
export type CrowdfundDataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "CoreEscrow";
    values: void;
} | {
    tag: "ReputationRegistry";
    values: void;
} | {
    tag: "GovernanceVoting";
    values: void;
} | {
    tag: "CampaignCount";
    values: void;
} | {
    tag: "Campaign";
    values: readonly [u64];
} | {
    tag: "CampaignMilestone";
    values: readonly [u64, u32];
} | {
    tag: "Pledge";
    values: readonly [u64, string];
} | {
    tag: "BackerBatch";
    values: readonly [u64, u32];
};
export type CrowdfundMilestoneStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Submitted";
    values: void;
} | {
    tag: "Approved";
    values: void;
} | {
    tag: "Released";
    values: void;
} | {
    tag: "Rejected";
    values: void;
} | {
    tag: "Disputed";
    values: void;
};
/**
 * Granular sub-type for fee rate lookup and audit trail.
 */
export type SubType = {
    tag: "BountyFCFS";
    values: void;
} | {
    tag: "BountyApplication";
    values: void;
} | {
    tag: "BountyContest";
    values: void;
} | {
    tag: "BountySplit";
    values: void;
} | {
    tag: "CrowdfundPledge";
    values: void;
} | {
    tag: "GrantMilestone";
    values: void;
} | {
    tag: "GrantRetrospective";
    values: void;
} | {
    tag: "GrantQFMatchingPool";
    values: void;
} | {
    tag: "HackathonMain";
    values: void;
} | {
    tag: "HackathonTrack";
    values: void;
};
/**
 * Identifies which platform module owns a resource (escrow pool, fee record, etc.)
 */
export type ModuleType = {
    tag: "Bounty";
    values: void;
} | {
    tag: "Crowdfund";
    values: void;
} | {
    tag: "Grant";
    values: void;
} | {
    tag: "Hackathon";
    values: void;
};
/**
 * Skill/activity categories used across reputation scoring and bounty tagging.
 */
export type ActivityCategory = {
    tag: "Development";
    values: void;
} | {
    tag: "Design";
    values: void;
} | {
    tag: "Marketing";
    values: void;
} | {
    tag: "Security";
    values: void;
} | {
    tag: "Community";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    init: ({ admin, core_escrow, reputation_registry, governance_voting }: {
        admin: string;
        core_escrow: string;
        reputation_registry: string;
        governance_voting: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    pledge: ({ backer, campaign_id, amount }: {
        backer: string;
        campaign_id: u64;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pledge: ({ campaign_id, backer }: {
        campaign_id: u64;
        backer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
    /**
     * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_campaign: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Campaign>>>;
    /**
     * Construct and simulate a get_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_milestone: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Milestone>>>;
    /**
     * Construct and simulate a vote_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    vote_campaign: ({ voter, campaign_id, option_id }: {
        voter: string;
        campaign_id: u64;
        option_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a check_deadline transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    check_deadline: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a cancel_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_campaign: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_campaign: ({ owner, metadata_cid, funding_goal, asset, deadline, milestone_descs, min_pledge, submit }: {
        owner: string;
        metadata_cid: string;
        funding_goal: i128;
        asset: string;
        deadline: u64;
        milestone_descs: Array<readonly [string, u32]>;
        min_pledge: i128;
        submit: boolean;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a reject_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reject_campaign: ({ campaign_id, reason }: {
        campaign_id: u64;
        reason: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a update_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_campaign: ({ campaign_id, metadata_cid, funding_goal, asset, deadline, milestone_descs, min_pledge }: {
        campaign_id: u64;
        metadata_cid: string;
        funding_goal: i128;
        asset: string;
        deadline: u64;
        milestone_descs: Array<readonly [string, u32]>;
        min_pledge: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_campaign: ({ campaign_id, voting_duration, vote_threshold }: {
        campaign_id: u64;
        voting_duration: u64;
        vote_threshold: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a get_vote_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_vote_session: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a reject_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reject_milestone: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a submit_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_milestone: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_milestone: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a dispute_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    dispute_milestone: ({ disputer, campaign_id, milestone_index }: {
        disputer: string;
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a submit_for_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_for_review: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_campaign_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_campaign_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a terminate_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    terminate_campaign: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a check_vote_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    check_vote_threshold: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a process_refund_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    process_refund_batch: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a flag_overdue_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    flag_overdue_milestone: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a request_milestone_revision transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    request_milestone_revision: ({ campaign_id, milestone_index }: {
        campaign_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        init: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        pledge: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        upgrade: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_pledge: (json: string) => AssembledTransaction<bigint>;
        get_campaign: (json: string) => AssembledTransaction<Result<Campaign, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_milestone: (json: string) => AssembledTransaction<Result<Milestone, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        vote_campaign: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        check_deadline: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cancel_campaign: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_campaign: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        reject_campaign: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        update_campaign: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_campaign: (json: string) => AssembledTransaction<Result<Buffer<ArrayBufferLike>, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_vote_session: (json: string) => AssembledTransaction<Result<Buffer<ArrayBufferLike>, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        reject_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        dispute_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_for_review: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_campaign_count: (json: string) => AssembledTransaction<bigint>;
        terminate_campaign: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        check_vote_threshold: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        process_refund_batch: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        flag_overdue_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        request_milestone_revision: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
