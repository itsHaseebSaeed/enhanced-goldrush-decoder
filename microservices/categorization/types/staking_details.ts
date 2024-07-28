import {
    EventToken,
    EventType,
    type QueryOptions,
} from "../../../services/decoder/decoder.types";
import { StakingReport } from "../transaction_service_types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../../services/decoder/decoder.constants";

export const mapStakingEventToReport = (
    decodedEvent: EventType,
    allEvents: EventType[]
): StakingReport | null => {
    const createStakingFields = (
        inputToken?: EventToken,
        outputToken?: EventToken
    ): StakingReport => ({
        action: decodedEvent.action,
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
        depositor:
            decodedEvent.details.find((d) => d.heading === "Depositor")
                ?.value ?? "",
    });

    const createWithdrawalFields = (
        inputToken?: EventToken
    ): StakingReport => ({
        action: decodedEvent.action,
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
        depositor:
            decodedEvent.details.find((d) => d.heading === "Depositor")
                ?.value ?? "",
    });

    if (decodedEvent.protocol?.name === "Renzo") {
        const tokens = decodedEvent.tokens;
        let inputToken = tokens?.find((d) => d.heading === "Deposit Amount");
        const outputToken = tokens?.find((d) => d.heading === "ezETH Minted");

        // Refine filtering logic to ensure only desired events are considered
        const relevantEvent = allEvents?.find(
            (event) =>
                event.category === DECODED_EVENT_CATEGORY.TOKEN &&
                decodedEvent.action !== DECODED_ACTION.TRANSFERRED &&
                event.tokens?.[0]?.address?.toLowerCase() ===
                    inputToken?.address?.toLowerCase()
        );
        if (relevantEvent) {
            inputToken = relevantEvent?.tokens?.[0];
        }

        if (inputToken || outputToken) {
            switch (decodedEvent.action) {
                case DECODED_ACTION.DEPOSIT:
                case DECODED_ACTION.WITHDRAW:
                    return createStakingFields(inputToken, outputToken);
                default:
                    return null;
            }
        } else {
            return null;
        }
    } else if (decodedEvent.protocol?.name === "Lido") {
        if (decodedEvent.action === DECODED_ACTION.DEPOSIT) {
            const tokens = decodedEvent.tokens;
            let inputToken = tokens?.find(
                (d) => d.heading === "Deposit Amount"
            );

            // find the address of the st-token
            const event = allEvents.find((e) => e.name === "Transfer Shares");
            const outputToken_address = event?.details?.find(
                (d) => d.heading === "Token Address"
            )?.value;
            // search transfer made for the st-token
            const outputEvent = allEvents.find(
                (e) =>
                    e.tokens?.[0].address?.toLowerCase() ===
                    outputToken_address?.toLowerCase()
            );
            let outputToken = outputEvent?.tokens?.[0];
            // use that value to give value to output token
            if (inputToken || outputToken) {
                return createStakingFields(inputToken, outputToken);
            } else {
                return null;
            }
        } else if (decodedEvent.action === DECODED_ACTION.WITHDRAW) {
            const tokens = decodedEvent.tokens;
            let inputToken = tokens?.find((d) => d.heading === "WithdrawToken");
            // use that value to give value to output token
            if (inputToken) {
                return createWithdrawalFields(inputToken);
            } else {
                return null;
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
};
