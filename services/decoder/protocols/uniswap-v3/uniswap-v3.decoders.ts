import { GoldRushDecoder } from "../../decoder";
import type { EventDetails, EventTokens } from "../../decoder.types";
import { type EventType } from "../../decoder.types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { decodeEventLog, type Abi } from "viem";
import FactoryABI from "./abis/uniswap-v3.factory.abi.json";
import PairABI from "./abis/uniswap-v3.pair.abi.json";
import erc20ABI from "./abis/erc20.abi.json";
import PositionManagerABI from "./abis/uniswap-v3.NonfungiblePositionManager.abi.json";
import { timestampParser } from "../../../../utils/functions";
import {
    Chain,
    CovalentClient,
    prettifyCurrency,
    type Token,
} from "@covalenthq/client-sdk";
import { ethers } from "ethers";
import AGGREGATORS from "../aggregators/aggregators";

const infuraProvider = new ethers.InfuraProvider(
    "mainnet",
    "578f8e9e011c421a91e20f214e86d7de"
);

GoldRushDecoder.on(
    "uniswap-v3:PoolCreated",
    ["eth-mainnet"],
    FactoryABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: FactoryABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "PoolCreated",
        }) as {
            eventName: "PoolCreated";
            args: {
                token0: string;
                token1: string;
                fee: bigint;
                tickSpacing: bigint;
                pool: string;
            };
        };

        const details: EventDetails = [
            {
                heading: "Token 0",
                value: decoded.token0,
                type: "address",
            },
            {
                heading: "Token 1",
                value: decoded.token1,
                type: "address",
            },
            {
                heading: "Fee",
                value:
                    new Intl.NumberFormat().format(Number(decoded.fee) / 1e4) +
                    "%",
                type: "text",
            },
            {
                heading: "Tick Spacing",
                value: decoded.tickSpacing.toString(),
                type: "text",
            },
            {
                heading: "Pool",
                value: decoded.pool,
                type: "address",
            },
        ];

        const date = timestampParser(tx.block_signed_at, "YYYY-MM-DD");

        const { data: Token0 } =
            await covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                decoded.token0,
                {
                    from: date,
                    to: date,
                }
            );

        const { data: Token1 } =
            await covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                decoded.token1,
                {
                    from: date,
                    to: date,
                }
            );

        const tokens: EventTokens = [
            {
                heading: "Token 0 Information",
                value: "0",
                decimals: Token0?.[0]?.contract_decimals,
                ticker_symbol: Token0?.[0]?.contract_ticker_symbol,
                pretty_quote: Token0?.[0]?.prices?.[0]?.pretty_price,
                usd_value: 0,
            },
            {
                heading: "Token 1 Information",
                value: "0",
                decimals: Token1?.[0]?.contract_decimals,
                ticker_symbol: Token1?.[0]?.contract_ticker_symbol,
                pretty_quote: Token1?.[0]?.prices?.[0]?.pretty_price,
                usd_value: 0,
            },
        ];

        return {
            action: DECODED_ACTION.CREATE,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Pool Created",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v3:Burn",
    ["eth-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        console.log(tx.tx_hash);
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PairABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Burn",
        }) as {
            eventName: "Burn";
            args: {
                owner: string;
                tickLower: bigint;
                tickUpper: bigint;
                amount: bigint;
                amount0: bigint;
                amount1: bigint;
            };
        };

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider), // Use fallback provider for one of the requests
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Owner",
                value: decoded.owner,
                type: "address",
            },
            {
                heading: "Tick Lower",
                value: decoded.tickLower.toString(),
                type: "text",
            },
            {
                heading: "Tick Upper",
                value: decoded.tickUpper.toString(),
                type: "text",
            },
            {
                heading: "Amount",
                value: decoded.amount.toString(),
                type: "text",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Pair",
                value: exchange_contract,
                type: "address",
            },
        ];

        const response = {
            action: DECODED_ACTION.BURN,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Burn",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                },
            ],
        };

        return response;
    }
);

GoldRushDecoder.on(
    "uniswap-v3:Mint",
    ["eth-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PairABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Mint",
        }) as {
            eventName: "Mint";
            args: {
                sender: string;
                owner: string;
                tickLower: bigint;
                tickUpper: bigint;
                amount: bigint;
                amount0: bigint;
                amount1: bigint;
            };
        };

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider),
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Sender",
                value: decoded.sender,
                type: "address",
            },
            {
                heading: "Owner",
                value: decoded.owner,
                type: "address",
            },
            {
                heading: "Tick Lower",
                value: decoded.tickLower.toString(),
                type: "text",
            },
            {
                heading: "Tick Upper",
                value: decoded.tickUpper.toString(),
                type: "text",
            },
            {
                heading: "Amount",
                value: decoded.amount.toString(),
                type: "text",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Pair",
                value: exchange_contract,
                type: "address",
            },
        ];

        const response = {
            action: DECODED_ACTION.MINT,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Mint",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                },
            ],
        };

        return response;
    }
);

