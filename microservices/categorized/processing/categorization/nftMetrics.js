export function calculateNftMetrics(txns) {
  const nftSalesMetrics = {
    Marketplace: {
      numberOfListingsCreated: 0,
      totalValueOfListings: 0,
      uniqueMarketplaces: new Set(),
      salesConversionRate: 0,
    },
    Sales: {
      numberOfSales: 0,
      uniqueCollections: new Set(),
      totalSales: 0,
      uniqueProtocols: new Set(),
    },
  };

  let totalListings = 0;
  let totalSales = 0;

  txns.forEach((txn) => {
    if (txn.categorization.nft_sale_details) {
      txn.categorization.nft_sale_details.forEach((nftSale) => {
        const valueUsd = nftSale.nft_token_price_usd || 0;
        const protocol = nftSale.protocol?.name || "";
        const collectionAddress = nftSale.collection_address || "";

        if (nftSale.action === "Sale") {
          nftSalesMetrics.Sales.numberOfSales += 1;
          nftSalesMetrics.Sales.totalSales += valueUsd;
          nftSalesMetrics.Sales.uniqueCollections.add(collectionAddress);
          nftSalesMetrics.Sales.uniqueProtocols.add(protocol);
          totalSales += 1;
        }
      });
    }
  });

  // Calculate sales conversion rate
  if (totalListings > 0) {
    nftSalesMetrics.Marketplace.salesConversionRate =
      (totalSales / totalListings) * 100;
  }

  // Convert unique values from Set to count
  nftSalesMetrics.Marketplace.uniqueMarketplaces =
    nftSalesMetrics.Marketplace.uniqueMarketplaces.size;
  nftSalesMetrics.Sales.uniqueCollections =
    nftSalesMetrics.Sales.uniqueCollections.size;
  nftSalesMetrics.Sales.uniqueProtocols =
    nftSalesMetrics.Sales.uniqueProtocols.size;

  return nftSalesMetrics;
}
