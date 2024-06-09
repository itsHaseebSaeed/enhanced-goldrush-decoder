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
  import { fetchTxsFromWallet } from "./wallet.service";
  import { type Chain } from "@covalenthq/client-sdk";
  
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
  
          const decodedEvents = [];
          for (const tx of transactions) {
              const {
                  log_events,
                  dex_details,
                  nft_sale_details,
                  lending_details,
                  safe_details,
                  ...tx_metadata
              } = tx;
              const events = await decodeLogsFromTx(
                  chain_name as Chain,
                  tx,
                  covalentApiKey,
                  {
                      raw_logs,
                      min_usd,
                  }
              );
                
                
                const { block_hash,block_height,block_signed_at,explorers, tx_offset,miner_address,gas_metadata,to_address_label,from_address_label, ...restMetadata } = tx_metadata;  
                
                
              const parsedTx = JSON.parse(
                  JSON.stringify(restMetadata, (_key, value) => {
                      return typeof value === "bigint" ? value.toString() : value;
                  })
              );
                decodedEvents.push({
                  tx_metadata: parsedTx,
                  events,
              });
          }
          res.json({
              success: true,
              transactions: decodedEvents,
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
  