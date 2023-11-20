# Airgrab Snapshots

This repo contains 3 snapshots as per the eligibility criteria provided in [#289](https://github.com/mento-protocol/mento-general/issues/289)

## 1. Locked CELO

- **[Final Snapshot - Locked CELO](./final-snapshots/locked-celo-balances.csv)**
- [Dune Query that was used to export 12 snapshot CSVs](https://dune.com/queries/3164542/5281325)

### Calculation Method

- Export 12 snapshot CSVs using the above Dune query to generate a list of addresses that had locked Celo until the snapshot time
  - **❗ Note that the Dune query results on their own are incorrect as they do not factor in accrued yield from locking over time ❗**
  - Dune can only index emitted `GoldLocked` and `GoldUnlocked` events, so Dune balances should always be lower than the actual on-chain balance was
- Given the list of Dune-generated addresses, fetch the actual LockedCelo balance at the snapshot time from a Celo archive node
- Sum up actual LockedCelo balances at all 12 snapshots
- Calculate the average LockedCelo over all 12 snapshots
- Filter out addresses with less than 10 in average LockedCelo
- Filter out validator addresses because their allocation will be calculated separately

## 2. cStables Volume

The total cStable volume (cUSD + cEUR + cREAL) across a 1-year timeframe from 15.10.2022 until 15.10.2023.

Volume is defined as all cStable transfers **from** an address + all cStable transfers **to** an address.

### Results

- **[Final Snapshot - cStable Volume](./final-snapshots/cstable-volume.csv)**
- [Dune Query used to export cStable Volumes](https://dune.com/queries/3163689/5279843)
- [Validator Addresses Snapshot](./src/snapshots/validators-and-groups/celo-validators.csv)
- [Validator Addresses Dune Query](https://dune.com/queries/3186301)
- [Validator Group Addresses Snapshot](./src/snapshots/validators-and-groups/celo-validator-groups.csv)
- Validator Group Addresses were fetched from [explorer.celo.org](https://explorer.celo.org/mainnet/graphiql) via this query: `{celoValidatorGroups{address}}`

### Calculation Method

- Take 1 snapshot of the total cStables volume per address over a 1-year timeframe from 15.10.2022 12:00 pm UTC to 15.10.2023 12:00 pm UTC
- Sum up volume across all cStables: `cUSD volume + cEUR volume + cREAL volume`
- Denominate volume in USD using the average exchange rate over 365 days between 15.11.2022 and 15.10.2023
- Sort by total volume in USD
- Filter out addresses with less than $100 of total volume
- Filter out validator and validator group addresses and double their cUSD volume
  - **Key Assumption: Validator addresses and validator group addresses barely received cUSD from outside sources but only from epoch rewards**
  - Epoch rewards paid out in cUSD to validator and validator groups aren't captured by Dune, so as a rough heuristic, we're assuming that all cUSD outflows must have had original inflows via epoch rewards. Therefore multiplying cUSD outflows by 2 should give a good approximation of their real volume, albeit not perfect.

### Example

- Bob sent 100 cUSD on day 1 of the snapshot period
- Bob received 50 cUSD on day 100 of the snapshot period
- Bob has sent 100 cEUR at day 365 of the snapshot period
- The average cEUR/USD exchange rate over the 365 days snapshot period was 1.05
- Bob has a total volume of 100 cUSD (spent) + 50 cUSD (received) + (100 cEUR * 1.05 exchange rate = 105 cUSD) = **$255 total volume**

## 3. cStables Balances

The average cStable balance (cUSD/cEUR/cREAL) denominated in USD across a 1-year timeframe.

- [Final Snapshot - cStable Balances](./final-snhapshots/cstable-balances.csv)
- [Dune Query that was used to export 12 snapshot CSVs at different dates](https://dune.com/queries/3144937/5269961)

### Calculation Method

- Take 12 monthly snapshots, 1 per month from November 15, 2022, to October 15, 2023, of addresses that held any cStables on the date of the snapshot
- Minimum cUSD OR cEUR OR cREAL balance must have been > 10 to be included in the monthly snapshots
- Converted the cStables balances into USD using the exchange rate at the time of the respective monthly snapshot
- Calculated the average cStable balance in USD over all 12 monthly snapshots
- Filtered out addresses with less than $10 in average cStable balances across all snapshots
- Filtered out validator addresses (because, for technical reasons, their cUSD balances can't be correctly calculated by indexers. Concretely, the block rewards paid in cUSD to validators do not emit `Transfer` events that indexers pick up)

### Example

- Before snapshot 1 (15.11.2022 12 pm UTC), Alice had received 55 cUSD and spent 5 cUSD
- Therefore, Alice's balance at snapshot 1 was 50 cUSD (55 - 5)
- She doesn't send or receive any further transactions until one day before snapshot 12
- One day before snapshot 12, Alice receives 100 cEUR
- On the day of snapshot 12, cEUR had an exchange rate of 1.06 USD, so Alice's 100 cEUR were valued at $106 USD
- Her total average cStable balance across all 12 snapshots would be
  - ($50 (cUSD balance) + $106 (cEUR balance)) / 12 snapshots = **$13 average combined cStable balance**
  - Alice would be eligible for the airgrab because she has more than $10 in average cStable value across all snapshots
