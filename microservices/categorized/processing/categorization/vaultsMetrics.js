export function calculateVaultMetrics(txns) {
  const vaultMetrics = {
    Deposit: {
      totalLockedValue: 0,
      totalUniqueTokensLocked: new Set(),
      totalUniqueProtocolsLockedWith: new Set(),
      totalUniqueVaultsLockedWith: new Set(),
      totalNumberOfLockingsMade: 0,
    },
    Withdraw: {
      totalWithdrawValue: 0,
      totalNumberOfWithdrawMade: 0,
    },
  };

  let totalVaultValueUsd = 0;

  txns.forEach((txn) => {
    if (txn.categorization.vault_details) {
      txn.categorization.vault_details.forEach((vault) => {
        const valueUsd = vault.token_usd_quote || 0;
        const protocol = vault.protocol?.name || "";

        totalVaultValueUsd += valueUsd;

        if (vault.event === "Deposit") {
          vaultMetrics.Deposit.totalLockedValue += valueUsd;
          vaultMetrics.Deposit.totalUniqueTokensLocked.add(vault.token_address);
          vaultMetrics.Deposit.totalUniqueProtocolsLockedWith.add(protocol);
          vaultMetrics.Deposit.totalUniqueVaultsLockedWith.add(
            vault.vault_address
          );
          vaultMetrics.Deposit.totalNumberOfLockingsMade += 1;
        } else if (vault.event === "Withdraw") {
          vaultMetrics.Withdraw.totalWithdrawValue += valueUsd;
          vaultMetrics.Withdraw.totalNumberOfWithdrawMade += 1;
        }
      });
    }
  });

  // Convert unique values from Set to count
  vaultMetrics.Deposit.totalUniqueTokensLocked =
    vaultMetrics.Deposit.totalUniqueTokensLocked.size;
  vaultMetrics.Deposit.totalUniqueProtocolsLockedWith =
    vaultMetrics.Deposit.totalUniqueProtocolsLockedWith.size;
  vaultMetrics.Deposit.totalUniqueVaultsLockedWith =
    vaultMetrics.Deposit.totalUniqueVaultsLockedWith.size;

  return {
    totalVaultValueUsd,
    ...vaultMetrics,
  };
}
