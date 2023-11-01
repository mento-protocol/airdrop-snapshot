# Airgrab Snapshots

This repo will contain 3 snapshots as per the eligibility criteria provided in [#289](https://github.com/mento-protocol/mento-general/issues/289)

## 1. Locked CELO

TBD

## 2. cStables Volume

The total cStable volume (cUSD + cEUR + cREAL) across a 1-year timeframe.

Volume is defined as all cStable transfers **from** an address + all cStable transfers **to** an address

- [Dune Query that was used to export final snapshot CSV](https://dune.com/queries/3163689/5279843)
- [cStable Volume Snapshot](./src/snapshots/cstable-volume/cstable-volume-snapshot.csv)

### Calculation Method

- Take 1 snapshot of the total cStables volume per address over a 1-year timeframe from 15.11.2022 12:00 pm UTC to 15.10.2023 12:00 pm UTC
- Sum up volume across all cStables: `cUSD volume + cEUR volume + cREAL volume`
- Denominate volume in USD using the average exchange rate over 365 days between 15.11.2022 and 15.10.2023
- Filter out addresses with less than $10 of total volume

### Example

- Bob has sent 10 cUSD at day 1 of the snapshot period
- Bob received 5 cUSD at day 100 of the snapshot period
- Bob has send 10 cEUR at day 365 of the snapshot period
- The average cEUR/USD exchange rate over the 365 days snapshot period was 1.05
- Bob has a total volume of: 10 cUSD (spent) + 5 cUSD (received) + (10 cEUR * 1.05 exchange rate = 10.5 cUSD) = $25.5 total volume

## 3. cStables Balances

The average cStable balance (cUSD/cEUR/cREAL) denominated in USD across a 1-year timeframe.

- [cStable Balances Snapshot](./src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv)
- [Dune Query that was used to export 12 snapshot CSVs at different dates](https://dune.com/queries/3144937/5269961)

### Calculation Method

- Take 12 monthly snapshots, 1 per month from November 15 2022 to October 15 2023, of addresses who held any cStables on the date of the snapshot
- Minimum cUSD OR cEUR OR cREAL balance must have been > 10 to be included in the monthly snapshots
- Converted the cStables balances into USD using the exchange rate at the time of the respective monthly snapshot
- Calculated the average cStable balance in USD over all 12 monthly snapshots
- Filtered out addresses with less than $10 in average cStable balances across all snapshots
- Filtered out validator addresses (because for technical reasons their cUSD balances can't be correctly calculated by indexers, concretely the block rewards paid in cUSD to validators do not emit `Transfer` events that indexers pick up)

### Example

- Prior to snapshot 1 (15.11.2022 12pm UTC), Alice had received 55 cUSD and spent 5 cUSD
- Therefore, Alice's balance at snapshot 1 was 50 cUSD (55 - 5)
- She doesn't send or receive any further transactions until one day before snapshot 12
- One day before snapshot 12, Alice receives 100 cEUR
- On the day of snapshot 12, cEUR had an exchange rate of 1.06 USD, so Alice's 100 cEUR were valued at $106 USD
- Her total average cStable balance across all 12 snapshots would be
  - ($50 (cUSD balance) + $106 (cEUR balance)) / 12 snapshots = **$13 average combined cStable balance**
  - Alice would be eligible for the airgrab because she has more than $10 in average cStable value across all snapshots
