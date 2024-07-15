import { ContractMetadata, LogEvent, Explorer } from "./generic_types";

export interface CategorizedTransaction {
    dex_details: DexReport[];
    /** * The details for the NFT sale transaction. */
    transfer_details: TransferReport[];
    nft_transfer_details: NftTransferReport[];
    /** * The details for the NFT sale transaction. */
    nft_sale_details: NftSalesReport[];
    /** * The details for the lending protocol transaction. */
    lending_details: LendingReport[];

    perpetual_details: PerpectualReport[];
    margin_details: MarginReport[];
    vault_details: VaultReport[];
    synthetic_details: SyntheticReport[];
    bridging_details: BridgingReport[];
    /** * The details for the lending protocol transaction. */
    staking_details: StakingReport[];
    /** * The log events. */
    log_events?: LogEvent[];
}

export interface TransferReport {
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    token_logo_url?: string;
    /** * Stores the wallet address that initiated the transaction (i.e the wallet paying the gas fee). */
    sender: string;
    /** * Stores the recipient of the transaction - recipients can be other wallets or smart contracts. For example, if you want to Swap tokens on Uniswap, the Uniswap router would typically be the recipient of the transaction. */
    recipient: string;
}

export interface NftTransferReport {
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_ids: string;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    sender: string;
    /** * Stores the recipient of the transaction - recipients can be other wallets or smart contracts. For example, if you want to Swap tokens on Uniswap, the Uniswap router would typically be the recipient of the transaction. */
    recipient: string;
}

export interface DexReport {
    /** * The offset is the position of the log entry within an event log. */
    log_offset?: number;
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    // /** * Stores the aggregator responsible for the event. */
    aggregator_name?: string;
    // /** * Stores the contract address of the aggregator responsible for the event. */
    aggregator_address?: string;
    // /** * DEXs often have multiple version - e.g Uniswap V1, V2 and V3. The `version` field allows you to look at a specific version of the DEX. */
    // version: number;
    // /** * Similarly to the `version` field, `fork_version` gives you the version of the forked DEX. For example, most DEXs are a fork of Uniswap V2; therefore, `fork` = `aave` & `fork_version` = `2` */
    // fork_version: number;
    // /** * Many DEXs are a fork of an already established DEX. The fork field allows you to see which DEX has been forked. */
    // fork: string;
    /** * Stores the event taking place - e.g `swap`, `add_liquidity` and `remove_liquidity`. */
    event: string;
    /** * Stores the address of the pair that the user interacts with. */
    pair_address: string;
    pair_lp_fee_bps: number;
    lp_token_address: string;
    lp_token_ticker: string;
    lp_token_num_decimals: number;
    lp_token_name: string;
    lp_token_value: string;
    exchange_rate_usd: number;
    /** * Stores the address of token 0 in the specific pair. */
    token_0_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_0_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_0_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_0_name: string;
    /** * Stores the address of token 1 in the specific pair. */
    token_1_address?: string;
    /** * Stores the ticker symbol of token 1 in the specific pair. */
    token_1_ticker?: string;
    /** * Stores the number of contract decimals of token 1 in the specific pair. */
    token_1_num_decimals: number;
    /** * Stores the contract name of token 1 in the specific pair. */
    token_1_name: string;
    /** * Stores the amount of token 0 used in the transaction. For example, 1 ETH, 100 USDC, 30 UNI, etc. */
    token_0_amount: string;
    token_0_quote_rate: number;
    token_0_usd_quote: number;
    pretty_token_0_usd_quote: string;
    token_0_logo_url?: string;
    /** * Stores the amount of token 1 used in the transaction. For example, 1 ETH, 100 USDC, 30 UNI, etc. */
    token_1_amount: string;
    token_1_quote_rate: number;
    token_1_usd_quote: number;
    pretty_token_1_usd_quote: string;
    token_1_logo_url?: string;
    /** * Stores the wallet address that initiated the transaction (i.e the wallet paying the gas fee). */
    sender: string;
    /** * Stores the recipient of the transaction - recipients can be other wallets or smart contracts. For example, if you want to Swap tokens on Uniswap, the Uniswap router would typically be the recipient of the transaction. */
    recipient: string;
}

export interface StakingReport {
    /** * The offset is the position of the log entry within an event log. */
    log_offset?: number;
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    staked_asset_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    staked_asset_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    staked_asset_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    staked_asset_name: string;
    /** * Stores the address of token 1 in the specific pair. */
    minted_address?: string;
    /** * Stores the ticker symbol of token 1 in the specific pair. */
    minted_ticker?: string;
    /** * Stores the number of contract decimals of token 1 in the specific pair. */
    minted_num_decimals?: number;
    /** * Stores the contract name of token 1 in the specific pair. */
    minted_name?: string;
    /** * Stores the amount of token 0 used in the transaction. For example, 1 ETH, 100 USDC, 30 UNI, etc. */
    staked_asset_amount: string;
    staked_asset_quote_rate: number;
    staked_asset_usd_quote: number;
    pretty_staked_asset_usd_quote: string;
    minted_amount?: string;
    minted_quote_rate?: number;
    minted_usd_quote?: number;
    pretty_minted_usd_quote?: string;
    minted_logo_url?: string;
    /** * Stores the wallet address that initiated the transaction (i.e the wallet paying the gas fee). */
    depositor: string;
}

