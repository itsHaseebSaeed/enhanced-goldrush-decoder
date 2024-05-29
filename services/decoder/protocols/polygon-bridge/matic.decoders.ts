import { GoldRushDecoder } from "../../decoder";
import type { EventDetails } from "../../decoder.types";
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

GoldRushDecoder.on(
    "matic-eth-bridge:LockedEther",
    [
          "eth-mainnet",
          "matic-mainnet"
    ],
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
                userAddress: string;
                relayerAddress: string;
                functionSignature: string;
            };
            };

        const details: EventDetails = [
            // {
            //     heading: "User Address",
            //     value: decoded.userAddress,
            //     type: "address",
            // },
            // // {
            // //     heading: "Relayer Address",
            // //     value: decoded.relayerAddress,
            // //     type: "address",
            // // },
            // // {
            // //     heading: "Function Signature",
            // //     value: decoded.functionSignature,
            // //     type: "text",
            // // },
        ];

        return {
            action: DECODED_ACTION.DEPOSITED,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "DepositEtherFor",
            protocol: {
                name: "eth-polygon bridge",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
        };
    }
);

GoldRushDecoder.on(
    "matic-eth-bridge:LockedERC20",
      [
      "eth-mainnet",
      "matic-mainnet",
    ],
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
                childToken: string;
                tokenType: string;
            };
        };

        const details: EventDetails = [
            {
                heading: "Root Token",
                value: decoded.rootToken,
                type: "address",
            },
            {
                heading: "Child Token",
                value: decoded.childToken,
                type: "address",
            },
            {
                heading: "Token Type",
                value: decoded.tokenType,
                type: "text",
            },
        ];

        return {
            action: DECODED_ACTION.DEPOSITED,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "DepositFor",
            protocol: {
                name: "eth-polygon bridge",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
        };
    }
);

GoldRushDecoder.on(
    "matic-eth-bridge:ExitedEther",
      [
        "eth-mainnet",
        "matic-mainnet",
    ],
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
        
        let price = tx.gas_quote_rate;
        
        let usd_value = price *
                (Number(decoded.amount) /
                    Math.pow(
                        10,
                        18));


        const details: EventDetails = [
            {
                heading: "exitor",
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
        ];

        return {
            action: DECODED_ACTION.WITHDRAW,
            category: DECODED_EVENT_CATEGORY.BRIDGE,
            name: "Exit",
            protocol: {
                name: "eth-polygon bridge",
            },
            ...(options.raw_logs ? { raw_log: log_event } : {}),
            details,
        };
    }
);


