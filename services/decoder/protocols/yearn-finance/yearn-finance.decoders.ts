import { prettifyCurrency } from "@covalenthq/client-sdk";
import { Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventDetails, EventTokens, EventType } from "../../decoder.types";
import YearnFinanceABI from "./abis/yearn-finance.abi.json";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { timestampParser } from "../../../../utils/functions/timestamp-parser";
import configs from "./yearn-finance.configs"; // Import the configs

// Read Yearn Finance vault addresses from the configuration file
const yearnVaultAddresses: Set<string> = new Set(
    configs.map((config) => config.address.toLowerCase())
);

GoldRushDecoder.on(
    "yearn-finance:Transfer",
    [
        "eth-mainnet",

        // "arbitrum-mainnet", "matic-mainnet"
    ],
    YearnFinanceABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType | null> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: YearnFinanceABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Transfer",
        }) as {
            eventName: "Transfer";
            args: {
                sender: string;
                receiver: string;
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
                            ?.contract_decimals ?? 18
                    )) ?? 0;

        const tokens: EventTokens = [
            {
                heading: "Deposit",
                value: decoded.value.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usd_value),
                usd_value: usd_value,
                address: log_event.sender_address,
            },
        ];

        let details: EventDetails = [
            {
                heading: "From",
                type: "address",
                value: decoded.sender,
            },
            {
                heading: "To",
                type: "address",
                value: decoded.receiver,
            },
            {
                heading: "Value",
                type: "text",
                value: usd_value.toString(),
            },
        ];

        // Ensure that 'sender' and 'receiver' are defined before calling 'toLowerCase'
        if (
            decoded.sender &&
            yearnVaultAddresses.has(decoded.sender.toLowerCase())
        ) {
            const protocol = {
                name: "Yearn Finance" as string,
                address: decoded.sender as string,
            };

            details.push({
                heading: "Vault Address",
                type: "text",
                value: decoded.sender.toString(),
            });

            return {
                action: DECODED_ACTION.WITHDRAW,
                category: DECODED_EVENT_CATEGORY.VAULT,
                name: "Withdraw",
                protocol,
                ...(options.raw_logs ? { raw_log: log_event } : {}),
                details,
                tokens,
            };
        } else if (
            decoded.receiver &&
            yearnVaultAddresses.has(decoded.receiver.toLowerCase())
        ) {
            const protocol = {
                name: "Yearn Finance" as string,
                address: decoded.receiver as string,
            };

            details.push({
                heading: "Vault Address",
                type: "text",
                value: decoded.receiver.toString(),
            });

            return {
                action: DECODED_ACTION.DEPOSIT,
                category: DECODED_EVENT_CATEGORY.VAULT,
                name: "Deposit",
                protocol,
                ...(options.raw_logs ? { raw_log: log_event } : {}),
                details,
                tokens,
            };
        } else {
            const protocol = {
                name: "Yearn Finance" as string,
            };
            return {
                action: DECODED_ACTION.TRANSFERRED,
                category: DECODED_EVENT_CATEGORY.TOKEN,
                name: "Transfer",
                protocol,
                ...(options.raw_logs ? { raw_log: log_event } : {}),
                details,
                tokens,
            };
        }
    }
);
