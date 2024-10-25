export function calculateMarginMetrics(txns) {
  const marginMetrics = {
    Borrow: {
      totalBorrowValue: 0,
      numberOfReservesUsed: new Set(),
    },
    Repay: {
      totalRepayValue: 0,
      numberOfReservesUsed: new Set(),
    },
  };

  let totalMarginValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.margin_details) {
      txn.categorization.margin_details.forEach((margin) => {
        const action = margin.action;
        const valueUsd = margin.token_usd_quote || 0;

        totalMarginValueUsd += valueUsd;

        switch (action) {
          case "Borrow":
            marginMetrics.Borrow.totalBorrowValue += valueUsd;
            marginMetrics.Borrow.numberOfReservesUsed.add(margin.token_address);
            break;
          case "Repay":
            marginMetrics.Repay.totalRepayValue += valueUsd;
            marginMetrics.Repay.numberOfReservesUsed.add(margin.token_address);
            break;
        }
      });
    }
  });

  // Convert unique values from Set to count
  Object.keys(marginMetrics).forEach((event) => {
    if (marginMetrics[event].numberOfReservesUsed) {
      marginMetrics[event].numberOfReservesUsed =
        marginMetrics[event].numberOfReservesUsed.size;
    }
  });

  return {
    totalMarginValueUsd,
    ...marginMetrics,
  };
}
