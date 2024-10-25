export function calculateSyntheticMetrics(txns) {
  const syntheticMetrics = {
    Mint: {
      totalLockedValue: 0,
      totalAssetIssued: new Set(),
      totalUniqueProtocolsUsed: new Set(),
      totalNumberOfIssues: 0,
    },
    Burn: {
      totalBurnedValue: 0,
      totalAssetBurned: new Set(),
      totalUniqueProtocolsUsed: new Set(),
      totalNumberOfBurns: 0,
    },
  };

  let totalSyntheticValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.synthetic_details) {
      txn.categorization.synthetic_details.forEach((synthetic) => {
        const valueUsd = synthetic.token_usd_quote || 0;
        const protocol = synthetic.protocol?.name || "";
        totalSyntheticValueUsd += valueUsd;

        if (synthetic.action === "Mint") {
          syntheticMetrics.Mint.totalLockedValue += valueUsd;
          syntheticMetrics.Mint.totalAssetIssued.add(synthetic.token_address);
          syntheticMetrics.Mint.totalUniqueProtocolsUsed.add(protocol);
          syntheticMetrics.Mint.totalNumberOfIssues += 1;
        } else if (synthetic.action === "Burn") {
          syntheticMetrics.Burn.totalBurnedValue += valueUsd;
          syntheticMetrics.Burn.totalAssetBurned.add(synthetic.token_address);
          syntheticMetrics.Burn.totalUniqueProtocolsUsed.add(protocol);
          syntheticMetrics.Burn.totalNumberOfBurns += 1;
        }
      });
    }
  });

  // Convert unique values from Set to count
  syntheticMetrics.Mint.totalUniqueProtocolsUsed =
    syntheticMetrics.Mint.totalUniqueProtocolsUsed.size;

  syntheticMetrics.Mint.totalAssetIssued =
    syntheticMetrics.Mint.totalAssetIssued.size;
  syntheticMetrics.Burn.totalUniqueProtocolsUsed =
    syntheticMetrics.Burn.totalUniqueProtocolsUsed.size;

  syntheticMetrics.Burn.totalAssetBurned =
    syntheticMetrics.Burn.totalAssetBurned.size;

  return {
    totalSyntheticValueUsd,
    ...syntheticMetrics,
  };
}