GoldRushDecoder.on(
    "uniswap-v3:Swap",
    ["eth-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;
        const { args: decoded } = decodeEventLog({
            abi: PairABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Swap",
        }) as {
            eventName: "Swap";
            args: {
                sender: string;
                recipient: string;
                amount0: bigint;
                amount1: bigint;
                sqrtPriceX96: bigint;
                liquidity: bigint;
                tick: bigint;
            };
        };

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);

        const token0Contract = new ethers.Contract(
            token0Address,
            erc20ABI,
            infuraProvider
        );
        const token1Contract = new ethers.Contract(
            token1Address,
            erc20ABI,
            infuraProvider
        );

        const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] =
            await Promise.all([
                token0Contract.decimals(),
                token1Contract.decimals(),
                token0Contract.symbol(),
                token1Contract.symbol(),
            ]);

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [token0PriceData, token1PriceData] = await Promise.all([
            covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                token0Address,
                { from: date, to: date }
            ),
            covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                token1Address,
                { from: date, to: date }
            ),
        ]);

        const token0Price = token0PriceData.data[0]?.prices[0]?.price || 0;
        const token1Price = token1PriceData.data[0]?.prices[0]?.price || 0;

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, Number(token0Decimals)); // Assuming 18 decimals
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, Number(token1Decimals)); // Assuming 18 decimals

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const aggregator = AGGREGATORS.find(
            (agg: {
                protocol_name: string;
                chain_name: Chain;
                address: string;
            }) =>
                agg.address === decoded.sender ||
                agg.address === decoded.recipient
        );

        let details: EventDetails = [
            {
                heading: "Sender",
                value: decoded.sender,
                type: "address",
            },
            {
                heading: "Recipient",
                value: decoded.recipient,
                type: "address",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "sqrtPriceX96",
                value: decoded.sqrtPriceX96.toString(),
                type: "text",
            },
            {
                heading: "Liquidity",
                value: decoded.liquidity.toString(),
                type: "text",
            },
            {
                heading: "Tick",
                value: decoded.tick.toString(),
                type: "text",
            },
            {
                heading: "Pair",
                value: exchange_contract,
                type: "address",
            },
        ];

        if (aggregator) {
            details.push({
                heading: "Aggregator",
                value: aggregator.protocol_name,
                type: "text",
            });
            details.push({
                heading: "Aggregator Address",
                value: aggregator.address,
                type: "address",
            });
        }

        const response = {
            action: DECODED_ACTION.SWAPPED,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Swap",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    ticker_symbol: token0Symbol, // Replace with actual symbol if available
                    value: decoded.amount0.toString(),
                    decimals: 18, // Replace with actual decimals if known
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token In",
                    quote_rate: token0Price,
                },
                {
                    ticker_symbol: token1Symbol, // Replace with actual symbol if available
                    value: decoded.amount1.toString(),
                    decimals: 18, // Replace with actual decimals if known
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token Out",
                    quote_rate: token1Price,
                },
            ],
        };

        return response;
    }
);

