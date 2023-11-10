import bold from '../../helpers/bold.js'
import calculateAverageBalances from './calculate-average-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import filterOutValidators from '../../helpers/filter-out-validators.js'
import generateOutputCsv from './generate-output-csv.js'
import getValidators from '../../helpers/get-validators.js'
import loadDuneSnapshotFiles from './get-individual-snapshot-files.js'
import sumUpBalancesFromSnapshots from './sum-up-balances-from-snapshot-csv.js'
import sortBalancesByTotal from './sort-balances-by-total.js'
import type { CStableBalances } from './types.js'

// Process all individual snapshot files and populate balances object with aggregate total balances across all snapshots
const totalBalances: CStableBalances = {}
for (const file of await loadDuneSnapshotFiles(
  'src/snapshots/cstable-balances/individual-monthly-snapshots'
)) {
  await sumUpBalancesFromSnapshots(file, totalBalances)
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
