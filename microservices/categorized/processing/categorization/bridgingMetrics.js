export function calculateBridgingMetrics(txns) {
  const bridgingMetrics = {
    totalBridgedValue: 0,
    totalNumberOfTransactions: 0,
    totalTokensBridged: new Set(),
    totalChainsUsed: new Set(),
  };

  let totalBridgingValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.bridging_details) {
      txn.categorization.bridging_details.forEach((bridge) => {
        const valueUsd = bridge.token_usd_quote || 0;

        totalBridgingValueUsd += valueUsd;

        bridgingMetrics.totalBridgedValue += valueUsd;
        bridgingMetrics.totalNumberOfTransactions += 1;
        bridgingMetrics.totalTokensBridged.add(bridge.token_address);
        bridgingMetrics.totalChainsUsed.add(bridge.from_chain);
        bridgingMetrics.totalChainsUsed.add(bridge.to_chain);
      });
    }
  });

  // Convert unique values from Set to count
  bridgingMetrics.totalTokensBridged = bridgingMetrics.totalTokensBridged.size;
  bridgingMetrics.totalChainsUsed = bridgingMetrics.totalChainsUsed.size;

  return {
    totalBridgingValueUsd,
    ...bridgingMetrics,
  };
}