GoldRushDecoder.on(
    "uniswap-v3:Flash",
    ["eth-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PairABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Flash",
        }) as {
            eventName: "Flash";
            args: {
                sender: string;
                recipient: string;
                amount0: bigint;
                amount1: bigint;
                paid0: bigint;
                paid1: bigint;
            };
        };

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider), // Use fallback provider for one of the requests
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const adjustedPaidValue0 =
            Number(decoded.paid0) / Math.pow(10, token0Decimals);
        const adjustedPaidValue1 =
            Number(decoded.paid1) / Math.pow(10, token1Decimals);

        const token0UsdPaidValue = adjustedPaidValue0 * token0Price;
        const token1UsdPaidValue = adjustedPaidValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Sender",
                value: decoded.sender,
                type: "address",
            },
            {
                heading: "Recipient",
                value: decoded.recipient,
                type: "address",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Paid 0",
                value: decoded.paid0.toString(),
                type: "text",
            },
            {
                heading: "Paid 1",
                value: decoded.paid1.toString(),
                type: "text",
            },
        ];

        return {
            action: DECODED_ACTION.FLASHLOAN,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Flash Loan",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                    loan_paid_usd_value: token0UsdPaidValue,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                    loan_paid_usd_value: token1UsdPaidValue,
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v3:DecreaseLiquidity",
    ["eth-mainnet"],
    PositionManagerABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PositionManagerABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "DecreaseLiquidity",
        }) as {
            eventName: "DecreaseLiquidity";
            args: {
                tokenId: bigint;
                liquidity: bigint;
                amount0: bigint;
                amount1: bigint;
            };
        };

        const positionManagerContract = new ethers.Contract(
            log_event.sender_address,
            PositionManagerABI,
            infuraProvider
        );

        // Assuming the Position Manager contract has a method to get position details
        const position = await positionManagerContract.positions(
            decoded.tokenId
        );

        const [token0Address, token1Address] = [
            position.token0,
            position.token1,
        ];

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider), // Use fallback provider for one of the requests
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Token ID",
                value: decoded.tokenId.toString(),
                type: "text",
            },
            {
                heading: "Liquidity",
                value: decoded.liquidity.toString(),
                type: "text",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Lp Token Address",
                value: exchange_contract,
                type: "address",
            },
        ];

        return {
            action: DECODED_ACTION.REMOVE_LIQUIDITY,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Decrease Liquidity",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v3:IncreaseLiquidity",
    ["eth-mainnet"],
    PositionManagerABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PositionManagerABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "IncreaseLiquidity",
        }) as {
            eventName: "IncreaseLiquidity";
            args: {
                tokenId: bigint;
                liquidity: bigint;
                amount0: bigint;
                amount1: bigint;
            };
        };

        const positionManagerContract = new ethers.Contract(
            log_event.sender_address,
            PositionManagerABI,
            infuraProvider
        );

        // Assuming the Position Manager contract has a method to get position details
        const position = await positionManagerContract.positions(
            decoded.tokenId
        );

        const [token0Address, token1Address] = [
            position.token0,
            position.token1,
        ];

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider), // Use infuraProvider for both requests
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Token ID",
                value: decoded.tokenId.toString(),
                type: "text",
            },
            {
                heading: "Liquidity",
                value: decoded.liquidity.toString(),
                type: "text",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Lp Token Address",
                value: exchange_contract,
                type: "address",
            },
        ];

        return {
            action: DECODED_ACTION.ADD_LIQUIDITY,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Increase Liquidity",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v3:Collect",
    ["eth-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            sender_address: exchange_contract,
            raw_log_data,
            raw_log_topics,
        } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PairABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Collect",
        }) as {
            eventName: "Collect";
            args: {
                owner: string;
                recipient: string;
                tickLower: bigint;
                tickUpper: bigint;
                amount0: bigint;
                amount1: bigint;
            };
        };

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);

        const date = new Date(log_event.block_signed_at)
            .toISOString()
            .split("T")[0];

        const [
            { decimals: token0Decimals, symbol: token0Symbol },
            { decimals: token1Decimals, symbol: token1Symbol },
            token0Price,
            token1Price,
        ] = await Promise.all([
            getTokenDetails(token0Address, infuraProvider),
            getTokenDetails(token1Address, infuraProvider), // Use fallback provider for one of the requests
            getTokenPrice(covalent_client, chain_name, token0Address, date),
            getTokenPrice(covalent_client, chain_name, token1Address, date),
        ]);

        const adjustedValue0 =
            Number(decoded.amount0) / Math.pow(10, token0Decimals);
        const adjustedValue1 =
            Number(decoded.amount1) / Math.pow(10, token1Decimals);

        const token0UsdValue = adjustedValue0 * token0Price;
        const token1UsdValue = adjustedValue1 * token1Price;

        const details: EventDetails = [
            {
                heading: "Owner",
                value: decoded.owner,
                type: "address",
            },
            {
                heading: "Recipient",
                value: decoded.recipient,
                type: "address",
            },
            {
                heading: "Tick Lower",
                value: decoded.tickLower.toString(),
                type: "text",
            },
            {
                heading: "Tick Upper",
                value: decoded.tickUpper.toString(),
                type: "text",
            },
            {
                heading: "Amount 0",
                value: decoded.amount0.toString(),
                type: "text",
            },
            {
                heading: "Amount 1",
                value: decoded.amount1.toString(),
                type: "text",
            },
            {
                heading: "Lp Token Address",
                value: decoded.owner,
                type: "address",
            },
            {
                heading: "Pair",
                value: exchange_contract,
                type: "address",
            },
        ];

        const response = {
            action: DECODED_ACTION.COLLECT,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Collect",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: "Uniswap V3",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens: [
                {
                    address: token0Address,
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0",
                    quote_rate: token0Price,
                },
                {
                    address: token1Address,
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1",
                    quote_rate: token1Price,
                },
            ],
        };

        return response;
    }
);

async function getTokenDetails(
    tokenAddress: string,
    provider: ethers.Provider
) {
    try {
        const tokenContract = new ethers.Contract(
            tokenAddress,
            erc20ABI,
            provider
        );
        const [decimals, symbol] = await Promise.all([
            tokenContract.decimals(),
            tokenContract.symbol(),
        ]);
        return { decimals: Number(decimals), symbol };
    } catch (error) {
        console.error(
            `Error fetching token details for ${tokenAddress}:`,
            error
        );
        throw error;
    }
}

async function getTokenPrice(
    covalent_client: CovalentClient,
    chain_name: Chain,
    tokenAddress: string,
    date: string
) {
    try {
        const priceData = await covalent_client.PricingService.getTokenPrices(
            chain_name,
            "USD",
            tokenAddress,
            { from: date, to: date }
        );
        return priceData?.data[0]?.prices[0]?.price || 0;
    } catch (error) {
        console.error(
            `Error fetching token price for ${tokenAddress} on ${date}:`,
            error
        );
        throw error;
    }
}
