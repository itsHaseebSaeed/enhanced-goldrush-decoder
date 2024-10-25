export function calculateMetaverseMetrics(txns) {
  const metaverseMetrics = {
    TokenTransfers: {
      totalValue: 0,
      numberOfTransactions: 0,
    },
    Sales: {
      numberOfSales: 0,
      uniqueCollections: new Set(),
      totalSales: 0,
      uniqueProtocols: new Set(),
    },
  };

  txns.forEach((txn) => {
    if (txn.categorization.metaverse_details) {
      txn.categorization.metaverse_details.forEach((metaverse) => {
        console.log(metaverse);
        const valueUsd = metaverse.token_usd_quote || 0;
        const protocol = metaverse.protocol?.name || "";

        if (metaverse.action === "Token") {
          metaverseMetrics.TokenTransfers.totalValue += valueUsd;
          metaverseMetrics.TokenTransfers.numberOfTransactions += 1;
        } else if (metaverse.action === "Nft") {
          metaverseMetrics.Sales.totalSales += valueUsd;
          metaverseMetrics.Sales.numberOfSales += 1;
          metaverseMetrics.Sales.uniqueCollections.add(metaverse.token_address);
          metaverseMetrics.Sales.uniqueProtocols.add(protocol);
        }
      });
    }
  });

  // Convert unique values from Set to count
  metaverseMetrics.Sales.uniqueCollections =
    metaverseMetrics.Sales.uniqueCollections.size;
  metaverseMetrics.Sales.uniqueProtocols =
    metaverseMetrics.Sales.uniqueProtocols.size;

  return metaverseMetrics;
}
