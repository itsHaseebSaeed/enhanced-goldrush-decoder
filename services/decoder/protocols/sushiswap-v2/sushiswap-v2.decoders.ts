import { prettifyCurrency, type Token } from "@covalenthq/client-sdk";
import { type Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { type EventType } from "../../decoder.types";
import PairABI from "./abis/sushiswap-v2.pair.abi.json";
import FactoryABI from "./abis/sushiswap-v2.factory.abi.json";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";

GoldRushDecoder.on(
    "sushiswap-v2:Swap",
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
                amount0In: bigint;
                amount1In: bigint;
                amount0Out: bigint;
                amount1Out: bigint;
                to: string;
            };
        };

        let inputToken: Token | null = null,
            outputToken: Token | null = null,
            inputValue: bigint = BigInt(0),
            outputValue: bigint = BigInt(0);

        const { data } = await covalent_client.XykService.getPoolByAddress(
            chain_name,
            "sushiswap_v2",
            exchange_contract
        );
        const tokens = data?.items?.[0];
        if (tokens) {
            const { token_0, token_1 } = tokens;
            if (decoded.amount0In) {
                [inputToken, outputToken, inputValue, outputValue] = [
                    token_0,
                    token_1,
                    decoded.amount0In,
                    decoded.amount1Out,
                ];
            } else {
                [inputToken, outputToken, inputValue, outputValue] = [
                    token_1,
                    token_0,
                    decoded.amount1In,
                    decoded.amount0Out,
                ];
            }
        }

        const inputTokenquoteRate = inputToken?.quote_rate ?? 0;
        const adjustedVInputalue = Number(inputValue) / Math.pow(10, inputToken?.contract_decimals ?? 18);
        const inputTokenPrice = inputTokenquoteRate;
        let inputTokenUsdValue = adjustedVInputalue * inputTokenPrice;

        const outputTokenquoteRate = outputToken?.quote_rate ?? 0;
        const adjustedOutputValue = Number(outputValue) / Math.pow(10, outputToken?.contract_decimals ?? 18);
        const outputTokenPrice = outputTokenquoteRate;
        let outputTokenUsdValue = adjustedOutputValue * outputTokenPrice;


        return {
            action: DECODED_ACTION.SWAPPED,
            category: DECODED_EVENT_CATEGORY.DEX,
            name: "Swap",
            protocol: {
                // logo: log_event.sender_logo_url as string,
                name: "Sushiswap",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
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
                    value: exchange_contract
                }
            ],
            tokens: [
                {
                    ticker_symbol: inputToken?.contract_ticker_symbol ?? null,
                    value: inputValue.toString(),
                    decimals: (inputToken?.contract_decimals ?? 18),
                    pretty_quote: prettifyCurrency(inputTokenUsdValue),
                    usd_value:  inputTokenUsdValue,
                    heading: "Token In",
                    quote_rate: inputTokenquoteRate
                },
                {
                    ticker_symbol: outputToken?.contract_ticker_symbol ?? null,
                    value: outputValue.toString(),
                    decimals: +(outputToken?.contract_decimals ?? 18),
                    pretty_quote: prettifyCurrency(
                        outputTokenUsdValue
                    ),
                    usd_value:  outputTokenUsdValue ,
                    heading: "Token Out",
                    quote_rate: outputTokenquoteRate
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "sushiswap-v2:Mint",
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

        let inputToken: Token | null = null,
        outputToken: Token | null = null,
        inputValue: bigint = BigInt(0),
            outputValue: bigint = BigInt(0);
    
    

    const { data } = await covalent_client.XykService.getPoolByAddress(
        chain_name,
        "sushiswap_v2",
        exchange_contract
    );
        

    const tokens = data?.items?.[0];
    if (tokens) {
        const { token_0, token_1 } = tokens;
            [inputToken, outputToken, inputValue, outputValue] = [
                token_0,
                token_1,
                decoded.amount0,
                decoded.amount1,
            ];
    }

    const inputTokenquoteRate = inputToken?.quote_rate ?? 0;
    const adjustedVInputalue = Number(inputValue) / Math.pow(10, inputToken?.contract_decimals ?? 18);
    const inputTokenPrice = inputTokenquoteRate;
    let token0UsdValue = adjustedVInputalue * inputTokenPrice;

    const outputTokenquoteRate = outputToken?.quote_rate ?? 0;
    const adjustedOutputValue = Number(outputValue) / Math.pow(10, outputToken?.contract_decimals ?? 18);
    const outputTokenPrice = outputTokenquoteRate;
    let token1UsdValue = adjustedOutputValue * outputTokenPrice;

        return {
            action: DECODED_ACTION.ADD_LIQUIDITY,
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
                    value: exchange_contract
                }
            ],
            tokens: [
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_0?.contract_ticker_symbol ??
                        null,
                    value: decoded.amount0.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_0?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(
                        token0UsdValue
                    ),
                    usd_value : token0UsdValue,
                    heading: "Token 0 Deposited",
                },
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_1?.contract_ticker_symbol ??
                        null,
                    value: decoded.amount1.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_1?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(
                        token1UsdValue
                    ),
                    usd_value : token1UsdValue,
                    heading: "Token 1 Deposited",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "sushiswap-v2:Burn",
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
        
            let inputToken: Token | null = null,
            outputToken: Token | null = null,
            inputValue: bigint = BigInt(0),
                outputValue: bigint = BigInt(0);
        
        

        const { data } = await covalent_client.XykService.getPoolByAddress(
            chain_name,
            "sushiswap_v2",
            exchange_contract
        );

        const tokens = data?.items?.[0];
        if (tokens) {
            const { token_0, token_1 } = tokens;
                [inputToken, outputToken, inputValue, outputValue] = [
                    token_0,
                    token_1,
                    decoded.amount0,
                    decoded.amount1,
                ];
        }

        const inputTokenquoteRate = inputToken?.quote_rate ?? 0;
        const adjustedVInputalue = Number(inputValue) / Math.pow(10, inputToken?.contract_decimals ?? 18);
        const inputTokenPrice = inputTokenquoteRate;
        let token0UsdValue = adjustedVInputalue * inputTokenPrice;

        const outputTokenquoteRate = outputToken?.quote_rate ?? 0;
        const adjustedOutputValue = Number(outputValue) / Math.pow(10, outputToken?.contract_decimals ?? 18);
        const outputTokenPrice = outputTokenquoteRate;
        let token1UsdValue = adjustedOutputValue * outputTokenPrice;

        return {
            action: DECODED_ACTION.REMOVE_LIQUIDITY,
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
                    value: exchange_contract
                }
            ],
            tokens: [
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_0?.contract_ticker_symbol ??
                        null,
                    value: decoded.amount0.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_0?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(
                        token0UsdValue
                    ),
                    usd_value: token0UsdValue,
                    heading: "Token 0 Redeemed",
                },
                {
                    ticker_symbol:
                        data?.items?.[0]?.token_1?.contract_ticker_symbol ??
                        null,
                    value: decoded.amount1.toString(),
                    decimals: +(
                        data?.items?.[0]?.token_1?.contract_decimals ?? 18
                    ),
                    pretty_quote: prettifyCurrency(
                        token1UsdValue
                    ),
                    usd_value: token1UsdValue,
                    heading: "Token 1 Redeemed",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "sushiswap-v2:Sync",
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
            "sushiswap_v2",
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
        const adjustedVInputalue = Number(inputValue) / Math.pow(10, inputToken?.contract_decimals ?? 18);
        const inputTokenPrice = inputTokenquoteRate;
        let inputTokenUsdValue = adjustedVInputalue * inputTokenPrice;

        const outputTokenquoteRate = outputToken?.quote_rate ?? 0;
        const adjustedOutputValue = Number(outputValue) / Math.pow(10, outputToken?.contract_decimals ?? 18);
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
            details:[],
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
                    pretty_quote: prettifyCurrency(
                        inputTokenUsdValue
                    ),
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
                    pretty_quote: prettifyCurrency(
                        outputTokenUsdValue
                    ),
                    usd_value: outputTokenUsdValue,
                    heading: "Reserve 1",
                },
            ],
        };
    }
);

GoldRushDecoder.on(
    "sushiswap-v2:PairCreated",
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
            "sushiswap_v2",
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
