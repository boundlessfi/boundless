import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CAWFSZRB4PM3UPXAF7GTIDWS3OTAVMHN2ZPYZVG4DUIE2BLBUBAER5YL";
    };
};
export declare const GrantError: {
    900: {
        message: string;
    };
    901: {
        message: string;
    };
    902: {
        message: string;
    };
    903: {
        message: string;
    };
    904: {
        message: string;
    };
    905: {
        message: string;
    };
    906: {
        message: string;
    };
    907: {
        message: string;
    };
    908: {
        message: string;
    };
    909: {
        message: string;
    };
    910: {
        message: string;
    };
    911: {
        message: string;
    };
    912: {
        message: string;
    };
    913: {
        message: string;
    };
    914: {
        message: string;
    };
    915: {
        message: string;
    };
    916: {
        message: string;
    };
    917: {
        message: string;
    };
    918: {
        message: string;
    };
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
export type GrantType = {
    tag: "Milestone";
    values: void;
} | {
    tag: "Retrospective";
    values: void;
} | {
    tag: "QF";
    values: void;
};
export interface VoteOption {
    id: u32;
    label: string;
    votes: u32;
    weighted_votes: u64;
}
export type GrantStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Active";
    values: void;
} | {
    tag: "Executing";
    values: void;
} | {
    tag: "Completed";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
export interface QFRoundData {
    matching_pool: i128;
    project_count: u32;
    session_id: Buffer;
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
export type GrantDataKey = {
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
    tag: "GrantCount";
    values: void;
} | {
    tag: "Grant";
    values: readonly [u64];
} | {
    tag: "GrantMilestone";
    values: readonly [u64, u32];
} | {
    tag: "GrantRecipient";
    values: readonly [u64];
} | {
    tag: "QFRound";
    values: readonly [u64];
} | {
    tag: "RetroSession";
    values: readonly [u64];
};
export interface GrantMilestone {
    description: string;
    id: u32;
    pct: u32;
    status: GrantMilestoneStatus;
}
export type GrantMilestoneStatus = {
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
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_grant: ({ grant_id }: {
        grant_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Grant>>>;
    /**
     * Construct and simulate a cancel_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_grant: ({ creator, grant_id }: {
        creator: string;
        grant_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_qf_round: ({ grant_id }: {
        grant_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<QFRoundData>>>;
    /**
     * Construct and simulate a get_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_milestone: ({ grant_id, milestone_index }: {
        grant_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<GrantMilestone>>>;
    /**
     * Construct and simulate a create_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_qf_round: ({ creator, matching_pool, asset, project_names, duration }: {
        creator: string;
        matching_pool: i128;
        asset: string;
        project_names: Array<string>;
        duration: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a donate_to_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    donate_to_project: ({ grant_id, amount, project_index }: {
        grant_id: u64;
        amount: i128;
        project_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a finalize_qf_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    finalize_qf_round: ({ grant_id, project_addresses }: {
        grant_id: u64;
        project_addresses: Array<string>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_retro_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_retro_session: ({ grant_id }: {
        grant_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a create_milestone_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_milestone_grant: ({ creator, recipient, amount, asset, milestone_descs }: {
        creator: string;
        recipient: string;
        amount: i128;
        asset: string;
        milestone_descs: Array<readonly [string, u32]>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a finalize_retrospective transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    finalize_retrospective: ({ grant_id, recipients }: {
        grant_id: u64;
        recipients: Array<string>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a submit_grant_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_grant_milestone: ({ recipient, grant_id, milestone_index }: {
        recipient: string;
        grant_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_grant_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_grant_milestone: ({ grant_id, milestone_index }: {
        grant_id: u64;
        milestone_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_retrospective_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_retrospective_grant: ({ creator, amount, asset, vote_options, voting_duration }: {
        creator: string;
        amount: i128;
        asset: string;
        vote_options: Array<string>;
        voting_duration: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
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
        upgrade: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_grant: (json: string) => AssembledTransaction<Result<Grant, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cancel_grant: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_qf_round: (json: string) => AssembledTransaction<Result<QFRoundData, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_milestone: (json: string) => AssembledTransaction<Result<GrantMilestone, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_qf_round: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        donate_to_project: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        finalize_qf_round: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_retro_session: (json: string) => AssembledTransaction<Result<Buffer<ArrayBufferLike>, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_milestone_grant: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        finalize_retrospective: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_grant_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_grant_milestone: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_retrospective_grant: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
