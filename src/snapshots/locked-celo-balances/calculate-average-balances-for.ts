import bold from '../../helpers/bold.js'
import filterOutValidators from '../../helpers/filter-out-validators.js'
import generateOutputCsv from './generate-output-csv.js'
import getValidators from '../../helpers/get-validators.js'
import processOnChainCsv from './process-on-chain-csv.js'
import sortBalancesByTotal from '../../helpers/sort-by-total.js'
import transformDateToFilename from '../../helpers/transform-date-to-filename.js'
import type { LockedCeloBalances } from './index.js'

/**
 * Iterate over all on-chain snapshots and calculate average balance per address
 */
export default async function calculateAverageBalancesFor(
  snapshotDates: Date[]
) {
  const totalBalances: LockedCeloBalances = {}

  // Process all snapshot files and calculate average balances across all snapshots
  for (const date of snapshotDates) {
    const inputFileName = `on-chain-output-snapshots/${transformDateToFilename(
      date
    )}.out.csv`
    await processOnChainCsv(inputFileName, totalBalances)
  }

  const totalAverageBalances = calculateAverageBalance(totalBalances)
  const totalAverageBalancesExclDust =
    filterOutSmallBalances(totalAverageBalances) // Min. average balance for eligibility is > $10
  const sortedTotalAverageBalances = sortBalancesByTotal(
    totalAverageBalancesExclDust
  )
  const balancesExcludingValidators = filterOutValidators(
    sortedTotalAverageBalances,
    await getValidators()
  )

  await generateOutputCsv(
    balancesExcludingValidators,
    'src/snapshots/locked-celo-balances/total-average-locked-celo-across-all-snapshots.csv'
  )

  console.log(
    `\nℹ️  ${bold(
      String(Object.keys(totalAverageBalances).length)
    )} total addresses in individual snapshots'`
  )
  console.log(
    `ℹ️  ${bold(
      String(Object.keys(totalAverageBalancesExclDust).length)
    )} addresses with an average of >= 10 locked CELO'`
  )
  console.log(
    `ℹ️  ${bold(
      String(Object.keys(balancesExcludingValidators).length) +
        ' total eligible addresses after excluding validators'
    )}`
  )
}

/**
 * Helper function that calculates the average balance
 */
function calculateAverageBalance(
  balances: LockedCeloBalances
): LockedCeloBalances {
  return Object.fromEntries(
    Object.entries(balances).map(([address, bal]) => {
      return [address, bal / 12]
    })
  )
}

/**
 * Filter out small balances
 */
function filterOutSmallBalances(balances: LockedCeloBalances) {
  return Object.fromEntries(
    Object.entries(balances).filter(([address, balance]) => balance >= 10)
  )
}
