import {
    EventToken,
    EventType,
    type QueryOptions,
} from "../../../services/decoder/decoder.types";
import { BridgingReport, PerpectualReport } from "../transaction_service_types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../../services/decoder/decoder.constants";

export const mapBridgingEventToReport = (
    decodedEvent: EventType,
    allEvents: EventType[]
): BridgingReport | null => {
    const createFields = (inputToken?: EventToken): BridgingReport => ({
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
        from_chain:
            decodedEvent.details.find((d) => d.heading === "From chain")
                ?.value ?? "",
        to_chain:
            decodedEvent.details.find((d) => d.heading === "To chain")?.value ??
            "",
    });
    const tokens = decodedEvent.tokens;
    let inputToken = tokens?.[0];

    if (decodedEvent.name === "TransferRedeemed") {
        // Refine filtering logic to ensure only desired events are considered
        const relevantEvent = allEvents?.find(
            (event) =>
                event.category === DECODED_EVENT_CATEGORY.TOKEN &&
                decodedEvent.action !== DECODED_ACTION.TRANSFERRED
        );
        if (relevantEvent) {
            inputToken = relevantEvent?.tokens?.[0];
        }
    }

    if (inputToken) {
        switch (decodedEvent.action) {
            case DECODED_ACTION.DEPOSIT:
            case DECODED_ACTION.TRANSFERRED:
            case DECODED_ACTION.WITHDRAW:
                return createFields(inputToken);
        }
    }
    return null;
};
