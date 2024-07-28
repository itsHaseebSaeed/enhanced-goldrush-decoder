import { GoldRushDecoder } from "../../decoder";
import type { EventDetails } from "../../decoder.types";
import { type EventType } from "../../decoder.types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { decodeEventLog, type Abi } from "viem";
import PORTAL_BRIDGE_ABI from "./abis/wormhole-portal-bridge.abi.json";
import ETH_CORE_ABI from "./abis/wormhole-eth-core.abi.json";
import wormholeChainData from "./wormhole_chain_id.json";
import { timestampParser } from "../../../../utils/functions/timestamp-parser";
import { prettifyCurrency } from "@covalenthq/client-sdk";
import { currencyToNumber } from "../../../../utils/functions";

//Withdraw back to eth
GoldRushDecoder.on(
    "wormhole:TransferRedeemed",
    [
        "eth-mainnet",
        "arbitrum-mainnet",
        "bsc-mainnet",
        "matic-mainnet",
        "avalanche-mainnet",
        "emerald-paratime-mainnet",
        "aurora-mainnet",
        "celo-mainnet",
        "moonbeam-mainnet",
        "optimism-mainnet",
        "base-mainnet",
    ],
    PORTAL_BRIDGE_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: PORTAL_BRIDGE_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "TransferRedeemed",
        }) as {
            eventName: "TransferRedeemed";
            args: {
                emitterChainId: number;
                emitterAddress: string;
                sequence: bigint;
            };
        };

        const from_chain = getChainNameById(
            decoded.emitterChainId,
            wormholeChainData.chains
        );
        const to_chain = chain_name;

        const details: EventDetails = [
            {
                heading: "Emitter Chain ID",
                value: decoded.emitterChainId.toString(),
                type: "text",
            },
            {
                heading: "Emitter Address",
                value: decoded.emitterAddress,
                type: "address",
            },
            {
                heading: "Sequence",
                value: decoded.sequence.toLocaleString(),
                type: "text",
            },
            {
                heading: "From",
                value: decoded.emitterAddress,
                type: "address",
            },
            {
                heading: "To",
                value: tx.to_address,
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

        return {
            action: DECODED_ACTION.WITHDRAW,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "TransferRedeemed",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
        };
    }
);

//Deposited from eth
GoldRushDecoder.on(
    "wormhole:LogMessagePublished",
    [
        "eth-mainnet",
        "arbitrum-mainnet",
        "bsc-mainnet",
        "matic-mainnet",
        "avalanche-mainnet",
        "emerald-paratime-mainnet",
        "aurora-mainnet",
        "celo-mainnet",
        "moonbeam-mainnet",
        "optimism-mainnet",
        "base-mainnet",
        "gnosis-mainnet",
    ],
    ETH_CORE_ABI as Abi,
    async (
        log_event,
        tx,
        chain_name,
        covalent_client,
        options
    ): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: ETH_CORE_ABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "LogMessagePublished",
        }) as {
            eventName: "LogMessagePublished";
            args: {
                sender: string;
                consistencyLevel: bigint;
                sequence: bigint;
                nonce: bigint;
                payload: string;
            };
        };

        const decodedPayload = decodeWormholeVAAPayload(decoded.payload);

        const from_chain = getChainNameById(
            decodedPayload.tokenChain,
            wormholeChainData.chains
        );
        const to_chain = getChainNameById(
            decodedPayload.toChain,
            wormholeChainData.chains
        );

        const details: EventDetails = [
            {
                heading: "Sender",
                value: decoded.sender,
                type: "address",
            },
            {
                heading: "Consistency Level",
                value: decoded.consistencyLevel.toLocaleString(),
                type: "text",
            },
            {
                heading: "Sequence",
                value: decoded.sequence.toLocaleString(),
                type: "text",
            },
            {
                heading: "Nonce",
                value: decoded.nonce.toLocaleString(),
                type: "text",
            },
            {
                heading: "Payload",
                value: decoded.payload.toString(),
                type: "text",
            },
            {
                heading: "From",
                value: tx.from_address,
                type: "address",
            },
            {
                heading: "To",
                value: decodedPayload.toAddress,
                type: "address",
            },
            {
                heading: "amount",
                value: String(decodedPayload.amount),
                type: "text",
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
            action: DECODED_ACTION.TRANSFERRED,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "LogMessagePublished",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: log_event.sender_name as string,
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
        };

        if (decodedPayload.amount) {
            const date = timestampParser(
                log_event.block_signed_at,
                "YYYY-MM-DD"
            );
            const { data } =
                await covalent_client.PricingService.getTokenPrices(
                    chain_name,
                    "USD",
                    decodedPayload.tokenAddress,
                    {
                        from: date,
                        to: date,
                    }
                );

            let usd_value =
                data?.[0]?.items?.[0]?.price *
                    (Number(decodedPayload.amount) /
                        Math.pow(
                            10,
                            data?.[0]?.items?.[0]?.contract_metadata
                                ?.contract_decimals ?? 18
                        )) ?? 0;

            const pretty_quote = prettifyCurrency(usd_value);

            parsedData.tokens = [
                {
                    address: data?.[0]?.contract_address ?? "",
                    decimals: data?.[0]?.contract_decimals ?? 18,
                    heading: "Token Amount",
                    pretty_quote: pretty_quote,
                    usd_value: usd_value,
                    ticker_symbol: data?.[0]?.contract_ticker_symbol,
                    value: decodedPayload.amount.toString(),
                },
            ];
        }

        return parsedData;
    }
);

