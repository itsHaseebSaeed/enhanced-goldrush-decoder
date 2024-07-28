import { Chain, prettifyCurrency, type Token } from "@covalenthq/client-sdk";
import { type Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventDetails, type EventType } from "../../decoder.types";
import PairABI from "./abis/uniswap-v2.pair.abi.json";
import FactoryABI from "./abis/uniswap-v2.factory.abi.json";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import AGGREGATORS from "../aggregators/aggregators";
import { timestampParser } from "../../../../utils/functions";
import erc20ABI from "./abis/erc20.abi.json";

import { ethers } from "ethers";
const infuraProvider = new ethers.InfuraProvider(
    "mainnet",
    "578f8e9e011c421a91e20f214e86d7de"
);

GoldRushDecoder.on(
    "uniswap-v2:Swap",
    ["eth-mainnet", "defi-kingdoms-mainnet"],
    PairABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const {
            block_signed_at,
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
                amount0In: bigint;
                amount1In: bigint;
                amount0Out: bigint;
                amount1Out: bigint;
                to: string;
            };
        };

        let inputTokenAddress: string | null = null,
            inputTokenDecimals: number | null = null,
            inputTokenSymbol: string | null = null,
            outputTokenAddress: string | null = null,
            outputTokenDecimals: number | null = null,
            outputTokenSymbol: string | null = null,
            inputValue: bigint = BigInt(0),
            outputValue: bigint = BigInt(0);

        const pairContract = new ethers.Contract(
            exchange_contract,
            PairABI,
            infuraProvider
        );

        const [token0Address, token1Address] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
        ]);
        const token_0 = new ethers.Contract(
            token0Address,
            erc20ABI,
            infuraProvider
        );
        const token_1 = new ethers.Contract(
            token1Address,
            erc20ABI,
            infuraProvider
        );
        const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] =
            await Promise.all([
                token_0.decimals(),
                token_1.decimals(),
                token_0.symbol(),
                token_1.symbol(),
            ]);

        if (decoded.amount0In > 0) {
            [
                inputTokenAddress,
                inputTokenDecimals,
                inputTokenSymbol,
                outputTokenAddress,
                outputTokenDecimals,
                outputTokenSymbol,
                inputValue,
                outputValue,
            ] = [
                token0Address,
                token0Decimals,
                token0Symbol,
                token1Address,
                token1Decimals,
                token1Symbol,
                decoded.amount0In,
                decoded.amount1Out,
            ];
        } else {
            [
                inputTokenAddress,
                inputTokenDecimals,
                inputTokenSymbol,
                outputTokenAddress,
                outputTokenDecimals,
                outputTokenSymbol,
                inputValue,
                outputValue,
            ] = [
                token1Address,
                token1Decimals,
                token1Symbol,
                token0Address,
                token0Decimals,
                token0Symbol,
                decoded.amount1In,
                decoded.amount0Out,
            ];
        }

        const date = timestampParser(block_signed_at, "YYYY-MM-DD");

        // Fetch input token price
        const { data: input_price_data } =
            await covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                inputTokenAddress ?? "",
                {
                    from: date,
                    to: date,
                }
            );
        const inputTokenPrice = input_price_data?.[0]?.prices?.[0]?.price ?? 0;

        // Calculate input token USD value
        const adjustedInputValue =
            Number(inputValue) / Math.pow(10, Number(inputTokenDecimals));
        const inputTokenUsdValue = adjustedInputValue * inputTokenPrice;

        // Fetch output token price
        const { data: output_price_data } =
            await covalent_client.PricingService.getTokenPrices(
                chain_name,
                "USD",
                outputTokenAddress ?? "",
                {
                    from: date,
                    to: date,
                }
            );
        const outputTokenPrice =
            output_price_data?.[0]?.prices?.[0]?.price ?? 0;

        // Calculate output token USD value
        const adjustedOutputValue =
            Number(outputValue) / Math.pow(10, Number(outputTokenDecimals));
        const outputTokenUsdValue = adjustedOutputValue * outputTokenPrice;

        const details: EventDetails = [
            {
                heading: "Sender",
                type: "address",
                value: decoded.sender,
            },
            {
                heading: "To",
                type: "address",
                value: decoded.to,
            },
            {
                heading: "Pair",
                type: "address",
                value: exchange_contract,
            },
        ];

        const aggregator = AGGREGATORS.find(
            (agg: {
                protocol_name: string;
                chain_name: Chain;
                address: string;
            }) => agg.address === decoded.sender || agg.address === decoded.to
        );

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

        // Convert BigInt to string for serialization
        const tokens = [
            {
                ticker_symbol: inputTokenSymbol ?? null,
                value: inputValue.toString(),
                decimals: Number(inputTokenDecimals ?? 18),
                address: inputTokenAddress ?? "",
                pretty_quote: prettifyCurrency(inputTokenUsdValue),
                usd_value: inputTokenUsdValue,
                heading: "Token In",
                quote_rate: inputTokenPrice,
            },
            {
                ticker_symbol: outputTokenSymbol ?? null,
                value: outputValue.toString(),
                address: outputTokenAddress ?? "",
                decimals: Number(outputTokenDecimals ?? 18),
                pretty_quote: prettifyCurrency(outputTokenUsdValue),
                usd_value: outputTokenUsdValue,
                heading: "Token Out",
                quote_rate: outputTokenPrice,
            },
        ];

        return {
            action: DECODED_ACTION.SWAPPED,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Swap",
            protocol: {
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v2:Mint",
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

        const token0UsdValue = Number(adjustedValue0 * token0Price);
        const token1UsdValue = Number(adjustedValue1 * token1Price);

        return {
            action: DECODED_ACTION.MINT,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Mint",
            protocol: {
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
                {
                    heading: "Sender",
                    type: "address",
                    value: decoded.sender,
                },
                {
                    heading: "Pair",
                    type: "address",
                    value: exchange_contract,
                },
            ],
            tokens: [
                {
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    address: token0Address ?? "",
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0 Deposited",
                },
                {
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    address: token1Address ?? "",
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1 Deposited",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v2:Burn",
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
            data: raw_log_data as "0x${string}",
            eventName: "Burn",
        }) as {
            eventName: "Burn";
            args: {
                sender: string;
                amount0: bigint;
                amount1: bigint;
                to: string;
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

        const token0UsdValue = Number(adjustedValue0 * token0Price);
        const token1UsdValue = Number(adjustedValue1 * token1Price);

        return {
            action: DECODED_ACTION.BURN,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Burn",
            protocol: {
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
                {
                    heading: "Sender",
                    value: decoded.sender,
                    type: "address",
                },
                {
                    heading: "To",
                    value: decoded.to,
                    type: "address",
                },
                {
                    heading: "Pair",
                    type: "address",
                    value: exchange_contract,
                },
            ],
            tokens: [
                {
                    ticker_symbol: token0Symbol,
                    value: decoded.amount0.toString(),
                    address: token0Address ?? "",
                    decimals: Number(token0Decimals),
                    pretty_quote: prettifyCurrency(token0UsdValue),
                    usd_value: token0UsdValue,
                    heading: "Token 0 Redeemed",
                },
                {
                    ticker_symbol: token1Symbol,
                    value: decoded.amount1.toString(),
                    address: token1Address ?? "",
                    decimals: Number(token1Decimals),
                    pretty_quote: prettifyCurrency(token1UsdValue),
                    usd_value: token1UsdValue,
                    heading: "Token 1 Redeemed",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v2:Sync",
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
            data: raw_log_data as "0x${string}",
            eventName: "Sync",
        }) as {
            eventName: "Sync";
            args: {
                reserve0: bigint;
                reserve1: bigint;
            };
        };

        let inputToken: Token | null = null,
            outputToken: Token | null = null,
            inputValue: bigint = BigInt(0),
            outputValue: bigint = BigInt(0);

        const { data } = await covalent_client.XykService.getPoolByAddress(
            chain_name,
            "uniswap_v2",
            exchange_contract
        );
        const tokens = data?.items?.[0];
        if (tokens) {
            const { token_0, token_1 } = tokens;
            [inputToken, outputToken, inputValue, outputValue] = [
                token_0,
                token_1,
                decoded.reserve0,
                decoded.reserve1,
            ];
        }

        const inputTokenquoteRate = inputToken?.quote_rate ?? 0;
        const adjustedVInputalue =
            Number(inputValue) /
            Math.pow(10, inputToken?.contract_decimals ?? 18);
        const inputTokenPrice = inputTokenquoteRate;
        let inputTokenUsdValue = adjustedVInputalue * inputTokenPrice;

        const outputTokenquoteRate = outputToken?.quote_rate ?? 0;
        const adjustedOutputValue =
            Number(outputValue) /
            Math.pow(10, outputToken?.contract_decimals ?? 18);
        const outputTokenPrice = outputTokenquoteRate;
        let outputTokenUsdValue = adjustedOutputValue * outputTokenPrice;

        return {
            action: DECODED_ACTION.UPDATE,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Sync",
            protocol: {
                // logo: log_event.sender_logo_url as string,
                name: log_event.sender_name as string,
            },
            details: [],
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            tokens: [
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_0?.contract_ticker_symbol ??
                        null,
                    value: decoded.reserve0.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_0?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(inputTokenUsdValue),
                    usd_value: inputTokenUsdValue,
                    heading: "Reserve 0",
                },
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_1?.contract_ticker_symbol ??
                        null,
                    value: decoded.reserve1.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_1?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(outputTokenUsdValue),
                    usd_value: outputTokenUsdValue,
                    heading: "Reserve 1",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "uniswap-v2:PairCreated",
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
            eventName: "PairCreated",
            strict: false,
        }) as {
            eventName: "PairCreated";
            args: {
                token0: string;
                token1: string;
                pair: string;
                allPairsLength: bigint;
            };
        };

        const { data } = await covalent_client.XykService.getPoolByAddress(
            chain_name,
            "uniswap_v2",
            decoded.pair
        );

        return {
            action: DECODED_ACTION.CREATE,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Pair Created",
            protocol: {
                // logo: log_event.sender_logo_url as string,
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
                {
                    heading: "Token 0 Name",
                    value: data?.items?.[0]?.token_0?.contract_name || "",
                    type: "text",
                },
                {
                    heading: "Token 0 Ticker Symbol",
                    value:
                        data?.items?.[0]?.token_0?.contract_ticker_symbol || "",
                    type: "text",
                },
                {
                    heading: "Token 0 Decimals",
                    value: (
                        data?.items?.[0]?.token_0?.contract_decimals ?? 18
                    ).toString(),
                    type: "text",
                },
                {
                    heading: "Token 0 Address",
                    value: data?.items?.[0]?.token_0?.contract_address || "",
                    type: "address",
                },
                {
                    heading: "Token 1 Name",
                    value: data?.items?.[0]?.token_1?.contract_name || "",
                    type: "text",
                },
                {
                    heading: "Token 1 Ticker Symbol",
                    value:
                        data?.items?.[0]?.token_1?.contract_ticker_symbol || "",
                    type: "text",
                },
                {
                    heading: "Token 1 Decimals",
                    value: (
                        data?.items?.[0]?.token_1?.contract_decimals ?? 18
                    ).toString(),
                    type: "text",
                },
                {
                    heading: "Token 1 Address",
                    value: data?.items?.[0]?.token_1?.contract_address || "",
                    type: "address",
                },
                {
                    heading: "Pair Address",
                    value: decoded.pair,
                    type: "address",
                },
            ],
        };
    }
);
