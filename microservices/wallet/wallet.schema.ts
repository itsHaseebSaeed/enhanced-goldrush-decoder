import { Chains } from "@covalenthq/client-sdk";
import * as yup from "yup";

export const decodeWalletBodySchema = yup.object({
    chain_name: yup
        .mixed()
        .oneOf(Object.values(Chains), "chain_name is incorrect")
        .required("chain_name is required"),
    wallet_address: yup.string().trim().required("wallet_address is required"),
});

export type DecodeWalletRequest = yup.InferType<typeof decodeWalletBodySchema>;

export const decodeWalletHeadersSchema = yup.object({
    "x-covalent-api-key": yup
        .string()
        .trim()
        .required("x-covalent-api-key is required"),
});

export type DecodeWalletHeaders = yup.InferType<typeof decodeWalletHeadersSchema>;

export const decodeWalletQuerySchema = yup.object({
    raw_logs: yup.string().oneOf(["false", "true"]),
    min_usd: yup.number().min(0),
});

export type DecodeWalletQuery = yup.InferType<typeof decodeWalletQuerySchema>;
