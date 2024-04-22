import type { Address } from 'viem'
import bold from '../../helpers/bold.js'
import checkIfFileNameAndSnapshotTimeColumnMatch from '../../helpers/check-if-filename-and-snapshot-time-column-match.js'
import getIndividualSnapshotFiles from '../../helpers/get-individual-snapshot-files.js'
import loadCsvFile from '../../helpers/load-csv-file.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import calculateAverageBalances from './calculate-average-balances.js'
import filterOutSmallBalances from './filter-out-small-balances.js'
import generateOutputCsv from './generate-output-csv.js'
import sumUpBalancesFromSnapshots from './sum-up-balances-from-snapshots.js'

// Important, otherwise manual process termination will not work via `Ctrl + C`
process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...')
  process.exit(1)
})

export type StCeloBalances = {
  [address: Address]: {
    total: number
    totalInUsd: number
    contract: string
  }
}

// 1. Sum up balances from all individual snapshot files and calculate total balances across all snapshots (not averaged yet)
const totalBalances: StCeloBalances = {}
for (const file of await getIndividualSnapshotFiles(
  `${process.cwd()}/src/snapshots/stcelo-balances/individual-monthly-snapshots`
)) {
  const snapshotCsv = await loadCsvFile(file)
  checkIfFileNameAndSnapshotTimeColumnMatch(file, snapshotCsv, 4)
  await sumUpBalancesFromSnapshots(file, totalBalances)
}

console.log('') // output formatting

// 2. Calculate average balances
const averageBalances = calculateAverageBalances(totalBalances)

// 3. Filter out small average balances, Min. average balance for eligibility is > $10
const averageBalancesExclDust = filterOutSmallBalances(averageBalances)

// 3. Sort balances by total
const balancesSortedByTotal = sortByTotal(
  averageBalancesExclDust
) as StCeloBalances

// 4. Create CSV snapshot file with average balances
await generateOutputCsv(
  balancesSortedByTotal,
  `${process.cwd()}/final-snapshots/stcelo-balances.csv`
)

console.log(
  `\nℹ️  ${bold(
    Object.keys(balancesSortedByTotal).length
  )} total addresses in individual snapshots'`
)
