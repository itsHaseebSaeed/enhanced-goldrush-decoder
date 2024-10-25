import { CovalentClient } from "@covalenthq/client-sdk";

export async function calculateBalancesMetrics(wallet_address) {
  const client = new CovalentClient("cqt_rQfCJ87bB4DMCcHxGwQDHMdpPfHT");
  const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
    "eth-mainnet",
    wallet_address,
    { nft: true }
  );

  const metrics = {
    tokens: {
      totalValueUsd: 0,
      totalCount: 0,
      averageValue: 0,
      uniqueTokens: new Set(),
    },
    nfts: {
      totalValueUsd: 0,
      totalCount: 0,
      averageValue: 0,
      uniqueTokens: new Set(),
      uniqueCollections: new Set(),
    },
  };

  if (!resp || !resp.data || !resp.data.items) {
    metrics.tokens.uniqueTokens = 0;
    metrics.nfts.uniqueTokens = 0;
    metrics.nfts.uniqueCollections = 0;
    return metrics;
  }

  const items = resp.data.items;

  items.forEach((item) => {
    const valueUsd = item.quote ?? 0;
    const type = item.type;

    if (type === "cryptocurrency") {
      metrics.tokens.totalValueUsd += valueUsd;
      metrics.tokens.totalCount += 1;
      metrics.tokens.uniqueTokens.add(item.contract_address);
    } else if (type === "nft" && item.nft_data) {
      metrics.nfts.totalValueUsd += valueUsd;
      metrics.nfts.totalCount += 1;
      metrics.nfts.uniqueTokens.add(item.contract_address);
      item.nft_data.forEach((nft) => {
        metrics.nfts.uniqueCollections.add(nft.collection_name);
      });
    }
  });

  if (metrics.tokens.totalCount > 0) {
    metrics.tokens.averageValue =
      metrics.tokens.totalValueUsd / metrics.tokens.totalCount;
  }
  if (metrics.nfts.totalCount > 0) {
    metrics.nfts.averageValue =
      metrics.nfts.totalValueUsd / metrics.nfts.totalCount;
  }

  metrics.tokens.uniqueTokens = metrics.tokens.uniqueTokens.size;
  metrics.nfts.uniqueTokens = metrics.nfts.uniqueTokens.size;
  metrics.nfts.uniqueCollections = metrics.nfts.uniqueCollections.size;

  return metrics;
}

export async function calculateNetworkMetrics(wallet_address) {
  const client = new CovalentClient("cqt_rQfCJ87bB4DMCcHxGwQDHMdpPfHT");
  const resp = await client.BaseService.getAddressActivity(wallet_address);

  const networkMetrics = {
    typesOfNetworks: new Set(),
    diversityOfNetworks: new Set(),
  };

  if (!resp || !resp.data || !resp.data.items) {
    networkMetrics.typesOfNetworks = 0;
    networkMetrics.diversityOfNetworks = 0;
    return networkMetrics;
  }

  const items = resp.data.items;

  items.forEach((item) => {
    networkMetrics.typesOfNetworks.add(item.name);
    networkMetrics.diversityOfNetworks.add(item.category_label);
  });

  networkMetrics.typesOfNetworks = networkMetrics.typesOfNetworks.size;
  networkMetrics.diversityOfNetworks = networkMetrics.diversityOfNetworks.size;

  return networkMetrics;
}
