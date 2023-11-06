import bold from '../../helpers/bold.js'
import calculateAverageBalances from './calculate-average-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import filterOutValidators from '../../helpers/filter-out-validators.js'
import generateOutputCsv from './generate-csv-output-file.js'
import getValidators from '../../helpers/get-validators.js'
import loadDuneSnapshotFiles from './load-dune-snapshot-files.js'
import processSnapshotCsv from './process-snapshot-csv.js'
import sortBalancesByTotal from './sort-balances-by-total.js'

// Our main object we'll use to sum up balances for each address across all snapshots
export type CStableBalances = {
  [address: string]: {
    total: number
    cUSDinUSD: number
    cEURinUSD: number
    cREALinUSD: number
    cUSD: number
    cEUR: number
    cREAL: number
  }
}

// Process all individual snapshot files and populate balances object with aggregate total balances across all snapshots
const totalBalances: CStableBalances = {}
for (const file of await loadDuneSnapshotFiles(
  'src/snapshots/cstable-balances/individual-monthly-snapshots'
)) {
  await processSnapshotCsv(file, totalBalances)
}

console.log('') // output formatting

const averageBalances = calculateAverageBalances(totalBalances)
const balancesExcludingDust = filterOutSmallBalances(averageBalances) // Min. average balance for eligibility is > $10
const balancesSortedByTotal = sortBalancesByTotal(balancesExcludingDust)
const balancesExcludingValidators = filterOutValidators(
  balancesSortedByTotal,
  await getValidators()
)

// Create final CSV output file
await generateOutputCsv(
  balancesExcludingValidators,
  'src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv'
)

console.log(
  `\nℹ️  ${bold(
    String(Object.keys(averageBalances).length)
  )} total addresses in individual snapshots'`
)
console.log(
  `ℹ️  ${bold(
    String(Object.keys(balancesExcludingDust).length)
  )} addresses with >= $10 in average balances'`
)
console.log(
  `ℹ️  ${bold(
    String(Object.keys(balancesExcludingValidators).length) +
      ' total eligible addresses (excluding validators)'
  )}`
)
