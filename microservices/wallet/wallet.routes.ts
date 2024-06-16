import { Router, type Request, type Response, type NextFunction } from "express";
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
import { type Chain } from "@covalenthq/client-sdk";
import pLimit from "p-limit";

export const walletRouter = Router();

const handleDecodeWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const covalentApiKey = (req.headers as DecodeWalletHeaders)[
            "x-covalent-api-key"
        ];
        const raw_logs = (req.query as DecodeWalletQuery)["raw_logs"] === "true";
        const min_usd = (req.query as DecodeWalletQuery)["min_usd"] ?? 0;
        const { chain_name, wallet_address } = req.body as DecodeWalletRequest;
        const transactions = await fetchTxsFromWallet(
            chain_name as Chain,
            wallet_address,
            covalentApiKey
        );

        console.log(transactions.length);

        const limit = pLimit(25);
        const decodedEventsPromises = transactions.map(tx =>
            limit(async () => {
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
                // console.log(cate);

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
                    ...restMetadata
                } = tx;

                const parsedTx = JSON.parse(
                    JSON.stringify(restMetadata, (_key, value) => {
                        return typeof value === "bigint" ? value.toString() : value;
                    })
                );

                return {
                    tx_metadata: {
                        ...parsedTx,
                        dex_details: cate.dex_details.length ? cate.dex_details : [],
                        nft_sale_details: cate.nft_sale_details.length ? cate.nft_sale_details : [],
                        lending_details: cate.lending_details.length ? cate.lending_details : [],
                        transfer_details: cate.transfer_details.length ? cate.transfer_details : [],
                        nft_transfer_details: cate.nft_transfer_details.length ? cate.nft_transfer_details : [],

                    },
                };
            })
        );

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
    handleDecodeWallet
);
