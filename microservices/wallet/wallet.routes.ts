
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
} from "./wallet.schema";
import { decodeLogsFromTx } from "../tx/tx.service";
import { categorize, fetchTxsFromWallet } from "./wallet.service";
import { Transaction, type Chain } from "@covalenthq/client-sdk";
import pLimit from "p-limit";
import ProgressBar from "progress";
import fs from "fs";
import path from "path";

export const walletRouter = Router();

// FOR PRODUCTION SO WALLET ANALYSIS DOESN'T STOP WITH ONE ERROR

// const handleDecodeProductionWallet = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const covalentApiKey = (req.headers as DecodeWalletHeaders)[
//             "x-covalent-api-key"
//         ];
//         const raw_logs =
//             (req.query as DecodeWalletQuery)["raw_logs"] === "true";
//         const min_usd = (req.query as DecodeWalletQuery)["min_usd"] ?? 0;
//         const { chain_name, wallet_address } = req.body as DecodeWalletRequest;
//         const transactions = await fetchTxsFromWallet(
//             chain_name as Chain,
//             wallet_address,
//             covalentApiKey
//         );

//         console.log(transactions.length);

//         const limit = pLimit(10);
//         const decodedEventsPromises = transactions.map((tx) =>
//             limit(async () => {
//                 try {
//                     const events = await decodeLogsFromTx(
//                         chain_name as Chain,
//                         tx,
//                         covalentApiKey,
//                         {
//                             raw_logs,
//                             min_usd,
//                         }
//                     );
//                     const cate = await categorize(events);

//                     const {
//                         block_hash,
//                         block_height,
//                         block_signed_at,
//                         explorers,
//                         tx_offset,
//                         miner_address,
//                         gas_metadata,
//                         to_address_label,
//                         from_address_label,
//                         log_events,
//                         safe_details,
//                         dex_details,
//                         nft_sale_details,
//                         lending_details,
//                         ...restMetadata
//                     } = tx;

//                     const parsedTx = JSON.parse(
//                         JSON.stringify(restMetadata, (_key, value) => {
//                             return typeof value === "bigint"
//                                 ? value.toString()
//                                 : value;
//                         })
//                     );

//                     return {
//                         ...parsedTx,
//                         categorization: cate,
//                     };
//                 } catch (err) {
//                     throw new Error(
//                         `Error processing transaction ${tx.tx_hash}: ${err}`
//                     );
//                 }
//             })
//         );

//         const results = await Promise.allSettled(decodedEventsPromises);

//         const errors = results.filter((result) => result.status === "rejected");
//         if (errors.length > 0) {
//             throw new Error(
//                 `Error processing transactions: ${errors.map((error) => (error as PromiseRejectedResult).reason).join(", ")}`
//             );
//         }

//         const decodedEvents = results
//             .filter((result) => result.status === "fulfilled")
//             .map((result) => (result as PromiseFulfilledResult<any>).value);

//         res.json({
//             success: true,
//             items: decodedEvents,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const handleDeveloperDecodeWallet = async (
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
        const transactionsFilePath = path.join(
            __dirname,
            `${wallet_address}_transactions.json`
        );

        let transactions: Transaction[];

        if (fs.existsSync(transactionsFilePath)) {
            const fileContent = fs.readFileSync(transactionsFilePath, "utf-8");
            transactions = JSON.parse(fileContent);
        } else {
            transactions = await fetchTxsFromWallet(
                chain_name as Chain,
                wallet_address,
                covalentApiKey
            );

            // Handle bigint before storing in file
            transactions = JSON.parse(
                JSON.stringify(transactions, (_key, value) => {
                    return typeof value === "bigint" ? value.toString() : value;
                })
            );
            fs.writeFileSync(
                transactionsFilePath,
                JSON.stringify(transactions, null, 2)
            );
        }

        let total = transactions.length;

        console.log();
        const progressBar = new ProgressBar(
            "Progress: [:bar]  :percent :total :etas",
            {
                complete: "-",
                incomplete: " ",
                width: 150,
                total: total,
            }
        );

        const limit = pLimit(20);

        // Function to process a single transaction
        const processTransaction = async (tx: Transaction) => {
            const events = await decodeLogsFromTx(
                chain_name as Chain,
                tx,
                covalentApiKey,
                {
                    raw_logs,
                    min_usd,
                }
            );
            const cate = await categorize(events);

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
                    return typeof value === "bigint" ? value.toString() : value;
                })
            );

            return {
                ...parsedTx,
                categorization: cate,
            };
        };
        let errorOccurred = false;

        const decodedEventsPromises = transactions.map((tx) =>
            limit(async () => {
                try {
                    let res = await processTransaction(tx);
                    progressBar.tick(); // Update the progress bar after processing each transaction
                    return res;
                } catch (err) {
                    throw new Error(
                        `Error processing transaction ${tx.tx_hash}: ${err}`
                    );
                }
            })
        );

        // Use Promise.all to fail fast
        const decodedEvents = await Promise.all(decodedEventsPromises);

        res.json({
            success: true,
            items: decodedEvents,
        });
    } catch (error) {
        next(error);
    }
};

walletRouter.post(
    "/decode",
    validateQuery("headers", decodeWalletHeadersSchema),
    validateQuery("query", decodeWalletQuerySchema),
    validateQuery("body", decodeWalletBodySchema),
    handleDeveloperDecodeWallet
);

