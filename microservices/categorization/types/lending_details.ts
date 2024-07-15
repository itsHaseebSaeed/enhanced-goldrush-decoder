import {
    EventToken,
    EventType,
    type QueryOptions,
} from "../../../services/decoder/decoder.types";
import { LendingReport, VaultReport } from "../transaction_service_types";
import { DECODED_ACTION } from "../../../services/decoder/decoder.constants";

export const mapLendingEventToReport = (
    decodedEvent: EventType
): LendingReport | null => {
    const createFields = (inputToken?: EventToken): LendingReport => ({
        protocol: decodedEvent.protocol,
        event: decodedEvent.name,
        reserve_address: inputToken?.address ?? "",
        reserve_ticker: inputToken?.ticker_symbol ?? "",
        reserve_decimals: inputToken?.decimals ?? 18,
        reserve_name: inputToken?.ticker_symbol ?? "",
        reserve_amount: inputToken?.value ?? "0",
        reserve_quote_rate: inputToken?.quote_rate ?? 0,
        reserve_usd_quote: inputToken?.usd_value ?? 0,
        pretty_reserve_usd_quote: inputToken?.pretty_quote ?? "",
        borrow_rate_mode:
            decodedEvent.details.find((d) => d.heading === "Interest Rate Mode")
                ?.value ?? "0",
        borrow_rate: Number(
            decodedEvent.details.find((d) => d.heading === "Borrow Rate")
                ?.value ?? "0"
        ),
        premium_amount: Number(
            decodedEvent.tokens?.find((d) => d.heading === "Flash Loan Premium")
                ?.value ?? "0"
        ),
        premium_usd_quote: Number(
            decodedEvent.tokens?.find((d) => d.heading === "Flash Loan Premium")
                ?.usd_value ?? "0"
        ),
        target_address:
            decodedEvent.details?.find((d) => d.heading === "Target")?.value ??
            "",
    });
    const tokens = decodedEvent.tokens;
    const inputToken = tokens?.[0];

    switch (decodedEvent.action) {
        case DECODED_ACTION.BORROW:
        case DECODED_ACTION.REPAY:
        case DECODED_ACTION.FLASHLOAN:
        case DECODED_ACTION.SUPPLY:
        case DECODED_ACTION.WITHDRAW:
            return createFields(inputToken);
    }
    return null;
};
