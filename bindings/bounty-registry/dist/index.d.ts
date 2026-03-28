import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY";
    };
};
export declare const BountyError: {
    700: {
        message: string;
    };
    701: {
        message: string;
    };
    702: {
        message: string;
    };
    703: {
        message: string;
    };
    704: {
        message: string;
    };
    705: {
        message: string;
    };
    706: {
        message: string;
    };
    707: {
        message: string;
    };
    708: {
        message: string;
    };
    709: {
        message: string;
    };
    710: {
        message: string;
    };
    711: {
        message: string;
    };
    712: {
        message: string;
    };
    713: {
        message: string;
    };
    714: {
        message: string;
    };
    715: {
        message: string;
    };
    716: {
        message: string;
    };
    717: {
        message: string;
    };
    718: {
        message: string;
    };
    719: {
        message: string;
    };
    720: {
        message: string;
    };
    721: {
        message: string;
    };
    722: {
        message: string;
    };
    723: {
        message: string;
    };
    724: {
        message: string;
    };
    725: {
        message: string;
    };
    726: {
        message: string;
    };
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
export type BountyType = {
    tag: "FCFS";
    values: void;
} | {
    tag: "Application";
    values: void;
} | {
    tag: "Contest";
    values: void;
} | {
    tag: "Split";
    values: void;
};
export interface Application {
    applicant: string;
    bounty_id: u64;
    proposal: string;
    status: ApplicationStatus;
    submitted_at: u64;
}
export type BountyStatus = {
    tag: "Open";
    values: void;
} | {
    tag: "InProgress";
    values: void;
} | {
    tag: "InReview";
    values: void;
} | {
    tag: "Completed";
    values: void;
} | {
    tag: "Cancelled";
    values: void;
};
export type BountyDataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "CoreEscrow";
    values: void;
} | {
    tag: "ReputationRegistry";
    values: void;
} | {
    tag: "BountyCount";
    values: void;
} | {
    tag: "Bounty";
    values: readonly [u64];
} | {
    tag: "Application";
    values: readonly [u64, string];
} | {
    tag: "ApplicantCount";
    values: readonly [u64];
} | {
    tag: "Applicant";
    values: readonly [u64, u32];
} | {
    tag: "SplitRecipient";
    values: readonly [u64, u32];
};
export type ApplicationStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Accepted";
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
    init: ({ admin, core_escrow, reputation_registry }: {
        admin: string;
        core_escrow: string;
        reputation_registry: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a apply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    apply: ({ applicant, bounty_id, proposal }: {
        applicant: string;
        bounty_id: u64;
        proposal: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_bounty: ({ bounty_id }: {
        bounty_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Bounty>>>;
    /**
     * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_work: ({ contributor, bounty_id, work_cid }: {
        contributor: string;
        bounty_id: u64;
        work_cid: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_fcfs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_fcfs: ({ creator, bounty_id, points }: {
        creator: string;
        bounty_id: u64;
        points: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a claim_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    claim_bounty: ({ contributor, bounty_id }: {
        contributor: string;
        bounty_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_split transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_split: ({ creator, bounty_id, slot_index, points }: {
        creator: string;
        bounty_id: u64;
        slot_index: u32;
        points: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a cancel_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_bounty: ({ creator, bounty_id }: {
        creator: string;
        bounty_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_bounty: ({ creator, title, metadata_cid, bounty_type, amount, asset, category, deadline }: {
        creator: string;
        title: string;
        metadata_cid: string;
        bounty_type: BountyType;
        amount: i128;
        asset: string;
        category: ActivityCategory;
        deadline: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a define_splits transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    define_splits: ({ creator, bounty_id, slots }: {
        creator: string;
        bounty_id: u64;
        slots: Array<readonly [string, i128]>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a update_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_bounty: ({ creator, bounty_id, title, metadata_cid, deadline }: {
        creator: string;
        bounty_id: u64;
        title: Option<string>;
        metadata_cid: Option<string>;
        deadline: Option<u64>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_application: ({ bounty_id, applicant }: {
        bounty_id: u64;
        applicant: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Application>>>;
    /**
     * Construct and simulate a finalize_contest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    finalize_contest: ({ creator, bounty_id }: {
        creator: string;
        bounty_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_bounty_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_bounty_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a select_applicant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    select_applicant: ({ creator, bounty_id, applicant }: {
        creator: string;
        bounty_id: u64;
        applicant: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_submission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_submission: ({ creator, bounty_id, points }: {
        creator: string;
        bounty_id: u64;
        points: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a auto_release_check transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    auto_release_check: ({ bounty_id }: {
        bounty_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a reject_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reject_application: ({ creator, bounty_id, applicant }: {
        creator: string;
        bounty_id: u64;
        applicant: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a approve_contest_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_contest_winner: ({ creator, bounty_id, winner, payout_amount, points }: {
        creator: string;
        bounty_id: u64;
        winner: string;
        payout_amount: i128;
        points: u32;
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
        apply: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        upgrade: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_bounty: (json: string) => AssembledTransaction<Result<Bounty, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        submit_work: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_fcfs: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        claim_bounty: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_split: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        cancel_bounty: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_bounty: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        define_splits: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        update_bounty: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_application: (json: string) => AssembledTransaction<Result<Application, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        finalize_contest: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_bounty_count: (json: string) => AssembledTransaction<bigint>;
        select_applicant: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_submission: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        auto_release_check: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        reject_application: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        approve_contest_winner: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
