import { prettifyCurrency } from "@covalenthq/client-sdk";
import { Abi, decodeEventLog } from "viem";
import { GoldRushDecoder } from "../../decoder";
import { EventType } from "../../decoder.types";
import DydxABI from "./abis/dydx.solomargin.abi.json"; // Add the ABI file path
import { DECODED_ACTION, DECODED_EVENT_CATEGORY } from "../../decoder.constants";
import { timestampParser } from "../../../../utils/functions/timestamp-parser";

const SOLO_MARGIN_CONTRACT_ADDRESS = "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e";

GoldRushDecoder.on(
  "dydx:Transfer",
  ["eth-mainnet"],
  DydxABI as Abi,
  async (log_event, tx, chain_name, covalent_client, options): Promise<EventType | null> => {
    const { raw_log_data, raw_log_topics } = log_event;

    const { args: decoded } = decodeEventLog({
      abi: DydxABI,
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
    
    let usd_value = data?.[0]?.items?.[0]?.price *
        (Number(decoded.value) /
            Math.pow(
                10,
                data?.[0]?.items?.[0]?.contract_metadata
                    ?.contract_decimals ?? 18
                )) ?? 0;
        

    if (decoded.from.toLowerCase() === SOLO_MARGIN_CONTRACT_ADDRESS.toLowerCase()) {
      return {
        action: DECODED_ACTION.BORROW,
        category: DECODED_EVENT_CATEGORY.MARGIN,
        name: "Borrow",
        protocol: {
          logo: log_event.sender_logo_url as string,
          name: log_event.sender_name as string,
          address: log_event.sender_address as string,
        },
        ...(options.raw_logs ? { raw_log: log_event } : {}),
        details: [
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
        ],
      };
    } else if (decoded.to.toLowerCase() === SOLO_MARGIN_CONTRACT_ADDRESS.toLowerCase()) {
      return {
        action: DECODED_ACTION.REPAY,
        category: DECODED_EVENT_CATEGORY.MARGIN,
        name: "Repay",
        protocol: {
          logo: log_event.sender_logo_url as string,
          name: log_event.sender_name as string,
          address: log_event.sender_address as string,
        },
        ...(options.raw_logs ? { raw_log: log_event } : {}),
        details: [
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
        ],
      };
    } else {
      return null;
    }
  }
);
