import { GoldRushDecoder } from "../../decoder";
import type { EventDetails, EventTokens } from "../../decoder.types";
import { type EventType } from "../../decoder.types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { decodeEventLog, type Abi } from "viem";
import POLYGON_BRIDGE_ABI from "./abis/matic-bridge-implementation.abi.json";
import POLYGON_ERC20_BRIDGE_ABI from "./abis/matic-bridge-erc20-implementation.abi.json";
import ERC20_ABI from "./abis/erc-20.abi.json";
import { number } from "yup";
import { currencyToNumber, timestampParser } from "../../../../utils/functions";
import { prettifyCurrency } from "@covalenthq/client-sdk";

const ERC_20_BRIDGE = "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf";
const MATIC_ETHER_BRIDGE = "0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30";

GoldRushDecoder.on(
    "matic-eth-bridge:LockedEther",
    ["eth-mainnet", "matic-mainnet"],
    POLYGON_BRIDGE_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: POLYGON_BRIDGE_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "LockedEther",
        }) as {
            eventName: "LockedEther";
            args: {
                depositor: string;
                depositReceiver: string;
                amount: string;
            };
        };

        const details: EventDetails = [
            {
                heading: "From",
                value: decoded.depositor,
                type: "address",
            },
            {
                heading: "To",
                value: decoded.depositReceiver,
                type: "address",
            },
            {
                heading: "From chain",
                value: "eth-mainnet",
                type: "text",
            },
            {
                heading: "To chain",
                value: "matic-mainnet",
                type: "text",
            },
        ];

        const usdValue =
            tx?.gas_quote_rate *
            (Number(decoded.amount) /
                Math.pow(10, tx?.gas_metadata?.contract_decimals ?? 18));

        const tokens: EventTokens = [
            {
                heading: "Deposit Amount",
                value: decoded.amount.toString(),
                decimals: tx?.gas_metadata?.contract_decimals,
                ticker_symbol: tx?.gas_metadata?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usdValue),
                usd_value: usdValue,
            },
        ];

        return {
            action: DECODED_ACTION.DEPOSIT,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "DepositEtherFor",
            protocol: {
                name: "eth-polygon bridge",
                address: MATIC_ETHER_BRIDGE,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "matic-eth-bridge:LockedERC20",
    ["eth-mainnet", "matic-mainnet"],
    POLYGON_ERC20_BRIDGE_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: POLYGON_ERC20_BRIDGE_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "LockedERC20",
        }) as {
            eventName: "LockedERC20";
            args: {
                rootToken: string;
                depositor: string;
                depositReceiver: string;
                amount: string;
            };
        };

        const details: EventDetails = [
            {
                heading: "Root Token",
                value: decoded.rootToken,
                type: "address",
            },
            {
                heading: "From",
                value: decoded.depositor.toString(),
                type: "address",
            },
            {
                heading: "To",
                value: decoded.depositReceiver.toString(),
                type: "text",
            },
            {
                heading: "From chain",
                value: "eth-mainnet",
                type: "text",
            },
            {
                heading: "To chain",
                value: "matic-mainnet",
                type: "text",
            },
            {
                heading: "amount",
                value: decoded.amount.toString(),
                type: "text",
            },
        ];

        const date = timestampParser(log_event.block_signed_at, "YYYY-MM-DD");
        const { data } = await covalent_client.PricingService.getTokenPrices(
            chain_name,
            "USD",
            decoded.rootToken,
            {
                from: date,
                to: date,
            }
        );

        const usdValue =
            data?.[0]?.items?.[0]?.price *
                (Number(decoded.amount) /
                    Math.pow(
                        10,
                        data?.[0]?.items?.[0]?.contract_metadata
                            ?.contract_decimals || 18
                    )) || 0;

        const tokens: EventTokens = [
            {
                heading: "Deposit",
                value: decoded.amount.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usdValue),
                usd_value: usdValue,
                address: decoded.rootToken,
            },
        ];

        return {
            action: DECODED_ACTION.DEPOSIT,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "DepositErc20",
            protocol: {
                name: "eth-polygon bridge",
                address: log_event.sender_address,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "matic-eth-bridge:ExitedEther",
    ["eth-mainnet", "matic-mainnet"],
    POLYGON_BRIDGE_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: POLYGON_BRIDGE_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "ExitedEther",
        }) as {
            eventName: "ExitedEther";
            args: {
                exitor: string;
                amount: number;
            };
        };

        const price = tx?.gas_quote_rate;

        const usd_value = price * (Number(decoded.amount) / Math.pow(10, 18));

        const details: EventDetails = [
            {
                heading: "From",
                value: decoded.exitor,
                type: "address",
            },
            {
                heading: "To",
                value: decoded.exitor,
                type: "address",
            },
            {
                heading: "amount",
                value: String(decoded.amount),
                type: "text",
            },
            {
                heading: "usd_value",
                value: String(usd_value),
                type: "text",
            },
            {
                heading: "From chain",
                value: "matic-mainnet",
                type: "text",
            },
            {
                heading: "To chain",
                value: "eth-mainnet",
                type: "text",
            },
        ];

        const tokens: EventTokens = [
            {
                heading: "Withdraw Amount",
                value: decoded.amount.toString(),
                decimals: tx?.gas_metadata?.contract_decimals,
                ticker_symbol: tx?.gas_metadata?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usd_value),
                usd_value: usd_value,
            },
        ];

        return {
            action: DECODED_ACTION.WITHDRAW,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "ExitEther",
            protocol: {
                name: "eth-polygon bridge",
                address: MATIC_ETHER_BRIDGE,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "matic-eth-bridge:Transfer",
    ["eth-mainnet", "matic-mainnet"],
    ERC20_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        let decoded:
            | {
                  from: string;
                  to: string;
                  value: bigint;
                  tokenId?: never;
              }
            | {
                  from: string;
                  to: string;
                  tokenId: bigint;
                  value?: never;
              };

        const { args } = decodeEventLog({
            abi: ERC20_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Transfer",
        }) as {
            eventName: "Transfer";
            args: {
                from: string;
                to: string;
                value: bigint;
            };
        };
        decoded = args;

        let action;
        let name;
        let from_chain;
        let to_chain;
        let category;
        if (decoded.from.toLowerCase() === ERC_20_BRIDGE.toLowerCase()) {
            action = DECODED_ACTION.WITHDRAW;
            name = "WithdrawErc20";
            from_chain = "matic-mainnet";
            to_chain = "eth-mainnet";
            category = DECODED_EVENT_CATEGORY.BRIDGE;
        } else {
            action = DECODED_ACTION.TRANSFERRED;
            name = DECODED_ACTION.TRANSFERRED;
            to_chain = "matic-mainnet";
            from_chain = "eth-mainnet";
            category = DECODED_EVENT_CATEGORY.TOKEN;
        }

        const details: EventDetails = [
            {
                heading: "From",
                value: decoded.from,
                type: "address",
            },
            {
                heading: "To",
                value: decoded.to,
                type: "address",
            },
            {
                heading: "From chain",
                value: from_chain,
                type: "text",
            },
            {
                heading: "To chain",
                value: to_chain,
                type: "text",
            },
        ];

        const parsedData: EventType = {
            action,
            category: category,
            name,
            protocol: {
                name: "eth-polygon bridge",
                address: ERC_20_BRIDGE,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: details,
        };

        if (decoded.value) {
            const date = timestampParser(
                log_event.block_signed_at,
                "YYYY-MM-DD"
            );
            const { data } =
                await covalent_client.PricingService.getTokenPrices(
                    chain_name,
                    "USD",
                    log_event.sender_address,
                    {
                        from: date,
                        to: date,
                    }
                );

            let usd_value =
                data?.[0]?.items?.[0]?.price *
                    (Number(decoded.value) /
                        Math.pow(
                            10,
                            data?.[0]?.items?.[0]?.contract_metadata
                                ?.contract_decimals || 18
                        )) || 0;

            const pretty_quote = prettifyCurrency(usd_value);

            parsedData.tokens = [
                {
                    decimals: data?.[0]?.contract_decimals ?? 18,
                    heading: "Token Amount",
                    pretty_quote: pretty_quote,
                    usd_value: usd_value,
                    ticker_symbol: data?.[0]?.contract_ticker_symbol,
                    value: decoded.value.toString(),
                },
            ];
        }

        return parsedData;
    }
);
