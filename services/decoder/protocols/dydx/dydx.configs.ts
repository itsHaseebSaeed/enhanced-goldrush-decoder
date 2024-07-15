import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        protocol_name: "dydx",
        address: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e", //Solo margin contract
        is_factory: false,
        chain_name: "eth-mainnet",
    },

    {
        protocol_name: "dydx",
        address: "0xD54f502e184B6B739d7D27a6410a67dc462D69c8", //Perpctual smart contract
        is_factory: false,
        chain_name: "eth-mainnet",
    },
];

export default configs;
