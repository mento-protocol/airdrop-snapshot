import fetchOnChainBalancesFor from './fetch-on-chain-balances.js'
import calculateAverageBalancesFor from './calculate-average-balances-for.js'

export type LockedCeloBalances = {
  [address: string]: {
    total: number
    totalInUsd: number
  }
}

// 1. Define snapshot dates
const snapshotDates = [
  new Date('2022-11-15 12:00 UTC'),
  new Date('2022-12-15 12:00 UTC'),
  new Date('2023-01-15 12:00 UTC'),
  new Date('2023-02-15 12:00 UTC'),
  new Date('2023-03-15 12:00 UTC'),
  new Date('2023-04-15 12:00 UTC'),
  new Date('2023-05-15 12:00 UTC'),
  new Date('2023-06-15 12:00 UTC'),
  new Date('2023-07-15 12:00 UTC'),
  new Date('2023-08-15 12:00 UTC'),
  new Date('2023-09-15 12:00 UTC'),
  new Date('2023-10-15 12:00 UTC'),
]

// 2. Iterate over all Dune snapshot files to extract addresses, then fetch real balances from archive node for each snapshot
await fetchOnChainBalancesFor(snapshotDates)

// 3. Calculate average balances across all snapshots
await calculateAverageBalancesFor(snapshotDates)
