// import { writeProcessedData } from "../../utils.js";
import { calculateMetricsForWallet } from "./services/calculateMetrics.js";
import { cleanData } from "./services/cleanData.js";

import {
    calculateBalancesMetrics,
    calculateNetworkMetrics,
} from "./categorization/currentBalances.js";

/**
 * @param {any} data
 * @param {any} address
 */
export default async function processTxns(data, address) {
    if (!data) {
        console.error("Failed to read NFT data. Exiting.");
        return;
    }
    const currentBalance = await calculateBalancesMetrics(address);
    const currentNetworks = await calculateNetworkMetrics(address);

    const metricsPerWallet = calculateMetricsForWallet(
        data,
        address,
        currentBalance,
        currentNetworks
    );
    return cleanData(metricsPerWallet);
}
