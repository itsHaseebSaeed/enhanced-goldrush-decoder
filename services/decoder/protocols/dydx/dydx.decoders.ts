import { prettifyCurrency } from "@covalenthq/client-sdk";
import { Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventDetails, EventTokens, EventType } from "../../decoder.types";
import DydxSoloMarginABI from "./abis/dydx.solomargin.abi.json"; // Add the ABI file path
import DydxPerpetualABI from "./abis/dydx.perpetual.abi.json"; // Add the ABI file path

import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { timestampParser } from "../../../../utils/functions/timestamp-parser";
import { ethers } from "ethers";

const infuraProvider = new ethers.InfuraProvider(
    "mainnet",
    "578f8e9e011c421a91e20f214e86d7de"
);

const SOLO_MARGIN_CONTRACT_ADDRESS =
    "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e";

GoldRushDecoder.on(
    "dydx:Transfer",
    ["eth-mainnet"],
    DydxSoloMarginABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType | null> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: DydxSoloMarginABI,
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

        const details: EventDetails = [
            {
                heading: "From",
                type: "address",
                value: decoded.from,
            },
            {
                heading: "To",
                type: "address",
                value: decoded.to,
            },
            {
                heading: "Value",
                type: "text",
                value: usd_value.toString(),
            },
        ];

        const protocol = {
            logo: log_event.sender_logo_url as string,
            name: log_event.sender_name as string,
            address: log_event.sender_address as string,
        };

        if (
            decoded.from.toLowerCase() ===
            SOLO_MARGIN_CONTRACT_ADDRESS.toLowerCase()
        ) {
            return {
                action: DECODED_ACTION.BORROW,
                category: DECODED_EVENT_CATEGORY.MARGIN,
                name: "Borrow",
                protocol,
                ...(options.raw_logs ? { raw_log: log_event } : {}),
                details,
                tokens,
            };
        } else if (
            decoded.to.toLowerCase() ===
            SOLO_MARGIN_CONTRACT_ADDRESS.toLowerCase()
        ) {
            return {
                action: DECODED_ACTION.REPAY,
                category: DECODED_EVENT_CATEGORY.MARGIN,
                name: "Repay",
                protocol,
                ...(options.raw_logs ? { raw_log: log_event } : {}),
                details,
                tokens,
            };
        } else {
            return null;
        }
    }
);

GoldRushDecoder.on(
    "dydx:LogDeposit",
    ["eth-mainnet"],
    DydxPerpetualABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType | null> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: DydxPerpetualABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "LogDeposit",
        }) as {
            eventName: "LogDeposit";
            args: {
                depositorEthKey: string;
                starkKey: string;
                assetType: string;
                nonQuantizedAmount: string;
                quantizedAmount: string;
            };
        };

        const perpContract = new ethers.Contract(
            log_event.sender_address,
            DydxPerpetualABI,
            infuraProvider
        );

        // Ensure assetType is passed correctly as a BigNumber
        const assetTypeBigNumber = BigInt(decoded.assetType);

        const assetInfo = await perpContract.getAssetInfo(assetTypeBigNumber);

        const details: EventDetails = [
            {
                heading: "depositorEthKey",
                value: decoded.depositorEthKey.toString(),
                type: "text",
            },
            {
                heading: "starkKey",
                value: decoded.starkKey.toString(),
                type: "text",
            },
            {
                heading: "assetType",
                value: decoded.assetType.toString(),
                type: "text",
            },
            {
                heading: "nonQuantizedAmount",
                value: decoded.nonQuantizedAmount.toString(),
                type: "text",
            },
            {
                heading: "quantizedAmount",
                value: decoded.quantizedAmount.toString(),
                type: "text",
            },
        ];
        const token_addresss = decodeAssetInfo(assetInfo);

        const date = timestampParser(log_event.block_signed_at, "YYYY-MM-DD");
        const { data } = await covalent_client.PricingService.getTokenPrices(
            chain_name,
            "USD",
            token_addresss,
            {
                from: date,
                to: date,
            }
        );

        const usdValue =
            data?.[0]?.items?.[0]?.price *
                (Number(decoded.nonQuantizedAmount) /
                    Math.pow(
                        10,
                        data?.[0]?.items?.[0]?.contract_metadata
                            ?.contract_decimals ?? 18
                    )) ?? 0;

        const tokens: EventTokens = [
            {
                heading: "Deposit",
                value: decoded.nonQuantizedAmount.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usdValue),
                usd_value: usdValue,
                address: token_addresss,
            },
        ];
        return {
            action: DECODED_ACTION.DEPOSIT,
            category: DECODED_EVENT_CATEGORY.PERPETUAL,
            name: "Perpetual Deposit",
            protocol: {
                name: "dYdX" as string,
                address: log_event.sender_address,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

GoldRushDecoder.on(
    "dydx:LogWithdrawalPerformed",
    ["eth-mainnet"],
    DydxPerpetualABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType | null> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: DydxPerpetualABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "LogWithdrawalPerformed",
        }) as {
            eventName: "LogWithdrawalPerformed";
            args: {
                ownerKey: string;
                assetType: string;
                nonQuantizedAmount: string;
                quantizedAmount: string;
                recipient: string;
            };
        };

        const perpContract = new ethers.Contract(
            log_event.sender_address,
            DydxPerpetualABI,
            infuraProvider
        );

        // Ensure assetType is passed correctly as a BigNumber
        const assetTypeBigNumber = BigInt(decoded.assetType);

        const assetInfo = await perpContract.getAssetInfo(assetTypeBigNumber);

        const details: EventDetails = [
            {
                heading: "ownerKey",
                value: decoded.ownerKey.toString(),
                type: "text",
            },
            {
                heading: "assetType",
                value: decoded.assetType.toString(),
                type: "text",
            },
            {
                heading: "nonQuantizedAmount",
                value: decoded.nonQuantizedAmount.toString(),
                type: "text",
            },
            {
                heading: "quantizedAmount",
                value: decoded.quantizedAmount.toString(),
                type: "text",
            },
            {
                heading: "To",
                value: decoded.recipient.toString(),
                type: "text",
            },
        ];
        const token_addresss = decodeAssetInfo(assetInfo);

        const date = timestampParser(log_event.block_signed_at, "YYYY-MM-DD");
        const { data } = await covalent_client.PricingService.getTokenPrices(
            chain_name,
            "USD",
            token_addresss,
            {
                from: date,
                to: date,
            }
        );
        const usdValue =
            data?.[0]?.items?.[0]?.price *
                (Number(decoded.nonQuantizedAmount) /
                    Math.pow(
                        10,
                        data?.[0]?.items?.[0]?.contract_metadata
                            ?.contract_decimals ?? 18
                    )) ?? 0;
        const tokens: EventTokens = [
            {
                heading: "Withdraw",
                value: decoded.nonQuantizedAmount.toString(),
                decimals: data?.[0]?.contract_decimals,
                ticker_symbol: data?.[0]?.contract_ticker_symbol,
                pretty_quote: prettifyCurrency(usdValue),
                usd_value: usdValue,
                address: token_addresss,
            },
        ];
        return {
            action: DECODED_ACTION.WITHDRAW,
            category: DECODED_EVENT_CATEGORY.PERPETUAL,
            name: "Perpetual withdraw",
            protocol: {
                name: "dYdX" as string,
                address: log_event.sender_address,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
            tokens,
        };
    }
);

// Function to decode asset info
function decodeAssetInfo(encodedData: string) {
    const tokenAddress = "0x" + encodedData.slice(-40);

    return tokenAddress;
}
