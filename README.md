# Airgrab Snapshots

This repo will contain 3 snapshots as per the eligibility criteria provided in [#289](https://github.com/mento-protocol/mento-general/issues/289)

## 1. Locked CELO

TBD

## 2. cStables Volume

TBD

## 3. cStables Balances

The average cStable balance (cUSD/cEUR/cREAL) denominated in USD across a 1-year timeframe.

- [cStables Balances Snapshot](./src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv)
- [Dune Query that was used to export 12 snapshot CSVs at different dates](https://dune.com/queries/3144937/5269961)

### Calculation Method

- We took 12 monthly snapshots, 1 per month from November 15 2022 to October 15 2023, of addresses who held any cStables on the date of the snapshot
- Minimum cUSD OR cEUR OR cREAL balance must have been > 10 to be included in the monthly snapshots
- Converted the cStables balances into USD using the exchange rate at the time of the respective monthly snapshot
- Calculated the average cStable balance in USD over all 12 monthly snapshots
- Filtered out addresses with less than $10 in average cStable balances across all snapshots
- Filtered out validator addresses (because for technical reasons their cUSD balances can't be correctly calculated by indexers, concretely the block rewards paid in cUSD to validators do not emit `Transfer` events that indexers pick up)
