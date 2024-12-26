import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import { validateQuery } from "../../middlewares";
import {
    type DecodeWalletRequest,
    decodeWalletBodySchema,
    decodeWalletHeadersSchema,
    type DecodeWalletHeaders,
    decodeWalletQuerySchema,
    type DecodeWalletQuery,
} from "./categorized.schema";
import { decodeLogsFromTx } from "../tx/tx.service";
import { categorize, fetchTxsFromWallet } from "./categorized.service";
import { Transaction, type Chain } from "@covalenthq/client-sdk";
import pLimit from "p-limit";
import ProgressBar from "progress";
import fs from "fs";
import path from "path";
import { CovalentClient } from "@covalenthq/client-sdk";
import processTxns from "./processing/processing";
export const categorizedRouter = Router();

const handleDeveloperCategorizedWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const covalentApiKey = (req.headers as DecodeWalletHeaders)[
            "x-covalent-api-key"
        ];
        const raw_logs =
            (req.query as DecodeWalletQuery)["raw_logs"] === "true";
        const min_usd = (req.query as DecodeWalletQuery)["min_usd"] ?? 0;
        const { chain_name, wallet_address } = req.body as DecodeWalletRequest;

        let page = 0;
        const pageSize = 100;
        const limit = pLimit(100);
        let allDecodedEvents: any[] = [];
        // TODO remove this query
        const covalentClient = new CovalentClient(covalentApiKey);
        let total =
            await covalentClient.TransactionService.getTransactionSummary(
                chain_name as Chain,
                wallet_address
            );
            const fetchProgressBar = new ProgressBar("Fetched: :percent :total", {
                complete: "#",
                incomplete: " ",
                width: 150,
                total: total?.data?.items[0]?.total_count,
            }); // TODO remove this progress bar

        fetchProgressBar.tick(0); // Update the progress bar after processing each transaction // TODO remove this progress bar

        while (true) {
            const transactions = await fetchTxsFromWallet(
                chain_name as Chain,
                wallet_address,
                covalentApiKey,
                page
            );
            fetchProgressBar.tick(transactions.length);
            if (transactions.length === 0) {
                break;
            }

            let decodedCount = 0;

        const progressBar = new ProgressBar("Progressed: :percent :total", {
            complete: "#",
            incomplete: " ",
            width: 150,
            total: total?.data?.items[0]?.total_count,
        }); // TODO remove this progress bar
        progressBar.tick(0); // Update the progress bar after processing each transaction // TODO remove this progress bar


            const decodedEventsPromises = transactions.map((tx) =>
                limit(async () => {
                    try {
                        const events = await decodeLogsFromTx(
                            chain_name as Chain,
                            tx,
                            covalentApiKey,
                            {
                                raw_logs,
                                min_usd,
                            }
                        );
                        const categorizedEvents = await categorize(events);

                        const {
                            block_hash,
                            block_height,
                            block_signed_at,
                            explorers,
                            tx_offset,
                            miner_address,
                            gas_metadata,
                            to_address_label,
                            from_address_label,
                            log_events,
                            safe_details,
                            dex_details,
                            nft_sale_details,
                            lending_details,
                            ...restMetadata
                        } = tx;

                        const parsedTx = JSON.parse(
                            JSON.stringify(restMetadata, (_key, value) => {
                                return typeof value === "bigint"
                                    ? value.toString()
                                    : value;
                            })
                        );

                        decodedCount++;
                        progressBar.tick({
                            decodedCount,
                        });

                        return {
                            ...parsedTx,
                            categorization: categorizedEvents,
                        };
                    } catch (err) {
                        // TODO: find some way to log this error
                        return null;
                    }
                })
            );

            const results = await Promise.all(decodedEventsPromises);   
            const decodedEvents = results.filter((result) => result !== null);
            allDecodedEvents = allDecodedEvents.concat(decodedEvents);

            page++;
            if (transactions.length < pageSize) {
                break;
            }
        }

        let final_categorization = await processTxns(
            allDecodedEvents,
            wallet_address
        );

        res.json({
            success: true,
            items: final_categorization,
        });
    } catch (error) {
        next(error);
    }
};

categorizedRouter.post(
    "/decode",
    validateQuery("headers", decodeWalletHeadersSchema),
    validateQuery("query", decodeWalletQuerySchema),
    validateQuery("body", decodeWalletBodySchema),
    handleDeveloperCategorizedWallet
);
