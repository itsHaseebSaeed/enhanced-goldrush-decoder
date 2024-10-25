export function calculateStakingMetrics(txns) {
  const stakingMetrics = {
    Deposit: {
      totalStakedValue: 0,
      totalUniqueTokensStaked: new Set(),
      totalUniqueProtocolsStakedWith: new Set(),
      totalNumberOfStakingMade: 0,
    },
    Withdraw: {
      totalWithdrawValue: 0,
      totalNumberOfWithdrawMade: 0,
    },
  };

  let totalStakingValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.staking_details) {
      txn.categorization.staking_details.forEach((stake) => {
        const action = stake.action;
        const valueUsd = stake.staked_asset_usd_quote || 0;

        totalStakingValueUsd += valueUsd;

        switch (action) {
          case "Deposit":
            stakingMetrics.Deposit.totalStakedValue += valueUsd;
            stakingMetrics.Deposit.totalUniqueTokensStaked.add(
              stake.staked_asset_address
            );
            stakingMetrics.Deposit.totalUniqueProtocolsStakedWith.add(
              stake.protocol?.name
            );
            stakingMetrics.Deposit.totalNumberOfStakingMade += 1;
            break;
          case "Withdraw":
            stakingMetrics.Withdraw.totalWithdrawValue += valueUsd;
            stakingMetrics.Withdraw.totalNumberOfWithdrawMade += 1;
            break;
        }
      });
    }
  });

  // Convert unique values from Set to count
  Object.keys(stakingMetrics).forEach((event) => {
    if (stakingMetrics[event].totalUniqueTokensStaked) {
      stakingMetrics[event].totalUniqueTokensStaked =
        stakingMetrics[event].totalUniqueTokensStaked.size;
    }
    if (stakingMetrics[event].totalUniqueProtocolsStakedWith) {
      stakingMetrics[event].totalUniqueProtocolsStakedWith =
        stakingMetrics[event].totalUniqueProtocolsStakedWith.size;
    }
  });

  // Calculate staking rewards earned percentage for Withdraw events
  if (stakingMetrics.Withdraw.totalNumberOfWithdrawMade > 0) {
    stakingMetrics.Withdraw.stakingRewardsEarned =
      (stakingMetrics.Withdraw.stakingRewardsEarned /
        stakingMetrics.Withdraw.totalWithdrawValue) *
      100;
  }

  return {
    totalStakingValueUsd,
    ...stakingMetrics,
  };
}
