import getSnapshotFilesFrom from './get-snapshot-files.js'
import processSnapshotFile from './process-snapshot-file.js'
import sortBalancesByTotal from './sort-balances-by-total.js'
import getValidators from './get-validators.js'
import filterOutValidators from './filter-out-validators.js'
import generateOutputCsv from './generate-csv-output-file.js'
import bold from '../../helpers/bold.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import calculateAverageBalances from './calculate-average-balances.js'

// Our main object we'll use to sum up balances for each address across all snapshots
export type Balances = {
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
const totalBalances: Balances = {}
for (const file of await getSnapshotFilesFrom(
  'src/snapshots/cstable-balances/individual-monthly-snapshots'
)) {
  await processSnapshotFile(file, totalBalances)
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

console.log('') // output formatting
console.log(
  `ℹ️  ${bold(
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
