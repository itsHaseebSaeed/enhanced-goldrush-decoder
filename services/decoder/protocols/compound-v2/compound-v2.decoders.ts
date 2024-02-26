import { GoldRushDecoder } from "../../decoder";
import type { EventDetails } from "../../decoder.types";
import { type EventType } from "../../decoder.types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../decoder.constants";
import { decodeEventLog, type Abi } from "viem";
import CEtherABI from "./abis/compound-v2.CEther.abi.json";

GoldRushDecoder.on(
    "compound-v2:Mint",
    ["eth-mainnet"],
    CEtherABI as Abi,
    async (log_event, tx, chain_name, covalent_client): Promise<EventType> => {
        const { raw_log_data, raw_log_topics } = log_event;

        const { args: decoded } = decodeEventLog({
            abi: CEtherABI,
            topics: raw_log_topics as [],
            data: raw_log_data as `0x${string}`,
            eventName: "Mint",
        }) as {
            eventName: "Mint";
            args: {
                minter: string;
                mintAmount: bigint;
                mintTokens: bigint;
            };
        };

        const details: EventDetails = [
            {
                heading: "Minter",
                value: decoded.minter,
                type: "address",
            },
            {
                heading: "Mint Amount",
                value: decoded.mintAmount.toString(),
                type: "text",
            },
            {
                heading: "Mint Tokens",
                value: decoded.mintTokens.toString(),
                type: "text",
            },
        ];

        return {
            action: DECODED_ACTION.TRANSFERRED,
            category: DECODED_EVENT_CATEGORY.LENDING,
            name: "Mint",
            protocol: {
                logo: log_event.sender_logo_url as string,
                name: log_event.sender_name as string,
            },
            details,
        };
    }
);
