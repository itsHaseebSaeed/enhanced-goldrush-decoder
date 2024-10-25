export function calculateDexMetrics(txns) {
    const dexMetrics = {
        Swap: {
            totalSwapVolume: 0,
            totalCount: 0,
            uniqueTradingPairs: new Set(),
            slippage: 0,
            uniqueTokens: new Set(),
            totalAggregatorSwapVolume: 0,
            numberOfAggregatorSwaps: 0,
            uniqueAggregators: new Set(),
        },
        Add_liq: {
            totalValueLocked: 0,
            totalCount: 0,
            uniqueTokens: new Set(),
        },
        Remove_liq: {
            totalValueLocked: 0,
            totalCount: 0,
            uniqueTokens: new Set(),
        },
        Collect: {
            totalValueLocked: 0,
            totalCount: 0,
            uniquePools: new Set(),
            uniqueTokens: new Set(),
        },
        Mint: {
            totalValueLocked: 0,
            totalCount: 0,
            uniquePools: new Set(),
            uniqueTokens: new Set(),
        },
        Burn: {
            totalValueLocked: 0,
            totalCount: 0,
            uniquePools: new Set(),
            uniqueTokens: new Set(),
        },
        Flash: {
            totalValueLoaned: 0,
            totalCount: 0,
            uniquePools: new Set(),
            uniqueTokens: new Set(),
            totalValuePaid: 0,
            totalInterestPaid: 0,
        },
    };

    let totalDexValueUsd = 0;

    txns.forEach((txn) => {
        if (txn.categorization.dex_details) {
            txn.categorization.dex_details.forEach((dex) => {
                const action = dex.action;

                const protocol = dex.protocol_name;
                const token0UsdQuote =
                    (dex.token_0_usd_quote || 0) < 0
                        ? dex.token_0_usd_quote * -1
                        : dex.token_0_usd_quote;
                const token1UsdQuote = dex.token_1_usd_quote || 0;
                const txnValue = token0UsdQuote + token1UsdQuote;

                totalDexValueUsd += txnValue;

                const updateMetrics = (metricCategory, value) => {
                    if (!dexMetrics[metricCategory]) {
                        dexMetrics[metricCategory] = {
                            uniqueProtocols: new Set(),
                            totalTxnValueUsd: 0,
                            totalCount: 0,
                        };
                    }
                    dexMetrics[metricCategory].uniqueProtocols.add(protocol);
                    dexMetrics[metricCategory].totalTxnValueUsd += value;
                    dexMetrics[metricCategory].totalCount += 1;
                };

                switch (action) {
                    case "Swapped":
                        dexMetrics.Swap.totalSwapVolume += token0UsdQuote; //Token 0 is input token
                        dexMetrics.Swap.totalCount += 1;

                        dexMetrics.Swap.slippage +=
                            token0UsdQuote - token1UsdQuote;
                        dexMetrics.Swap.uniqueTradingPairs.add(
                            `${dex.token_0_address}-${dex.token_1_address}`
                        );
                        dexMetrics.Swap.uniqueTokens
                            .add(dex.token_0_address)
                            .add(dex.token_1_address);

                        if (dex.aggregator_address) {
                            dexMetrics.Swap.numberOfAggregatorSwaps += 1;
                            dexMetrics.Swap.totalAggregatorSwapVolume +=
                                token0UsdQuote;
                            dexMetrics.Swap.uniqueAggregators.add(
                                dex.aggregator_address
                            );
                        }

                        break;
                    case "Add Liquidity":
                        dexMetrics.Add_liq.totalValueLocked += txnValue;
                        dexMetrics.Add_liq.uniqueTokens
                            .add(dex.token_0_address)
                            .add(dex.token_1_address);
                        dexMetrics.Add_liq.totalCount += 1;
                        break;
                    case "Remove Liquidity":
                        dexMetrics.Remove_liq.totalValueLocked += txnValue;
                        dexMetrics.Remove_liq.uniqueTokens
                            .add(dex.token_0_address)
                            .add(dex.token_1_address);
                        dexMetrics.Remove_liq.totalCount += 1;

                        break;
                    case "Collect":
                        dexMetrics.Collect.totalValueLocked += txnValue;
                        dexMetrics.Collect.uniquePools.add(dex.pair_address);
                        dexMetrics.Collect.yieldEarnedFromLP +=
                            dex.yield_earned_usd;
                        dexMetrics.Collect.totalCount += 1;

                        break;
                    case "Mint":
                        dexMetrics.Mint.totalValueLocked += txnValue;
                        dexMetrics.Mint.uniquePools.add(dex.pair_address);
                        dexMetrics.Mint.uniqueTokens
                            .add(dex.token_0_address)
                            .add(dex.token_1_address);
                        dexMetrics.Mint.totalCount += 1;

                        break;
                    case "Burn":
                        dexMetrics.Burn.totalValueLocked += txnValue;
                        dexMetrics.Burn.uniquePools.add(dex.pair_address);
                        dexMetrics.Burn.uniqueTokens
                            .add(dex.token_0_address)
                            .add(dex.token_1_address);
                        dexMetrics.Burn.totalCount += 1;

                        break;
                    case "Flashloan":
                        dexMetrics.Flash.totalValueLoaned += txnValue;
                        dexMetrics.Flash.uniquePools.add(dex.pair_address);
                        dexMetrics.Flash.totalValuePaid +=
                            token1UsdQuote - token0UsdQuote;
                        dexMetrics.Flash.totalInterestPaid +=
                            dex.interest_paid_usd;
                        dexMetrics.Flash.totalCount += 1;
                        break;
                    default:
                        updateMetrics(action, txnValue);
                }
            });
        }
    });

    // Convert unique values from Set to count and remove zero values
    Object.keys(dexMetrics).forEach((event) => {
        if (dexMetrics[event].uniquePools) {
            dexMetrics[event].uniquePools = dexMetrics[event].uniquePools.size;
        }
        if (dexMetrics[event].uniqueTokens) {
            dexMetrics[event].uniqueTokens =
                dexMetrics[event].uniqueTokens.size;
        }
        if (dexMetrics[event].uniqueTradingPairs) {
            dexMetrics[event].uniqueTradingPairs =
                dexMetrics[event].uniqueTradingPairs.size;
        }
        if (dexMetrics[event].uniqueAggregators) {
            dexMetrics[event].uniqueAggregators =
                dexMetrics[event].uniqueAggregators.size;
        }
    });

    const result = {
        totalDexValueUsd,
        ...dexMetrics,
    };

    return result;
}
