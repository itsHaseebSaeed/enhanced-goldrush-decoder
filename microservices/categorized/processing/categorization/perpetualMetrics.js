export function calculatePerpetualMetrics(txns) {
  const perpetualMetrics = {
    Deposit: {
      totalPerpetualTradingVolume: 0,
      totalUniqueTokensTraded: new Set(),
      totalUniqueProtocolsTradedWith: new Set(),
      totalCount: 0,
    },
    Withdraw: {
      totalPerpetualTradingVolume: 0,
      totalCount: 0,
    },
  };

  let totalPerpetualValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.perpetual_details) {
      txn.categorization.perpetual_details.forEach((perpetual) => {
        const action = perpetual.action;
        const valueUsd = perpetual.token_usd_quote || 0;

        totalPerpetualValueUsd += valueUsd;

        switch (action) {
          case "Deposit":
            perpetualMetrics.Deposit.totalPerpetualTradingVolume += valueUsd;
            perpetualMetrics.Deposit.totalUniqueTokensTraded.add(
              perpetual.token_address
            );
            perpetualMetrics.Deposit.totalUniqueProtocolsTradedWith.add(
              perpetual.protocol?.name
            );
            perpetualMetrics.Deposit.totalCount += 1;
            break;
          case "Withdraw":
            perpetualMetrics.Withdraw.totalPerpetualTradingVolume += valueUsd;
            perpetualMetrics.Withdraw.totalCount += 1;
            break;
        }
      });
    }
  });

  // Convert unique values from Set to count
  Object.keys(perpetualMetrics).forEach((event) => {
    if (perpetualMetrics[event].totalUniqueTokensTraded) {
      perpetualMetrics[event].totalUniqueTokensTraded =
        perpetualMetrics[event].totalUniqueTokensTraded.size;
    }
    if (perpetualMetrics[event].totalUniqueProtocolsTradedWith) {
      perpetualMetrics[event].totalUniqueProtocolsTradedWith =
        perpetualMetrics[event].totalUniqueProtocolsTradedWith.size;
    }
  });

  return {
    totalPerpetualValueUsd,
    ...perpetualMetrics,
  };
}
