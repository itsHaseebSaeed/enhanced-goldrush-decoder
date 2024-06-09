import { GoldRushDecoder } from "../../services";
import {
    CovalentClient,
    type Chain,
    type Transaction,
} from "@covalenthq/client-sdk";
import { type QueryOptions } from "../../services/decoder/decoder.types";

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

        if (!data?.items || data.items.length < 100) {
            break;
        }

        allTransactions = [...allTransactions, ...data.items];
        page++;
    }

    return allTransactions;
};
