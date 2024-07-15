import { GoldRushDecoder } from "../../services";
import {
    CovalentClient,
    type Chain,
    type Transaction,
} from "@covalenthq/client-sdk";
import {
    EventType,
    type QueryOptions,
} from "../../services/decoder/decoder.types";
import {
    CategorizedTransaction,
    DexReport,
    NftSalesReport,
    LendingReport,
    NftTransferReport,
    TransferReport,
} from "../categorization/transaction_service_types";
import {
    DECODED_ACTION,
    DECODED_EVENT_CATEGORY,
} from "../../services/decoder/decoder.constants";
import { mapDexEventToReport } from "../categorization/types/dex_details";
import { mapTransferEventToReport } from "../categorization/types/transfer_details";
import { mapStakingEventToReport } from "../categorization/types/staking_details";
import { mapPerpetualEventToReport } from "../categorization/types/perpetual_details";
import { mapMarginEventToReport } from "../categorization/types/margin_details";
import { mapValutEventToReport } from "../categorization/types/vault_details";
import { mapSyntheticEventToReport } from "../categorization/types/synthetic_details";
import { mapBridgingEventToReport } from "../categorization/types/bridging_details";
import { mapLendingEventToReport } from "../categorization/types/lending_details";

export const fetchTxsFromWallet = async (
    chain_name: Chain,
    walletAddress: string,
    covalentApiKey: string
): Promise<Transaction[]> => {
    const covalentClient = new CovalentClient(covalentApiKey);
    let page = 0;
    let allTransactions: Transaction[] = [];

    while (true) {
        const { data, error_code, error_message } =
            await covalentClient.TransactionService.getTransactionsForAddressV3(
                chain_name,
                walletAddress,
                page,
                {
                    noLogs: false,
                    quoteCurrency: "USD",
                    withSafe: false,
                }
            );
        if (error_code) {
            throw {
                errorCode: error_code,
                message: error_message,
            };
        }
        allTransactions = [...allTransactions, ...data.items];
        page++;

        if (!data?.items || data.items.length < 100) {
            break;
        }
    }
    return allTransactions;
};

export const categorize = async (
    events: EventType[]
): Promise<CategorizedTransaction> => {
    let cat: CategorizedTransaction = {
        dex_details: [],
        transfer_details: [],
        nft_transfer_details: [],
        nft_sale_details: [],
        lending_details: [],
        perpetual_details: [],
        margin_details: [],
        vault_details: [],
        staking_details: [],
        log_events: [],
        synthetic_details: [],
        bridging_details: [],
    };
    for (const event of events) {
        switch (event.category) {
            case DECODED_EVENT_CATEGORY.DEX:
                const dexReport = mapDexEventToReport(event);
                if (dexReport) {
                    cat.dex_details.push(dexReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.STAKING:
                const stakingReport = mapStakingEventToReport(event, events);
                if (stakingReport) {
                    cat.staking_details.push(stakingReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.PERPETUAL:
                const perpReport = mapPerpetualEventToReport(event);
                if (perpReport) {
                    cat.perpetual_details.push(perpReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.MARGIN:
                const marginReport = mapMarginEventToReport(event);
                if (marginReport) {
                    cat.margin_details.push(marginReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.VAULT:
                const vaultReport = mapValutEventToReport(event);
                if (vaultReport) {
                    cat.vault_details.push(vaultReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.SYNTHTIC:
                const syntheticReport = mapSyntheticEventToReport(event);
                if (syntheticReport) {
                    cat.synthetic_details.push(syntheticReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.BRIDGE:
                const bridgingReport = mapBridgingEventToReport(event, events);
                if (bridgingReport) {
                    cat.bridging_details.push(bridgingReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.TOKEN:
                const transferReport = mapTransferEventToReport(event);
                if (transferReport) {
                    if (isTransferReport(transferReport)) {
                        cat.transfer_details.push(transferReport);
                    } else if (isNftTransferReport(transferReport)) {
                        cat.nft_transfer_details.push(transferReport);
                    }
                }
                break;
            case DECODED_EVENT_CATEGORY.NFT:
                const nftReport = mapNftEventToReport(event);
                if (nftReport) {
                    cat.nft_sale_details.push(nftReport);
                }
                break;
            case DECODED_EVENT_CATEGORY.LENDING:
                const lendingReport = mapLendingEventToReport(event);
                if (lendingReport) {
                    cat.lending_details.push(lendingReport);
                }
                break;
            default:
                break;
        }
    }

    return cat;
};

// Example mapping function for NFT events
const mapNftEventToReport = (event: EventType): NftSalesReport | null => {
    // Your logic to map NFT event to NftSaleReport
    return null;
};

// Type guard for TransferReport
function isTransferReport(
    report: TransferReport | NftTransferReport
): report is TransferReport {
    return (report as TransferReport).token_num_decimals !== undefined;
}

// Type guard for NftTransferReport
function isNftTransferReport(
    report: TransferReport | NftTransferReport
): report is NftTransferReport {
    return (report as NftTransferReport).token_ids !== undefined;
}
