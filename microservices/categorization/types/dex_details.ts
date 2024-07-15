import { EventToken, EventType, type QueryOptions } from "../../../services/decoder/decoder.types";
import { CategorizedTransaction,DexReport,NftSalesReport,LendingReport } from "../transaction_service_types";
import { DECODED_ACTION, DECODED_EVENT_CATEGORY } from "../../../services/decoder/decoder.constants";


export const mapDexEventToReport = (decodedEvent: EventType): DexReport | null => {
    const commonFields = (inputToken: EventToken | undefined, outputToken: EventToken | undefined) => ({
        protocol: decodedEvent.protocol,
        aggregator_name: decodedEvent.details.find(d => d.heading === "Aggregator")?.value ?? "",
        aggregator_address: decodedEvent.details.find(d => d.heading === "Aggregator Address")?.value ?? "",
        // version: 0,
        // fork_version: 0,
        // fork: "",
        event: decodedEvent.name,
        pair_address: decodedEvent.details.find(d => d.heading === "Pair")?.value ?? "",
        pair_lp_fee_bps: 0,
        lp_token_address: decodedEvent.details.find(d => d.heading === "Lp Token Address")?.value ?? "",
        lp_token_ticker: decodedEvent.details.find(d => d.heading === "Token ID")?.value ?? "",
        lp_token_num_decimals: 0,
        lp_token_name: "",
        lp_token_value: "",
        exchange_rate_usd: 0,
        // token_0_ticker: inputToken?.ticker_symbol ?? "",
        token_0_num_decimals: inputToken?.decimals ?? 18,
        token_0_name: inputToken?.ticker_symbol ?? "",
        token_0_amount: inputToken?.value ?? "0",
        token_0_quote_rate: inputToken?.quote_rate ?? 0,
        token_0_usd_quote: inputToken?.usd_value ?? 0,
        pretty_token_0_usd_quote: inputToken?.pretty_quote ?? "",
        // token_1_ticker: outputToken?.ticker_symbol ?? "",
        token_1_num_decimals: outputToken?.decimals ?? 18,
        token_1_name: outputToken?.ticker_symbol ?? "",
        token_1_amount: outputToken?.value ?? "0",
        token_1_quote_rate: outputToken?.quote_rate ?? 0,
        token_1_usd_quote: outputToken?.usd_value ?? 0,
        pretty_token_1_usd_quote: outputToken?.pretty_quote ?? "",
        sender: decodedEvent.details.find(d => d.heading === "Sender")?.value ?? "",
        recipient: decodedEvent.details.find(d => d.heading === "To")?.value ?? ""
    });


    const tokens = decodedEvent.tokens;
    const inputToken = tokens?.[0];
    const outputToken = tokens?.[1];

    switch (decodedEvent.action) {
        case DECODED_ACTION.SWAPPED:
        case DECODED_ACTION.ADD_LIQUIDITY:
        case DECODED_ACTION.MINT:    
        case DECODED_ACTION.REMOVE_LIQUIDITY:
        case DECODED_ACTION.BURN:
        case DECODED_ACTION.COLLECT:


            return commonFields(inputToken, outputToken);
        default:
            return null;
    }
};