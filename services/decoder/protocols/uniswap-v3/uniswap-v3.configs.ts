import { type Configs } from "../../decoder.types";

const configs: Configs = [
    {
        address: "0x1f98431c8ad98523631ae4a59f267346ea31f984", //Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "eth-mainnet",
    },
    {
        address: "0xe592427a0aece92de3edee1f18e0157c05861564", //General Router
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
    {
        address: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "avalanche-mainnet",
    },
    {
        address: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE", // Swap Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "avalanche-mainnet",
    },
    {
        address: "0x4Dae2f939ACf50408e13d58534Ff8c2776d45265", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "avalanche-mainnet",
    },
    {
        address: "0x655C406EBFa14EE2006250925e54ec43AD184f8B", // Uniswap V3 Position NFT
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "avalanche-mainnet",
    },
    {
        address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "arbitrum-mainnet",
    },

    {
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Swap Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "arbitrum-mainnet",
    },

    {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "arbitrum-mainnet",
    },
    {
        address: "0x4Dae2f939ACf50408e13d58534Ff8c2776d45265", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "arbitrum-mainnet",
    },
    {
        address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88", // nft
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "arbitrum-mainnet",
    },

    {
        address: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "bsc-mainnet",
    },
    {
        address: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "bsc-mainnet",
    },
    {
        address: "0x4Dae2f939ACf50408e13d58534Ff8c2776d45265", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "bsc-mainnet",
    },
    {
        address: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "base-mainnet",
    },
    {
        address: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613", // Nft
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "base-mainnet",
    },
    {
        address: "0x2626664c2603336E57B271c5C0b26F421741e481", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "base-mainnet",
    },
    {
        address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "base-mainnet",
    },
    {
        address: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1", // Nft
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "base-mainnet",
    },

    {
        address: "0xAfE208a311B21f13EF87E33A90049fC17A7acDEc", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "celo-mainnet",
    },
    {
        address: "0x5615CDAb10dc425a742d643d949a7F474C01abc4", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "celo-mainnet",
    },
    {
        address: "0x643770E279d5D0733F21d6DC03A8efbABf3255B4", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "celo-mainnet",
    },
    {
        address: "0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A", // Nonfungible Position Manager
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "celo-mainnet",
    },
    {
        address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "optimism-mainnet",
    },
    {
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Swap Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "optimism-mainnet",
    },
    {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "optimism-mainnet",
    },
    {
        address: "0xCb1355ff08Ab38bBCE60111F1bb2B784bE25D7e8", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "optimism-mainnet",
    },
    {
        address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88", // Nonfungible Position Manager
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "optimism-mainnet",
    },
    {
        address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "matic-mainnet",
    },
    {
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Swap Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "matic-mainnet",
    },
    {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "matic-mainnet",
    },
    {
        address: "0xec7BE89e9d109e7e3Fec59c222CF297125FEFda2", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "matic-mainnet",
    },
    {
        address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88", // Nonfungible Position Manager
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "matic-mainnet",
    },
    {
        address: "0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "zksync-mainnet",
    },
    {
        address: "0x99c56385daBCE3E81d8499d0b8d0257aBC07E8A3", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zksync-mainnet",
    },
    {
        address: "0x28731BCC616B5f51dD52CF2e4dF0E78dD1136C06", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zksync-mainnet",
    },
    {
        address: "0x0616e5762c1E7Dc3723c50663dF10a162D690a86", // Nonfungible Position Manager
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zksync-mainnet",
    },
    {
        address: "0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb", // Factory
        is_factory: true,
        protocol_name: "uniswap-v3",
        chain_name: "zora-mainnet",
    },
    {
        address: "0x7De04c96BE5159c3b5CeffC82aa176dc81281557", // Swap Router 02
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zora-mainnet",
    },
    {
        address: "0x2986d9721A49838ab4297b695858aF7F17f38014", // General Router
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zora-mainnet",
    },
    {
        address: "0xbC91e8DfA3fF18De43853372A3d7dfe585137D78", // Nonfungible Position Manager
        is_factory: false,
        protocol_name: "uniswap-v3",
        chain_name: "zora-mainnet",
    },
];

export default configs;
