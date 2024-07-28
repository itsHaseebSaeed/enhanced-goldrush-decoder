import {
    EventNFT,
    EventNFTs,
    EventToken,
    EventTokens,
    EventType,
    type QueryOptions,
} from "../../../services/decoder/decoder.types";
import { NftSalesReport } from "../transaction_service_types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../../services/decoder/decoder.constants";

export const mapNftSaleReport = (
    decodedEvent: EventType
): NftSalesReport[] | null => {
    const createFields = (
        nft: EventNFT,
        totalUsdValue: number
    ): NftSalesReport => ({
        action: decodedEvent.action,
        protocol: decodedEvent.protocol,
        to:
            decodedEvent.details.find((d) => d.heading == "Recipient")?.value ??
            "",
        from:
            decodedEvent.details.find((d) => d.heading == "Offerer")?.value ??
            "",
        token_id: nft.token_identifier ?? "",
        collection_address: nft.collection_address,
        collection_name: nft.collection_name ?? "",
        contract_quote_rate: 0,
        nft_token_price_usd: totalUsdValue,
    });

    // Ensure `decodedEvent.nfts` is always treated as an array
    const nfts: EventNFTs = Array.isArray(decodedEvent?.nfts)
        ? decodedEvent.nfts
        : decodedEvent?.nfts
          ? [decodedEvent.nfts]
          : [];

    // Ensure `decodedEvent.nfts` is always treated as an array
    const tokens: EventTokens = Array.isArray(decodedEvent?.tokens)
        ? decodedEvent.tokens
        : decodedEvent?.tokens
          ? [decodedEvent.tokens]
          : [];

    let total_usd_value: number = 0;

    tokens.map((token) => (total_usd_value += token?.usd_value ?? 0));

    // Map each NFT to an NftSalesReport
    const nftSalesReports: NftSalesReport[] = nfts.map((nft) =>
        createFields(nft, total_usd_value)
    );

    // Return the reports for the SALE action, otherwise return null
    return decodedEvent.action === DECODED_ACTION.SALE ? nftSalesReports : null;
};
