import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        address: "0x1f98431c8ad98523631ae4a59f267346ea31f984",//Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xe592427a0aece92de3edee1f18e0157c05861564", //Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },

    {
        address: "0x881D40237659C251811CEC9c364ef91dC08D300C", //MetaMask Swap Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x1111111254EEB25477B68fb85Ed929f73A960582", //1-inch Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88", //Uniswap V3 Position NFT
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xc36442b4a4522e871399cd717abdd847ab11fe88",
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
];

export default configs;