export interface PerpectualReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    from: string;
    to: string;
}

export interface BridgingReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    from: string;
    to: string;
    from_chain: string;
    to_chain: string;
}

export interface MarginReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    from: string;
    to: string;
}

export interface VaultReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    vault_address: string;
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    from: string;
    to: string;
}

export interface SyntheticReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    synthetic_asset_address: string;
    /** * Stores the event taking place - e.g `deposit` and `withdraw`. */
    event: string;
    /** * Stores the address of token 0 in the specific pair. */
    token_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    token_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    token_num_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    token_name: string;
    token_amount: string;
    token_quote_rate: number;
    token_usd_quote: number;
    pretty_token_usd_quote: string;
    from: string;
    to: string;
}

export interface NftSalesReport {
    /** * The offset is the position of the log entry within an event log. */
    log_offset: number;
    /** * Stores the topic event hash. All events have a unique topic event hash. */
    topic0: string;
    /** * Stores the contract address of the protocol that facilitated the event. */
    protocol_contract_address: string;
    /** * Stores the name of the protocol that facilitated the event. */
    protocol_name: string;
    /** * The protocol logo URL. */
    protocol_logo_url: string;
    /** * Stores the address of the transaction recipient. */
    to: string;
    /** * Stores the address of the transaction sender. */
    from: string;
    /** * Stores the address selling the NFT. */
    maker: string;
    /** * Stores the address buying the NFT. */
    taker: string;
    /** * Stores the NFTs token ID. All NFTs have a token ID. Within a collection, these token IDs are unique. If the NFT is transferred to another owner, the token id remains the same, as this number is its identifier within a collection. For example, if a collection has 10K NFTs then an NFT in that collection can have a token ID from 1-10K. */
    token_id: string;
    /** * Stores the address of the collection. For example, [Bored Ape Yacht Club](https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d) */
    collection_address: string;
    /** * Stores the name of the collection. */
    collection_name: string;
    /** * Stores the address of the token used to purchase the NFT. */
    token_address: string;
    /** * Stores the name of the token used to purchase the NFT. */
    token_name: string;
    /** * Stores the ticker symbol of the token used to purchase the NFT. */
    ticker_symbol: string;
    /** * Stores the number decimal of the token used to purchase the NFT. */
    num_decimals: number;
    contract_quote_rate: number;
    /** * The token amount used to purchase the NFT. For example, if the user purchased an NFT for 1 ETH. The `nft_token_price` field will hold `1`. */
    nft_token_price: number;
    /** * The USD amount used to purchase the NFT. */
    nft_token_price_usd: number;
    pretty_nft_token_price_usd: string;
    /** * The price of the NFT denominated in the chains native token. Even if a seller sells their NFT for DAI or MANA, this field denominates the price in the native token (e.g. ETH, AVAX, FTM, etc.) */
    nft_token_price_native: number;
    pretty_nft_token_price_native: string;
    /** * Stores the number of NFTs involved in the sale. It's quick routine to see multiple NFTs involved in a single sale. */
    token_count: number;
    num_token_ids_sold_per_sale: number;
    num_token_ids_sold_per_tx: number;
    num_collections_sold_per_sale: number;
    num_collections_sold_per_tx: number;
    trade_type: string;
    trade_group_type: string;
}
export interface LendingReport {
    /** * The offset is the position of the log entry within an event log. */
    protocol?: {
        name: string;
        address?: string;
        logo?: string;
    };
    /** * Stores the event taking place - e.g `borrow`, `deposit`, `liquidation`, 'repay' and 'withdraw'. */
    event: string;
    /** * Stores the name of the LP token issued by the lending protocol. LP tokens can be debt or interest bearing tokens. */
    reserve_name: string;
    /** * Stores the address of token 0 in the specific pair. */
    reserve_address?: string;
    /** * Stores the ticker symbol of token 0 in the specific pair. */
    reserve_ticker?: string;
    /** * Stores the number of contract decimals of token 0 in the specific pair. */
    reserve_decimals: number;
    /** * Stores the contract name of token 0 in the specific pair. */
    reserve_amount: string;
    reserve_quote_rate: number;
    reserve_usd_quote: number;
    pretty_reserve_usd_quote: string;
    borrow_rate_mode?: string;
    /** * Stores the interest rate of the loan. Only relevant to borrow events. */
    borrow_rate?: number;
    on_behalf_of?: string;
    /** * Stores the wallet address liquidating the loan. Only relevant to liquidation events. */
    liquidator?: string;
    /** * Stores the wallet address of the user initiating the event. */
    premium_amount?: number;
    /** * Stores the wallet address of the user initiating the event. */
    premium_usd_quote?: number;
    user?: string;
    /** * Stores the address of token 0 in the specific pair. */
    target_address?: string;
}
export interface SafeDetails {
    /** * The address that signed the safe transaction. */
    owner_address: string;
    /** * The signature of the owner for the safe transaction. */
    signature: string;
    /** * The type of safe signature used. */
    signature_type: string;
}
