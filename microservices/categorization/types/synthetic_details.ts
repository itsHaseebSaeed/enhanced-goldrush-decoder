import {
    EventToken,
    EventType,
    type QueryOptions,
} from "../../../services/decoder/decoder.types";
import { SyntheticReport, VaultReport } from "../transaction_service_types";
import { DECODED_ACTION } from "../../../services/decoder/decoder.constants";

export const mapSyntheticEventToReport = (
    decodedEvent: EventType
): SyntheticReport | null => {
    const createFields = (inputToken?: EventToken): SyntheticReport => ({
        protocol: decodedEvent.protocol,
        event: decodedEvent.name,
        token_address: inputToken?.address ?? "",
        token_ticker: inputToken?.ticker_symbol ?? "",
        token_num_decimals: inputToken?.decimals ?? 18,
        token_name: inputToken?.ticker_symbol ?? "",
        token_amount: inputToken?.value ?? "0",
        token_quote_rate: inputToken?.quote_rate ?? 0,
        token_usd_quote: inputToken?.usd_value ?? 0,
        pretty_token_usd_quote: inputToken?.pretty_quote ?? "",
        from:
            decodedEvent.details.find((d) => d.heading === "From")?.value ?? "",
        to: decodedEvent.details.find((d) => d.heading === "To")?.value ?? "",
        synthetic_asset_address:
            decodedEvent.details.find((d) => d.heading === "Synthetic Address")
                ?.value ?? "",
    });
    const tokens = decodedEvent.tokens;
    const inputToken = tokens?.[0];

    switch (decodedEvent.action) {
        case DECODED_ACTION.MINT:
        case DECODED_ACTION.BURN:
            return createFields(inputToken);
    }
    return null;
};
