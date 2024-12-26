import { ethers } from "ethers";

const InfuraSupportedNetworks = [
      "mainnet",
      "linea-mainnet",
      "polygon-mainnet",
      "base-mainnet",
      "blast-mainnet",
      "optimism-mainnet",
      "arbitrum-mainnet",
      "palm-mainnet",
      "avalanche-mainnet",
      "starknet-mainnet",
      "celo-mainnet",
      "zksync-mainnet",
      "bsc-mainnet",
      "gas-api",
      "mantle-mainnet",
      "opbnb-mainnet",
      "scroll-mainnet"
];
  

export default async function  getInfuraProvider(network: string): Promise<ethers.InfuraProvider> {
      return(InfuraSupportedNetworks.includes(network)) ?
          new ethers.InfuraProvider(network, process.env.INFURA_API_KEY) :
          new ethers.InfuraProvider("mainnet", process.env.INFURA_API_KEY)
     
 }
 