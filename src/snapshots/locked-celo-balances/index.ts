import type { Address } from 'viem'
import bold from '../../helpers/bold.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import transformDateToFilename from '../../helpers/transform-date-to-filename.js'
import snapshots from '../snapshots.js'
import addLockedCeloInUsdColumnToSnapshot from './add-usd-prices-to-snapshot.js'
import calculateAverageBalance from './calculate-average-balance.js'
import fetchOnChainBalancesFor from './fetch-on-chain-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import generateOutputCsv from './generate-output-csv.js'
import sumUpBalancesFromSnapshotCsv from './sum-up-balances-from-snapshot-csv.js'

export type LockedCeloBalances = {
  [address: Address]: {
    total: number
    totalInUsd: number
    contract?: string
    beneficiary?: string
  }
}

const totalBalances: LockedCeloBalances = {}

// 1. Define snapshot dates
export const snapshotDates = snapshots.map((s) => s.date)

// 2. Iterate over all Dune snapshot files to extract addresses, then fetch real balances from archive node for each snapshot
await fetchOnChainBalancesFor(snapshotDates)

// 3. Add "Locked Celo in USD" column
await addLockedCeloInUsdColumnToSnapshot()
console.log('') // CLI formatting

// 4. Calculate average balances across all snapshots
for (const date of snapshotDates) {
  const inputFileName = `on-chain-output-snapshots/${transformDateToFilename(
    date
  )}.out.csv`
  await sumUpBalancesFromSnapshotCsv(inputFileName, totalBalances)
}

console.log('') // CLI formatting

const averageBalances = calculateAverageBalance(totalBalances)
const averageBalancesExclDust = filterOutSmallBalances(averageBalances) // Min. average balance for eligibility is > $10
const sortedAverageBalances = sortByTotal(
  averageBalancesExclDust
) as LockedCeloBalances

// 5. Generate output CSV
await generateOutputCsv(
  sortedAverageBalances,
  'src/snapshots/locked-celo-balances/total-average-locked-celo-across-all-snapshots.csv',
  'total'
)

console.log(
  `\nℹ️  ${
    Object.keys(averageBalances).length
  } total addresses in individual snapshots'`
)
console.log(
  `ℹ️  ${bold(
    Object.keys(averageBalancesExclDust).length + ' eligible addresses'
  )} with an average of >= 10 locked CELO tokens across all snapshots'`
)
