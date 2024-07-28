
## How Do These API Calls Work?

The custom API for transaction decoding is built on top of the Covalent GoldRush Decoder, which leverages the Covalent API to fetch transaction data and decode event logs. In cases where the Covalent API is not sufficient, the Infura API is used, especially for DEX-related data. Here’s an overview of how the API call flow works:

### API Call Flow

1. **Custom API Call for Transactions**:
    - The custom API is called to fetch transactions for a wallet.
    - It uses the Covalent API to retrieve all transactions along with event logs for the provided wallet address.

2. **Event Logs Decoding**:
    - The event logs from the transactions are decoded using the GoldRushDecoder.
    - The logs are categorized into various types such as DEX, Aggregators, Margin Trading, etc., based on the contract address and event details.

### How the GoldRush Decoder Works

The GoldRush Decoder is designed to decode and categorize raw event logs from blockchain transactions into structured data. Here’s a breakdown of how it works:

#### Protocol-Level Decoding

1. **Protocols and Contracts**:
    - Each protocol can have one or multiple contract addresses.
    - A configuration maps protocols to their respective contract addresses and chain names.

2. **Event Matching**:
    - When a transaction emits an event, the GoldRush Decoder checks if the event’s “To” or “From” address matches any contract address associated with a protocol.
    - If a match is found, the protocol’s activity is identified, and the event name is matched against predefined event names for that protocol.

3. **Event Decoding**:
    - Each protocol has a decoder file containing the logic to decode specific events.
    - If the event name matches, the corresponding decoding function is invoked to decode the raw event log into a human-readable format.

#### Categorization

1. **Categorizing Events**:
    - Decoded events are categorized based on the protocol and event name.
    - Categories include DEX, Aggregators, Margin Trading, etc.

2. **Storing Categorized Events**:
    - Events are stored in their respective detail arrays, such as `dex_details`, `lending_details`, `staking_details`, etc.
    - Each detail array groups similar events together for easier access and analysis.

### Example Workflow

1. **Transaction Emission**:
    - A blockchain transaction emits an event.
    - The event log includes the “To” and “From” addresses, event name, and other relevant data.

2. **Address Matching**:
    - The GoldRush Decoder checks if the event’s addresses match any known protocol contract addresses.

3. **Event Decoding**:
    - If a match is found, the decoder function for the specific event is called.
    - The raw event log is decoded into structured data.

4. **Categorization**:
    - The decoded event is categorized based on its type and stored in the appropriate detail array.
    - For example, a DEX swap event would be stored in the `dex_details` array.

### Example Txns Structure

Here’s an example of how the decoded and categorized data might look:

```json
{
  "address": "0xeE9cf480031c4EA66C1E9a9637585d3bAb17A877",
  "totalTxnValueUsd": 0,
  "totalNativeValueUsd": 0,
  "totalGasValueUsd": 0,
  "totalCount": 0,
  "averageValue": 0,
  "dex": {
    "totalDexValueUsd": 0,
    "Swap": {
      "totalSwapVolume": 0,
      "totalCount": 0,
      "uniqueTradingPairs": 0,
      "slippage": 0,
      "uniqueTokens": 0,
      "totalAggregatorSwapVolume": 0,
      "numberOfAggregatorSwaps": 0,
      "uniqueAggregators": 0
    },
    "Add_liq": {
      "totalValueLocked": 0,
      "totalCount": 0,
      "uniqueTokens": 0
    },
    "Remove_liq": {
      "totalValueLocked": 0,
      "totalCount": 0,
      "uniqueTokens": 0
    }
  },
  "lend": {
    "totalLendingValueUsd": 0,
    "Borrow": {
      "totalValue": 0,
      "averageInterestRate": 0,
      "numberOfReservesUsed": 0,
      "interestRateMode": 0,
      "totalCount": 0
    },
    "Repay": {
      "totalValue": 0,
      "numberOfReserves": 0,
      "totalCount": 0
    }
  },
  ...
  ...
}
```

In this structure:
- The `dex` object contains details about DEX-related events, such as swaps and liquidity actions.
- The `lend` object contains details about lending-related events, such as borrow and repay actions.

This method ensures that all transactions and events are systematically decoded, categorized, and stored, providing a comprehensive overview of wallet activities across different protocols and categories.