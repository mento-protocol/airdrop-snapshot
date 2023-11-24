import bold from '../../helpers/bold.js'
import calculateAverageBalances from './calculate-average-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import filterOutValidators from '../../helpers/filter-out-validators.js'
import generateOutputCsv from './generate-output-csv.js'
import getValidators from '../../helpers/get-validators.js'
import loadDuneSnapshotFiles from './get-individual-snapshot-files.js'
import sumUpBalancesFromSnapshots from './sum-up-balances-from-snapshot-csv.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import type { CStableBalances } from './types.js'

// 1. Sum up balances from all individual snapshot files and calculate total balances across all snapshots (not averaged yet)
const totalBalances: CStableBalances = {}
for (const file of await loadDuneSnapshotFiles(
  'src/snapshots/cstable-balances/individual-monthly-snapshots'
)) {
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
    Object.keys(balancesExcludingDust).length -
      Object.keys(balancesExcludingValidators).length +
      ' validator and validator group addresses removed (will be calculated separately)'
  )}`
)
