import { prettifyCurrency } from "@covalenthq/client-sdk";
import { Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventType } from "../../decoder.types";
import SynthetixABI from "./abis/synthetix.implementation.abi.json";  // Add the ABI file path
import { DECODED_ACTION, DECODED_EVENT_CATEGORY } from "../../decoder.constants";

// Decoder for the Synthetix Issued event
GoldRushDecoder.on(
  "synthetix:Issued",
  ["eth-mainnet"],
  SynthetixABI as Abi,
  async (log_event, tx, chain_name, covalent_client, options): Promise<EventType> => {
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

    const usdValue = Number(decoded.value) / 1e18; // Assuming SNX has 18 decimals

    return {
      action: DECODED_ACTION.MINT,
      category: DECODED_EVENT_CATEGORY.SYNTHTIC,
      name: "Issued",
      protocol: {
            logo: log_event.sender_logo_url as string,
            address: log_event.sender_address as string,
        name: log_event.sender_name as string,
      },
      ...(options.raw_logs ? { raw_log: log_event } : {}),
      details: [
        {
          heading: "Account",
          type: "address",
          value: decoded.account,
        },
        {
          heading: "Value",
          type: "text",
          value: usdValue.toString(),
        },
      ],
    };
  }
);

// Decoder for the Synthetix Burned event
GoldRushDecoder.on(
  "synthetix:Burned",
  ["eth-mainnet"],
  SynthetixABI as Abi,
  async (log_event, tx, chain_name, covalent_client, options): Promise<EventType> => {
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

    const usdValue = Number(decoded.value) / 1e18; // Assuming SNX has 18 decimals

    return {
      action: DECODED_ACTION.BURN,
      category: DECODED_EVENT_CATEGORY.SYNTHTIC,
      name: "Burned",
      protocol: {
        logo: log_event.sender_logo_url as string,
            name: log_event.sender_name as string,
            address: log_event.sender_address as string,

      },
      ...(options.raw_logs ? { raw_log: log_event } : {}),
      details: [
        {
          heading: "Account",
          type: "address",
          value: decoded.account,
        },
        {
          heading: "Value",
          type: "text",
          value: usdValue.toString(),
        },
      ],
    };
  }
);