// For Token Transfer actions, the Payload ID is 1. This is used when tokens are transferred from one chain to another using a lockup/mint and burn/unlock mechanism. Source

// For Token + Message actions, also referred to as a payload3 message or a Contract Controlled Transfer, the Payload ID is 3. This is used when an app may include additional data in the transfer to inform some application-specific behavior. Source

// In the Token Bridge App, the Payload IDs are 1 for Transfer, 2 for AssetMeta, and 3 for TransferWithPayload. Source

// In the NFT Bridge App, the Payload IDs are 1 for Transfer, 2 for RegisterChain, and 3 for UpgradeContract. Source

type DecodedPayload = {
    payloadId: number;
    amount: bigint;
    tokenAddress: string;
    tokenChain: number;
    toAddress: string;
    toChain: number;
    fee: bigint;
};
function decodeWormholeVAAPayload(payload: string): DecodedPayload {
    if (payload.startsWith("0x")) {
        payload = payload.slice(2);
    }
    const hexToBigInt = (hex: string | undefined | null): bigint => {
        if (!hex) {
            return BigInt(0);
        }
        return BigInt(`0x${hex}`);
    };

    const hexToInt = (hex: string | undefined | null): number => {
        if (!hex) {
            return 0;
        }
        return parseInt(hex, 16);
    };

    const hexToAddress = (hex: string | undefined | null): string => {
        if (!hex) {
            return "";
        }
        return `0x${hex.slice(-40)}`;
    };

    const payloadId = hexToInt(payload.slice(0, 2));
    const amount = normalizeAmount(hexToBigInt(payload.slice(2, 66)), 18);
    const tokenAddress = hexToAddress(payload.slice(66, 130));
    const tokenChain = hexToInt(payload.slice(130, 134));
    const toAddress = hexToAddress(payload.slice(134, 198));
    const toChain = hexToInt(payload.slice(198, 202));

    console.log(toChain);

    const fee = hexToBigInt(payload.slice(202, 266));

    return {
        payloadId,
        amount,
        tokenAddress,
        tokenChain,
        toAddress,
        toChain,
        fee,
    };
}

function getChainNameById(
    chainId: number,
    chains: { wormhole_chain_id: number; chain_name: string }[]
): string {
    const chain = chains.find((c) => c.wormhole_chain_id === chainId);
    return chain ? chain.chain_name : "Unknown";
}

function normalizeAmount(amount: bigint, decimals: number): bigint {
    if (decimals > 8) {
        return amount * BigInt(10 ** (decimals - 8));
    }
    return amount;
}
