import { EventType, type QueryOptions } from "../../../services/decoder/decoder.types";
import { NftTransferReport, TransferReport} from "../transaction_service_types";
import { DECODED_ACTION, DECODED_EVENT_CATEGORY } from "../../../services/decoder/decoder.constants";


export const mapTransferEventToReport = (decodedEvent: EventType): TransferReport | NftTransferReport| null => {
      if (decodedEvent.category !== DECODED_EVENT_CATEGORY.TOKEN || decodedEvent.action !== DECODED_ACTION.TRANSFERRED) {
          return null;
      }
    
    
    if (decodedEvent.tokens) {
        const inputToken = decodedEvent.tokens[0];

        return {
            token_num_decimals: inputToken?.decimals ?? 18,
            token_name: inputToken?.ticker_symbol ?? "",
            token_address: inputToken?.address ?? "",
            token_amount: inputToken?.value ?? "0",
            token_quote_rate: inputToken?.quote_rate ?? 0,
            token_usd_quote: inputToken?.usd_value ?? 0,
            pretty_token_usd_quote: inputToken?.pretty_quote ?? "",
            sender: decodedEvent.details.find(d => d.heading === "From")?.value ?? "",
            recipient: decodedEvent.details.find(d => d.heading === "To")?.value ?? ""
        };
    
    }

    if (decodedEvent.nfts) {
        return {
            token_name: decodedEvent.nfts[0].collection_name ?? "",
            token_address: decodedEvent.nfts[0].collection_address ?? "",
            token_ids: decodedEvent.nfts[0].token_identifier ?? "",
            token_usd_quote: decodedEvent.nfts[0].price ?? 0,
            pretty_token_usd_quote: decodedEvent.nfts[0].pretty_quote ?? "",
            sender: decodedEvent.details.find(d => d.heading === "From")?.value ?? "",
            recipient: decodedEvent.details.find(d => d.heading === "To")?.value ?? ""
        };
    }

    return null;

  

  };