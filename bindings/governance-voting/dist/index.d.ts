import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDVU77G53WQ4P24GBUPGJYGCDV3QSF6UWHQIHV7BCMGSUZAEA3IW6PSU";
    };
};
export declare const GovernanceError: {
    500: {
        message: string;
    };
    501: {
        message: string;
    };
    502: {
        message: string;
    };
    503: {
        message: string;
    };
    504: {
        message: string;
    };
    505: {
        message: string;
    };
    506: {
        message: string;
    };
    507: {
        message: string;
    };
    508: {
        message: string;
    };
    509: {
        message: string;
    };
    510: {
        message: string;
    };
    511: {
        message: string;
    };
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
export type VoteStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Active";
    values: void;
} | {
    tag: "Concluded";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
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
export type GovernanceDataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "Version";
    values: void;
} | {
    tag: "AuthorizedModule";
    values: readonly [string];
} | {
    tag: "Session";
    values: readonly [Buffer];
} | {
    tag: "VoteOption";
    values: readonly [Buffer, u32];
} | {
    tag: "VoteRecord";
    values: readonly [Buffer, string];
} | {
    tag: "QFDonation";
    values: readonly [Buffer, string, u32];
} | {
    tag: "OptionCount";
    values: readonly [Buffer];
} | {
    tag: "OptionSumSqrt";
    values: readonly [Buffer, u32];
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
    init: ({ admin }: {
        admin: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a cast_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cast_vote: ({ voter, session_id, option_id }: {
        voter: string;
        session_id: Buffer;
        option_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a has_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    has_voted: ({ session_id, voter }: {
        session_id: Buffer;
        voter: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a get_option transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_option: ({ session_id, option_id }: {
        session_id: Buffer;
        option_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<VoteOption>>>;
    /**
     * Construct and simulate a get_result transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_result: ({ session_id }: {
        session_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<VoteOption>>>>;
    /**
     * Construct and simulate a get_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_session: ({ session_id }: {
        session_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<VotingSession>>>;
    /**
     * Construct and simulate a cancel_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_session: ({ session_id }: {
        session_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_session: ({ module, context, module_id, vote_options, start_at, end_at, threshold, quorum, weight_by_reputation }: {
        module: string;
        context: VoteContext;
        module_id: u64;
        vote_options: Array<string>;
        start_at: u64;
        end_at: u64;
        threshold: Option<u32>;
        quorum: Option<u32>;
        weight_by_reputation: boolean;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a conclude_session transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    conclude_session: ({ session_id }: {
        session_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a threshold_reached transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    threshold_reached: ({ session_id }: {
        session_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>;
    /**
     * Construct and simulate a record_qf_donation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    record_qf_donation: ({ session_id, module, amount, option_id }: {
        session_id: Buffer;
        module: string;
        amount: i128;
        option_id: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a add_authorized_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_authorized_module: ({ module }: {
        module: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a compute_qf_distribution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    compute_qf_distribution: ({ session_id, matching_pool }: {
        session_id: Buffer;
        matching_pool: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<readonly [u32, i128]>>>>;
    /**
     * Construct and simulate a remove_authorized_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_authorized_module: ({ module }: {
        module: string;
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
        upgrade: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cast_vote: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        has_voted: (json: string) => AssembledTransaction<boolean>;
        get_option: (json: string) => AssembledTransaction<Result<VoteOption, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_result: (json: string) => AssembledTransaction<Result<VoteOption[], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_session: (json: string) => AssembledTransaction<Result<VotingSession, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cancel_session: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_session: (json: string) => AssembledTransaction<Result<Buffer<ArrayBufferLike>, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        conclude_session: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        threshold_reached: (json: string) => AssembledTransaction<Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        record_qf_donation: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        add_authorized_module: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        compute_qf_distribution: (json: string) => AssembledTransaction<Result<(readonly [number, bigint])[], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        remove_authorized_module: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
