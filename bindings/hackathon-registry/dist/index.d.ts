import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDLV7OEETJ5WYP2VTKJHPE5AWBQA4JJKNI4XRLIFPRRSKBDKQO67ZPMG";
    };
};
export declare const HackathonError: {
    1000: {
        message: string;
    };
    1001: {
        message: string;
    };
    1002: {
        message: string;
    };
    1003: {
        message: string;
    };
    1004: {
        message: string;
    };
    1005: {
        message: string;
    };
    1006: {
        message: string;
    };
    1007: {
        message: string;
    };
    1008: {
        message: string;
    };
    1009: {
        message: string;
    };
    1010: {
        message: string;
    };
    1011: {
        message: string;
    };
    1012: {
        message: string;
    };
    1013: {
        message: string;
    };
    1014: {
        message: string;
    };
    1015: {
        message: string;
    };
    1016: {
        message: string;
    };
    1017: {
        message: string;
    };
    1018: {
        message: string;
    };
    1019: {
        message: string;
    };
    1020: {
        message: string;
    };
    1022: {
        message: string;
    };
    1023: {
        message: string;
    };
    1024: {
        message: string;
    };
    1025: {
        message: string;
    };
    1026: {
        message: string;
    };
    1027: {
        message: string;
    };
    1028: {
        message: string;
    };
    1029: {
        message: string;
    };
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
export type HackathonStatus = {
    tag: "Registration";
    values: void;
} | {
    tag: "Submission";
    values: void;
} | {
    tag: "Judging";
    values: void;
} | {
    tag: "Completed";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
export type HackathonDataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "CoreEscrow";
    values: void;
} | {
    tag: "ReputationRegistry";
    values: void;
} | {
    tag: "HackathonCount";
    values: void;
} | {
    tag: "Hackathon";
    values: readonly [u64];
} | {
    tag: "Judge";
    values: readonly [u64, string];
} | {
    tag: "JudgeIndex";
    values: readonly [u64, u32];
} | {
    tag: "Submission";
    values: readonly [u64, string];
} | {
    tag: "SubmissionIndex";
    values: readonly [u64, u32];
} | {
    tag: "JudgeScore";
    values: readonly [u64, string, string];
} | {
    tag: "PrizeTier";
    values: readonly [u64, u32];
} | {
    tag: "HackathonTrack";
    values: readonly [u64, u32];
} | {
    tag: "HackathonTrackCount";
    values: readonly [u64];
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
    init: ({ admin, core_escrow, reputation_registry }: {
        admin: string;
        core_escrow: string;
        reputation_registry: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a add_judge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_judge: ({ hackathon_id, judge }: {
        hackathon_id: u64;
        judge: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a open_judging transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    open_judging: ({ hackathon_id }: {
        hackathon_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a remove_judge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_judge: ({ hackathon_id, judge }: {
        hackathon_id: u64;
        judge: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_hackathon: ({ id }: {
        id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Hackathon>>>;
    /**
     * Construct and simulate a register_team transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    register_team: ({ hackathon_id, team_lead }: {
        hackathon_id: u64;
        team_lead: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_submission: ({ hackathon_id, team_lead }: {
        hackathon_id: u64;
        team_lead: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Submission>>>;
    /**
     * Construct and simulate a submit_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_project: ({ hackathon_id, team_lead, metadata_cid }: {
        hackathon_id: u64;
        team_lead: string;
        metadata_cid: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a cancel_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_hackathon: ({ hackathon_id }: {
        hackathon_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_hackathon: ({ creator, title, metadata_cid, prize_pool, asset, registration_deadline, submission_deadline, judging_deadline, max_participants, prize_tiers }: {
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
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a score_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    score_submission: ({ hackathon_id, judge, team_lead, score }: {
        hackathon_id: u64;
        judge: string;
        team_lead: string;
        score: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a finalize_hackathon transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    finalize_hackathon: ({ hackathon_id }: {
        hackathon_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a add_sponsored_track transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_sponsored_track: ({ hackathon_id, sponsor, track_name, prize_amount, asset }: {
        hackathon_id: u64;
        sponsor: string;
        track_name: string;
        prize_amount: i128;
        asset: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a disqualify_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    disqualify_submission: ({ hackathon_id, team_lead }: {
        hackathon_id: u64;
        team_lead: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a distribute_track_prizes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    distribute_track_prizes: ({ hackathon_id, track_id, winners }: {
        hackathon_id: u64;
        track_id: u32;
        winners: Array<readonly [string, i128]>;
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
        add_judge: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        open_judging: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        remove_judge: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_hackathon: (json: string) => AssembledTransaction<Result<Hackathon, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        register_team: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_submission: (json: string) => AssembledTransaction<Result<Submission, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_project: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cancel_hackathon: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_hackathon: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        score_submission: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        finalize_hackathon: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        add_sponsored_track: (json: string) => AssembledTransaction<Result<number, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        disqualify_submission: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        distribute_track_prizes: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
