import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        address: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f", //Factory
        is_factory: true,
        protocol_name: "uniswap-v2",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a", //Router
        is_factory: false,
        protocol_name: "uniswap-v2",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x881D40237659C251811CEC9c364ef91dC08D300C", //MetaMask Swap Router
        is_factory: false,
        protocol_name: "uniswap-v2",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", //Universal Router
        is_factory: false,
        protocol_name: "uniswap-v2",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x794c07912474351b3134e6d6b3b7b3b4a07cbaaa",
        is_factory: true,
        protocol_name: "uniswap-v2",
        chain_name: "defi-kingdoms-mainnet",
    },

    
];

export default configs;
