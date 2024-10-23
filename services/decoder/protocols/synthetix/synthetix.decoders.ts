import { prettifyCurrency } from "@covalenthq/client-sdk";
import { Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventTokens, EventType } from "../../decoder.types";
import SynthetixABI from "./abis/synthetix.implementation.abi.json"; // Add the ABI file path
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { timestampParser } from "../../../../utils/functions/timestamp-parser";

// Decoder for the Synthetix Issued event
GoldRushDecoder.on(
    "synthetix:Issued",
    [
        // "base-mainnet",
        "eth-mainnet",
        // "optimism-mainnet",
        // "arbitrum-mainnet",
    ],
    SynthetixABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: SynthetixABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Issued",
        }) as {
            eventName: "Issued";
            args: {
                account: string;
                value: bigint;
            };
        };

        const date = timestampParser(log_event.block_signed_at, "YYYY-MM-DD");
        const { data } = await covalent_client.PricingService.getTokenPrices(
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

        const tokens: EventTokens = [
            {
                heading: "Issue",
                value: decoded.value.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usd_value),
                usd_value: usd_value,
                address: log_event.sender_address,
            },
        ];

        return {
            action: DECODED_ACTION.MINT,
            category: DECODED_EVENT_CATEGORY.SYNTHTIC,
            name: "Issued",
            protocol: {
                address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
                name: "Synthetix",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
                {
                    heading: "From",
                    type: "address",
                    value: log_event.sender_address,
                },
                {
                    heading: "To",
                    type: "address",
                    value: decoded.account,
                },
                {
                    heading: "Value",
                    type: "text",
                    value: usd_value.toString(),
                },
                {
                    heading: "Synthetic Address",
                    type: "text",
                    value: log_event.sender_address,
                },
            ],
            tokens,
        };
    }
);

// Decoder for the Synthetix Burned event
GoldRushDecoder.on(
    "synthetix:Burned",
    [
        // "base-mainnet",
        "eth-mainnet",
        // "optimism-mainnet",
        // "arbitrum-mainnet",
    ],
    SynthetixABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: SynthetixABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Burned",
        }) as {
            eventName: "Burned";
            args: {
                account: string;
                value: bigint;
            };
        };

        const date = timestampParser(log_event.block_signed_at, "YYYY-MM-DD");
        const { data } = await covalent_client.PricingService.getTokenPrices(
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

        const tokens: EventTokens = [
            {
                heading: "Burn",
                value: decoded.value.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usd_value),
                usd_value: usd_value,
                address: log_event.sender_address,
            },
        ];

        return {
            action: DECODED_ACTION.BURN,
            category: DECODED_EVENT_CATEGORY.SYNTHTIC,
            name: "Burned",
            protocol: {
                address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
                name: "Synthetix",
            },

            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details: [
                {
                    heading: "From",
                    type: "address",
                    value: log_event.sender_address,
                },
                {
                    heading: "To",
                    type: "address",
                    value: decoded.account,
                },
                {
                    heading: "Value",
                    type: "text",
                    value: usd_value.toString(),
                },
                {
                    heading: "Synthetic Address",
                    type: "text",
                    value: log_event.sender_address,
                },
            ],
            tokens,
        };
    }
);
