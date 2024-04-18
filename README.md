# Airdrop Snapshots

This repo contains

- 4 individual snapshots as defined by the [eligibility criteria](https://github.com/mento-protocol/mento-general/issues/289)
- The [final airdrop allocation](https://github.com/mento-protocol/airdrop-snapshot/blob/main/final-snapshots/airdrop-amounts-per-address.csv) calculated from these snapshots in this [notebook](https://colab.research.google.com/drive/17sGsXPjZDjTOlajpemzDTG40_3igetdd?usp=sharing).

## 1. Locked CELO

- **[Final Snapshot - Locked CELO](./final-snapshots/locked-celo-balances.csv)**
- [Dune Query that was used to export monthly snapshot CSVs](https://dune.com/queries/3164542/5281325)

### Calculation Method Explanation

1. Export 16 monthly snapshot CSVs (first snapshot 15.10.2022, last snapshot 15.02.2024) using [the above Dune query](https://dune.com/queries/3164542/5281325) to generate a list of addresses that had locked Celo until the snapshot time
   - **❗ Note that the balances from the Dune query results on their own are incorrect as they do not factor in accrued yield from locking over time ❗**
   - Dune only indexes emitted `GoldLocked` and `GoldUnlocked` events, but not emitted yield. Hence, Dune balances are lower than the actual on-chain balance
1. Given the list of Dune-generated addresses, fetch the actual `LockedCelo` balance at the snapshot time from a Celo archive node via `yarn generate:lockedCeloBalances`
1. Sum up actual LockedCelo balances at all monthly snapshots
1. Calculate the average LockedCelo over all monthly snapshots
1. Filter out addresses with less than $10 USD worth of LockedCelo on average
1. Map addresses that belong (or belonged in case they were self-destructed) to `ReleaseGold` vesting contracts to their respective beneficiaries via `yarn lockedCelo:mapReleaseGold`

## 2. cStables Volume

The total cStable volume (cUSD + cEUR + cREAL) across a the snapshot period from 15.10.2022 until 15.02.2024.

Volume is defined as all cStable transfers **from** an address + all cStable transfers **to** an address.

### Results

- **[Final Snapshot - cStable Volume](./final-snapshots/cstable-volume.csv)**
- [Dune Query used to export cStable Volumes](https://dune.com/queries/3163689/5279843)
- [Validator Addresses Snapshot](./src/snapshots/validators-and-groups/celo-validators.csv)
- [Validator Addresses Dune Query](https://dune.com/queries/3186301)
- [Validator Group Addresses Snapshot](./src/snapshots/validators-and-groups/celo-validator-groups.csv)
- Validator Group Addresses were fetched from [explorer.celo.org](https://explorer.celo.org/mainnet/graphiql) via this query: `{celoValidatorGroups{address}}`

### Example

- Bob sent 100 cUSD on day 1 of the snapshot period
- Bob received 50 cUSD on day 100 of the snapshot period
- Bob has sent 100 cEUR at day 365 of the snapshot period
- The average cEUR/USD exchange rate over the 365 days snapshot period was 1.05
- Bob has a total volume of 100 cUSD (spent) + 50 cUSD (received) + (100 cEUR * 1.05 exchange rate = 105 cUSD) = **$255 total volume**

### Calculation Method Explanation

1. Take 1 snapshot of the total cStables volume per address over a 1-year timeframe from 15.10.2022 12:00 pm UTC to 15.10.2023 12:00 pm UTC
1. Sum up volume across all cStables: `cUSD volume + cEUR volume + cREAL volume`
1. Denominate volume in USD using the average exchange rate over 365 days between 15.11.2022 and 15.10.2023
1. Sort by total volume in USD
1. Filter out addresses with less than $100 of total volume
1. Filter out validator and validator group addresses and double their cUSD volume
   - **Key Assumption: Validator addresses and validator group addresses barely received cUSD from outside sources but only from epoch rewards**
   - Epoch rewards paid out in cUSD to validator and validator groups aren't captured by Dune, so as a rough heuristic, we're assuming that all cUSD outflows must have had original inflows via epoch rewards. Therefore multiplying cUSD outflows by 2 should give a good approximation of their real volume, albeit not perfect.

## 3. cStables Balances

The average cStable balance (cUSD/cEUR/cREAL) denominated in USD across 16 monthly snapshots from 15.11.2022 through 15.02.2024.

- **[Final Snapshot - cStable Balances](./final-snapshots/cstable-balances.csv)**
- [Dune Query that was used to export 16 snapshot CSVs at different dates](https://dune.com/queries/3144937/5269961)

### Example

- Before snapshot 1 (15.11.2022 12 pm UTC), Alice had received 75 cUSD and spent 5 cUSD
- Therefore, Alice's balance at snapshot 1 was 70 cUSD (75 - 5)
- She doesn't send or receive any further transactions until one day before the last snapshot
- One day before the last snapshot, Alice receives 100 cEUR
- On the day of the last snapshot, cEUR had an exchange rate of 1.06 USD, so Alice's 100 cEUR were valued at $106 USD
- Her total average cStable balance across all 16 snapshots would be
  - ($70 (cUSD balance) + $106 (cEUR balance)) / 16 snapshots = **$11 average combined cStable balance**
  - Alice would be eligible for the airdrop because she has more than $10 in average cStable value across all snapshots

### Calculation Method Explanation

1. Take 16 monthly snapshots, 1 per month from November 15, 2022, to February 15, 2024, of addresses that held any cStables on the date of the snapshot
1. Filter out addresses with less than 10 cUSD or cEUR or cREAL at the time of snapshot
1. Convert the cStables balances into USD using the exchange rate at the time of the respective monthly snapshot
1. Calculate the average cStable balance in USD over all monthly snapshots
1. Filter out addresses with less than $10 USD in average cStable balances across all snapshots
1. Filter out validator and validator group addresses because their cUSD balances can't be correctly calculated by indexers.
   - The epoch rewards paid in cUSD to validators do not emit `Transfer` events that indexers pick up. Therefor, we must calculate them manually.
1. Fetch actual cStable balances for all validator and validator group addresses via `balanceOf(address, blockNumber)` from an archive node for each monthly snapshot
1. Integrate average validator and validator group balances into final snapshot

### How To Recalculate Yourself

1. Copy the `.env.example` file into `.env` and add a valid Infura API key
1. Delete all snapshot CSV files from: (don't worry, they're under version control)
   1. `./src/snapshots/cstable-balances/individual-monthly-snapshots`
   1. `./src/snapshots/cstable-balances/validator-balances/monthly-snapshots-validators`
   1. `./src/snapshots/cstable-balances/validator-balances/monthly-snapshots-validator-groups`
1. Export monthly snapshot CSVs via this [Dune Query](https://dune.com/queries/3144937/5269961), one for every snapshot date
   - First snapshot: 15.11.2022 12:00 pm UTC
   - Last snapshot: 15.10.2023 12:00 pm UTC
1. Name the CSVs according to schema `2022-11-15 12pm.csv` and place them into the `./src/snapshots/cstable-balances/individual-monthly-snapshots` folder
1. Run `npm run generate:cstableBalances` which should create or update `./src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv`
1. Run `npm run generate:cstableBalancesForValidators` which should fetch validator balances from an archive node and create monthly snapshot CSVs in `./src/snapshots/cstable-balances/validator/balances/monthly-snapshots-validators/`
1. Run `npm run generate:cstableBalancesForValidatorGroups` which should fetch validator group balances from an archive node and create monthly snapshot CSVs in `./src/snapshots/cstable-balances/validator/balances/monthly-snapshots-validator-groups/`
1. Run `npm run generate:cstableBalances:merge` which should merge the results of the prior 3 commands into `./final-snapshots/cstable-balances.csv`
1. Check the git diffs to see you get the same results

## 4. stCELO Balances

The average stCELO balance across 16 monthly snapshots from 15.11.2022 through 15.02.2024.

- **[Final Snapshot - cStable Balances](./final-snapshots/stcelo-balances.csv)**
- [Dune Query that was used to export 16 snapshot CSVs at different dates](https://dune.com/queries/3638694/6127529)

### Calculation Method Explanation

1. Take 16 monthly snapshots, 1 per month from November 15, 2022, to February 15, 2024, of addresses that held stCELO on the date of the snapshot
1. Calculate the average balance over all monthly snapshots
