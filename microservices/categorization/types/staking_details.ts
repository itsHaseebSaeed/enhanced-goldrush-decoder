import { EventToken, EventType, type QueryOptions } from "../../../services/decoder/decoder.types";
import {  StakingReport } from "../transaction_service_types";
import { DECODED_ACTION, DECODED_EVENT_CATEGORY } from "../../../services/decoder/decoder.constants";

export const mapStakingEventToReport = (decodedEvent: EventType, allEvents: EventType[]): StakingReport | null => {
      const commonFields = (inputToken?: EventToken, outputToken?: EventToken): StakingReport => ({
          protocol: decodedEvent.protocol,
          event: decodedEvent.name,
          staked_asset_address: inputToken?.address ?? "",
          staked_asset_ticker: inputToken?.ticker_symbol ?? "",
          staked_asset_num_decimals: inputToken?.decimals ?? 18,
          staked_asset_name: inputToken?.ticker_symbol ?? "",
          staked_asset_amount: inputToken?.value ?? "0",
          staked_asset_quote_rate: inputToken?.quote_rate ?? 0,
          staked_asset_usd_quote: inputToken?.usd_value ?? 0,
          pretty_staked_asset_usd_quote: inputToken?.pretty_quote ?? "",
          minted_address: outputToken?.address ?? "",
          minted_ticker: outputToken?.ticker_symbol ?? "",
          minted_num_decimals: outputToken?.decimals ?? 18,
          minted_name: outputToken?.ticker_symbol ?? "",
          minted_amount: outputToken?.value ?? "0",
          minted_quote_rate: outputToken?.quote_rate ?? 0,
          minted_usd_quote: outputToken?.usd_value ?? 0,
          pretty_minted_usd_quote: outputToken?.pretty_quote ?? "",
          depositor: decodedEvent.details.find(d => d.heading === "Depositor")?.value ?? "",
      });
  
      const tokens = decodedEvent.tokens;
      let inputToken = tokens?.find(d => d.heading === "Deposit Amount");
      const outputToken = tokens?.find(d => d.heading === "ezETH Minted");

   // Refine filtering logic to ensure only desired events are considered
      const testing = allEvents?.find(event => 
       event.category === DECODED_EVENT_CATEGORY.TOKEN &&
       decodedEvent.action !== DECODED_ACTION.TRANSFERRED &&
       event.tokens?.[0]?.address?.toLowerCase() === inputToken?.address?.toLowerCase()
   );
      if (testing ) {
            inputToken = testing?.tokens?.[0];
      }

      if (inputToken || outputToken) {
            switch (decodedEvent.action) {
                  case DECODED_ACTION.DEPOSIT:
                  case DECODED_ACTION.WITHDRAW:
                        return commonFields(inputToken, outputToken);
                  default:
                        return null;
            }
      } else {
            return null
      }
  };
  
  