export function calculateLendingMetrics(txns) {
  const lendingMetrics = {
    Borrow: {
      totalValue: 0,
      averageInterestRate: 0,
      numberOfReservesUsed: new Set(),
      interestRateMode: new Set(),
      totalCount: 0,
    },
    Repay: {
      totalValue: 0,
      numberOfReserves: new Set(),
      totalCount: 0,
    },
    Flashloan: {
      totalValue: 0,
      numberOfAssetsBorrowed: new Set(),
      interestRateMode: new Set(),
      totalPremiumPaid: 0,
      numberOfTargets: new Set(),
      totalCount: 0,
    },
    Supply: {
      totalValue: 0,
      numberOfReserves: new Set(),
      totalCount: 0,
    },
    Withdraw: {
      totalValue: 0,
      numberOfReserves: new Set(),
      totalCount: 0,
    },
  };

  let totalLendingValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.lending_details) {
      txn.categorization.lending_details.forEach((lend) => {
        const action = lend.action;
        const valueUsd = lend.reserve_usd_value || 0;

        totalLendingValueUsd += valueUsd;

        switch (action) {
          case "Borrow":
            lendingMetrics.Borrow.totalValue += valueUsd;
            lendingMetrics.Borrow.numberOfReservesUsed.add(
              lend.reserve_address
            );
            lendingMetrics.Borrow.interestRateMode.add(lend.borrow_rate_mode);
            lendingMetrics.Borrow.totalCount += 1;
            lendingMetrics.Borrow.averageInterestRate += lend.borrow_rate || 0;
            break;
          case "Repay":
            lendingMetrics.Repay.totalValue += valueUsd;
            lendingMetrics.Repay.numberOfReserves.add(lend.reserve_address);
            lendingMetrics.Repay.totalCount += 1;
            break;
          case "Flashloan":
            lendingMetrics.Flashloan.totalValue += valueUsd;
            lendingMetrics.Flashloan.numberOfAssetsBorrowed.add(
              lend.reserve_address
            );
            lendingMetrics.Flashloan.interestRateMode.add(
              lend.borrow_rate_mode
            );
            lendingMetrics.Flashloan.totalPremiumPaid +=
              lend.premium_usd_quote || 0;
            lendingMetrics.Flashloan.numberOfTargets.add(lend.target_address);
            lendingMetrics.Flashloan.totalCount += 1;
            break;
          case "Supply":
            lendingMetrics.Supply.totalValue += valueUsd;
            lendingMetrics.Supply.numberOfReserves.add(lend.reserve_address);
            lendingMetrics.Supply.totalCount += 1;
            break;
          case "Withdraw":
            lendingMetrics.Withdraw.totalValue += valueUsd;
            lendingMetrics.Withdraw.numberOfReserves.add(lend.reserve_address);
            lendingMetrics.Withdraw.totalCount += 1;
            break;
        }
      });
    }
  });

  // Convert unique values from Set to count
  Object.keys(lendingMetrics).forEach((event) => {
    if (lendingMetrics[event].numberOfReserves) {
      lendingMetrics[event].numberOfReserves =
        lendingMetrics[event].numberOfReserves.size;
    }
    if (lendingMetrics[event].numberOfReservesUsed) {
      lendingMetrics[event].numberOfReservesUsed =
        lendingMetrics[event].numberOfReservesUsed.size;
    }
    if (lendingMetrics[event].interestRateMode) {
      lendingMetrics[event].interestRateMode =
        lendingMetrics[event].interestRateMode.size;
    }
    if (lendingMetrics[event].numberOfAssetsBorrowed) {
      lendingMetrics[event].numberOfAssetsBorrowed =
        lendingMetrics[event].numberOfAssetsBorrowed.size;
    }
    if (lendingMetrics[event].numberOfTargets) {
      lendingMetrics[event].numberOfTargets =
        lendingMetrics[event].numberOfTargets.size;
    }
  });

  // Calculate the average interest rate for Borrow events
  if (lendingMetrics.Borrow.totalCount > 0) {
    lendingMetrics.Borrow.averageInterestRate /=
      lendingMetrics.Borrow.totalCount;
  }

  return {
    totalLendingValueUsd,
    ...lendingMetrics,
  };
}
