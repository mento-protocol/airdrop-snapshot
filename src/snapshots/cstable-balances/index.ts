import bold from '../../helpers/bold.js'
import checkIfFileNameAndSnapshotTimeColumnMatch from '../../helpers/check-if-filename-and-snapshot-time-column-match.js'
import filterOutValidators from '../../helpers/filter-out-validators.js'
import getValidators from '../../helpers/get-validators.js'
import loadCsvFile from '../../helpers/load-csv-file.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import calculateAverageBalances from './calculate-average-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import generateOutputCsv from './generate-output-csv.js'
import loadDuneSnapshotFiles from './get-individual-snapshot-files.js'
import sumUpBalancesFromSnapshots from './sum-up-balances-from-snapshot-csv.js'
import type { CStableBalances } from './types.js'

// Important, otherwise manual process termination will not work via `Ctrl + C`
process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...')
  process.exit(1)
})

// 1. Sum up balances from all individual snapshot files and calculate total balances across all snapshots (not averaged yet)
const totalBalances: CStableBalances = {}
for (const file of await loadDuneSnapshotFiles(
  `${process.cwd()}/src/snapshots/cstable-balances/individual-monthly-snapshots`
)) {
  const snapshotCsv = await loadCsvFile(file)
  checkIfFileNameAndSnapshotTimeColumnMatch(file, snapshotCsv, 9)
  await sumUpBalancesFromSnapshots(file, totalBalances)
}

console.log('') // output formatting

// 2. Calculate average balances
const averageBalances = calculateAverageBalances(totalBalances)

// 3. Filter out small balances. Min. average balance for eligibility is > $10
const balancesExcludingDust = filterOutSmallBalances(averageBalances)

// 4. Sort balances by total
const balancesSortedByTotal = sortByTotal(
  balancesExcludingDust
) as CStableBalances

// 5. Remove validators and validator groups, we'll add them back later with correct balances
//   (we can't use the Dune balances because they don't include cUSD epoch rewards or block rewards paid in cStables)
const validators = await getValidators('validators')
const validatorGroups = await getValidators('validator-groups')
const balancesExcludingValidators = filterOutValidators(
  balancesSortedByTotal,
  validators.concat(validatorGroups)
)

// 6. Create CSV snapshot file with average balances
await generateOutputCsv(
  balancesExcludingValidators,
  'src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv'
)

console.log(
  `\nℹ️  ${bold(
    Object.keys(averageBalances).length
  )} total addresses in individual snapshots'`
)
console.log(
  `ℹ️  ${bold(
    Object.keys(balancesExcludingDust).length
  )} addresses with >= $10 in average balances'`
)
console.log(
  `ℹ️  ${bold(
    Object.keys(balancesSortedByTotal).length -
      Object.keys(balancesExcludingValidators).length +
      ' validator and validator group addresses removed (will be calculated separately)'
  )}`
)
