import getSnapshotFilesFrom from './get-snapshot-files.js'
import processSnapshotFile from './process-snapshot-file.js'
import sortBalancesByTotal from './sort-balances-by-total.js'
import getValidators from './get-validators.js'
import filterOutValidators from './filter-out-validators.js'
import generateOutputCsv from './generate-csv-output-file.js'
import bold from '../../helpers/bold.js'

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
const balances: Balances = {}

// Process all individual snapshot files and aggregate total balances per address
for (const file of await getSnapshotFilesFrom(
  'src/snapshots/cstable-balances/individual-snapshots'
)) {
  await processSnapshotFile(file, balances)
}

console.log('') // output formatting

// Create CSV file including all addresses with average balances over 12 snapshots
const balancesSortedByTotal = sortBalancesByTotal(balances)
await generateOutputCsv(
  balancesSortedByTotal,
  'src/snapshots/cstable-balances/total-average-across-all-snapshots.csv'
)

// Create CSV file filtering out all validator addresses
const validators = await getValidators()

const balancesExcludingValidators = filterOutValidators(
  balancesSortedByTotal,
  validators
)
await generateOutputCsv(
  balancesExcludingValidators,
  'src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv'
)

console.log(
  `\nℹ️  There are ${bold(
    String(Object.keys(balancesSortedByTotal).length) +
      ' eligible addresses in total'
  )}`
)

console.log(
  `ℹ️  There are ${bold(
    String(Object.keys(balancesExcludingValidators).length) +
      ' addresses excluding validators'
  )}`
)
