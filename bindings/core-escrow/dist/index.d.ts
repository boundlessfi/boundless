import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN";
    };
};
export declare const EscrowError: {
    100: {
        message: string;
    };
    101: {
        message: string;
    };
    102: {
        message: string;
    };
    103: {
        message: string;
    };
    104: {
        message: string;
    };
    105: {
        message: string;
    };
    106: {
        message: string;
    };
    107: {
        message: string;
    };
    108: {
        message: string;
    };
    109: {
        message: string;
    };
    110: {
        message: string;
    };
    111: {
        message: string;
    };
    112: {
        message: string;
    };
    113: {
        message: string;
    };
    114: {
        message: string;
    };
    115: {
        message: string;
    };
    116: {
        message: string;
    };
    117: {
        message: string;
    };
    118: {
        message: string;
    };
    119: {
        message: string;
    };
};
export interface FeeConfig {
    bounty_fee_bps: u32;
    crowdfund_fee_bps: u32;
    grant_fee_bps: u32;
    hackathon_fee_bps: u32;
    insurance_cut_bps: u32;
}
export interface FeeRecord {
    fee_amount: i128;
    gross_amount: i128;
    insurance_cut: i128;
    net_to_escrow: i128;
    payer: string;
    pool_id: Buffer;
    sub_type: SubType;
    timestamp: u64;
    treasury_cut: i128;
}
export interface EscrowPool {
    asset: string;
    authorized_caller: string;
    created_at: u64;
    expires_at: u64;
    locked: boolean;
    module: ModuleType;
    owner: string;
    pool_id: Buffer;
    total_deposited: i128;
    total_refunded: i128;
    total_released: i128;
}
export interface ReleaseSlot {
    amount: i128;
    pool_id: Buffer;
    recipient: string;
    released: boolean;
    released_at: Option<u64>;
    slot_index: u32;
}
export type EscrowDataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "Treasury";
    values: void;
} | {
    tag: "FeeConfig";
    values: void;
} | {
    tag: "InsuranceFund";
    values: void;
} | {
    tag: "RoutingPaused";
    values: void;
} | {
    tag: "Version";
    values: void;
} | {
    tag: "EscrowPool";
    values: readonly [Buffer];
} | {
    tag: "ReleaseSlot";
    values: readonly [Buffer, u32];
} | {
    tag: "SlotCount";
    values: readonly [Buffer];
} | {
    tag: "FeeRecord";
    values: readonly [Buffer];
} | {
    tag: "AuthorizedModule";
    values: readonly [string];
};
export interface InsuranceFund {
    balance: i128;
    total_contributions: i128;
    total_paid_out: i128;
}
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
    init: ({ admin, treasury }: {
        admin: string;
        treasury: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    deposit: ({ pool_id, amount, payer }: {
        pool_id: Buffer;
        amount: i128;
        payer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pool: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<EscrowPool>>>;
    /**
     * Construct and simulate a get_slot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_slot: ({ pool_id, index }: {
        pool_id: Buffer;
        index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<ReleaseSlot>>>;
    /**
     * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a is_locked transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    is_locked: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>;
    /**
     * Construct and simulate a lock_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    lock_pool: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a refund_all transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    refund_all: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a create_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_pool: ({ owner, module, module_id, total_amount, asset, expires_at, authorized_caller }: {
        owner: string;
        module: ModuleType;
        module_id: u64;
        total_amount: i128;
        asset: string;
        expires_at: u64;
        authorized_caller: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a get_fee_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_fee_rate: ({ sub_type }: {
        sub_type: SubType;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a get_treasury transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_treasury: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a release_slot transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    release_slot: ({ pool_id, slot_index }: {
        pool_id: Buffer;
        slot_index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a route_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Convenience wrapper: release escrow to recipient with no fee.
     * Calls release_partial internally.
     */
    route_payout: ({ pool_id, recipient, amount }: {
        pool_id: Buffer;
        recipient: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a route_pledge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    route_pledge: ({ backer, pool_id, pledge_amount, asset }: {
        backer: string;
        pool_id: Buffer;
        pledge_amount: i128;
        asset: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a route_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Convenience wrapper: refund escrowed net amount to pool owner.
     * Calls refund_all internally.
     */
    route_refund: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a set_fee_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_fee_rate: ({ sub_type, new_bps }: {
        sub_type: SubType;
        new_bps: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a update_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_admin: ({ new_admin }: {
        new_admin: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a calculate_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    calculate_fee: ({ gross, sub_type }: {
        gross: i128;
        sub_type: SubType;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<readonly [i128, i128]>>>;
    /**
     * Construct and simulate a pause_routing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    pause_routing: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a route_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    route_deposit: ({ payer, pool_id, gross_amount, asset, sub_type }: {
        payer: string;
        pool_id: Buffer;
        gross_amount: i128;
        asset: string;
        sub_type: SubType;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a get_fee_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_fee_config: (options?: MethodOptions) => Promise<AssembledTransaction<Result<FeeConfig>>>;
    /**
     * Construct and simulate a get_fee_record transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_fee_record: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<FeeRecord>>>;
    /**
     * Construct and simulate a get_unreleased transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_unreleased: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a refund_backers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    refund_backers: ({ pool_id, backers }: {
        pool_id: Buffer;
        backers: Array<readonly [string, i128]>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a resume_routing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    resume_routing: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a claim_insurance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    claim_insurance: ({ claimant, amount, asset }: {
        claimant: string;
        amount: i128;
        asset: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a release_partial transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    release_partial: ({ pool_id, recipient, amount }: {
        pool_id: Buffer;
        recipient: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a update_treasury transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_treasury: ({ new_treasury }: {
        new_treasury: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a authorize_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    authorize_module: ({ module_addr }: {
        module_addr: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a refund_remaining transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    refund_remaining: ({ pool_id }: {
        pool_id: Buffer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a set_insurance_cut transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_insurance_cut: ({ new_bps }: {
        new_bps: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a deauthorize_module transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    deauthorize_module: ({ module_addr }: {
        module_addr: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a contribute_insurance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    contribute_insurance: ({ amount }: {
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a define_release_slots transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    define_release_slots: ({ pool_id, slots }: {
        pool_id: Buffer;
        slots: Array<readonly [string, i128]>;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a calculate_pledge_cost transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    calculate_pledge_cost: ({ pledge }: {
        pledge: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a get_insurance_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_insurance_balance: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
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
        deposit: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        upgrade: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_pool: (json: string) => AssembledTransaction<Result<EscrowPool, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_slot: (json: string) => AssembledTransaction<Result<ReleaseSlot, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_admin: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        is_locked: (json: string) => AssembledTransaction<Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        lock_pool: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        refund_all: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_pool: (json: string) => AssembledTransaction<Result<Buffer<ArrayBufferLike>, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_fee_rate: (json: string) => AssembledTransaction<Result<number, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_treasury: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        release_slot: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        route_payout: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        route_pledge: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        route_refund: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        set_fee_rate: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        update_admin: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        calculate_fee: (json: string) => AssembledTransaction<Result<readonly [bigint, bigint], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        pause_routing: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        route_deposit: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_fee_config: (json: string) => AssembledTransaction<Result<FeeConfig, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_fee_record: (json: string) => AssembledTransaction<Result<FeeRecord, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_unreleased: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        refund_backers: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        resume_routing: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        claim_insurance: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        release_partial: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        update_treasury: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        authorize_module: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        refund_remaining: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        set_insurance_cut: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        deauthorize_module: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        contribute_insurance: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        define_release_slots: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        calculate_pledge_cost: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_insurance_balance: (json: string) => AssembledTransaction<bigint>;
    };
}
