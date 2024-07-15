import { Chain } from "@covalenthq/client-sdk";

export type Aggregators = {
    protocol_name: string;
    chain_name: Chain;
    address: string;
}[];
const AGGREGATORS: Aggregators = [
    {
        address: "0x881D40237659C251811CEC9c364ef91dC08D300C", // MetaMask Swap Router
        protocol_name: "metamask swap router",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x1111111254EEB25477B68fb85Ed929f73A960582", // 1-inch Router
        protocol_name: "1-inch router",
        chain_name: "eth-mainnet",
    },
];

export default AGGREGATORS;
