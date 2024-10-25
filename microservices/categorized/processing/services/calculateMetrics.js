import { calculateDexMetrics } from "../categorization/dexMetrics.js";
import { calculateLendingMetrics } from "../categorization/lendingMetrics.js";
import { calculateStakingMetrics } from "../categorization/stakingMetrics.js";
import { calculatePerpetualMetrics } from "../categorization/perpetualMetrics.js";
import { calculateMarginMetrics } from "../categorization/marginMetrics.js";
import { calculateBridgingMetrics } from "../categorization/bridgingMetrics.js";
import { calculateVaultMetrics } from "../categorization/vaultsMetrics.js";
import { calculateSyntheticMetrics } from "../categorization/syntheticsMetrics.js";
import { calculateMetaverseMetrics } from "../categorization/metaverseMetrics.js";
import { calculateNftMetrics } from "../categorization/nftMetrics.js";

export function calculateMetricsForWallet(
  txns,
  address,
  currentBalance,
  currentNetworks
) {
  let totalTxnValueUsd = 0;
  let totalNativeValueUsd = 0;
  let totalGasValueUsd = 0;
  let totalCount = 0;

  txns.forEach((txn) => {
    const floorPrice = txn.value_quote || 0;
    totalTxnValueUsd += floorPrice;
    totalNativeValueUsd += floorPrice;
    const gasFloorPrice = txn.gas_quote || 0;
    totalGasValueUsd += gasFloorPrice;
    totalCount += 1;
  });

  const dexMetrics = calculateDexMetrics(txns);
  const lendingMetrics = calculateLendingMetrics(txns);
  const stakingMetrics = calculateStakingMetrics(txns);
  const prepMetrics = calculatePerpetualMetrics(txns);
  const marginMetrics = calculateMarginMetrics(txns);
  const bridgingMetrics = calculateBridgingMetrics(txns);
  const vaultMetrics = calculateVaultMetrics(txns);
  const syntheticMetrics = calculateSyntheticMetrics(txns);
  const metaverseMetrics = calculateMetaverseMetrics(txns);
  const nftMetrics = calculateNftMetrics(txns);

  totalTxnValueUsd += dexMetrics.totalDexValueUsd;
  totalTxnValueUsd += lendingMetrics.totalLendingValueUsd;
  totalTxnValueUsd += prepMetrics.totalPerpetualValueUsd;
  totalTxnValueUsd += marginMetrics.totalMarginValueUsd;
  totalTxnValueUsd += bridgingMetrics.totalBridgingValueUsd;
  totalTxnValueUsd += vaultMetrics.totalVaultValueUsd;
  totalTxnValueUsd += syntheticMetrics.totalSyntheticValueUsd;
  totalTxnValueUsd += stakingMetrics.totalStakingValueUsd;
  totalTxnValueUsd += nftMetrics.Sales.totalSales;

  const averageValue = totalCount > 0 ? totalTxnValueUsd / totalCount : 0;

  return {
    address,
    totalTxnValueUsd,
    totalNativeValueUsd,
    totalGasValueUsd,
    totalCount,
    averageValue,
    dex: dexMetrics,
    lend: lendingMetrics,
    stake: stakingMetrics,
    perpetual: prepMetrics,
    margin: marginMetrics,
    vault: vaultMetrics,
    synthetic: syntheticMetrics,
    metaverse: metaverseMetrics,
    nft: nftMetrics,
    bridge: bridgingMetrics,
    currentBalances: currentBalance,
    currentNetworks: currentNetworks,
  };
}
