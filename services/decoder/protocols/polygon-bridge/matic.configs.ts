import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        address: "0xa0c68c638235ee32657e8f720a23cec1bfc77c77", // Polygon Bridge contract address
        is_factory: false,
        protocol_name: "matic-eth-bridge",
        chain_name: "eth-mainnet",
    },
    {
        address: "0x37D26DC2890b35924b40574BAc10552794771997", // Polygon Bridge contract address
        is_factory: false,
        protocol_name: "matic-eth-bridge",
        chain_name: "matic-mainnet",
    },
    {
        address: "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf", // Polygon erc20 Bridge contract address
        is_factory: false,
        protocol_name: "matic-eth-bridge",
        chain_name: "eth-mainnet",
    },

    {
        address: "0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30", // Polygon Bridge contract address
        is_factory: false,
        protocol_name: "matic-eth-bridge",
        chain_name: "eth-mainnet",
    },
    // Add other configurations if necessary
];

export default configs;