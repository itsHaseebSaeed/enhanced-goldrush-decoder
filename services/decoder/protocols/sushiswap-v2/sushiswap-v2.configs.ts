import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        address: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac", //Factory
        is_factory: true,
        protocol_name: "sushiswap-v2",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", //Router
        is_factory: false,
        protocol_name: "sushiswap-v2",
        chain_name: "eth-mainnet",
    },
];



export default configs;