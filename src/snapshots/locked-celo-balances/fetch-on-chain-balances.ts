import ora from 'ora'
import path from 'path'
import type { Address } from 'viem'
import bold from '../../helpers/bold.js'
import checkIfFileNameAndSnapshotTimeColumnMatch from '../../helpers/check-if-filename-and-snapshot-time-column-match.js'
import fileExists from '../../helpers/file-exists.js'
import getBlockNumberForDate from '../../helpers/get-block-number-for-date.js'
import loadCsvFile from '../../helpers/load-csv-file.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import transformDateToFilename from '../../helpers/transform-date-to-filename.js'
import estimateTimeToFetchAllBalancesFromNode from './estimate-time-to-fetch-balances.js'
import generateOutputCsv from './generate-output-csv.js'
import getBalancesAtBlockNumber from './get-balances-at-block-number.js'
import type { LockedCeloBalances } from './index.js'

/**
 * For every snapshot date:
 *  a) Read respective Dune CSV Export
 *  b) Fetch actual on-chain LockedCelo balances from archive node
 *  c) Write balances to new output CSV (1 output CSV per snapshot)
 */
export default async function fetchOnChainBalances(snapshotDates: Date[]) {
  for (const date of snapshotDates) {
    const snapshotFileName = transformDateToFilename(date)
    const inputFile = `${process.cwd()}/src/snapshots/locked-celo-balances/dune-input-snapshots/${snapshotFileName}.in.csv`
    const outputFile = `${process.cwd()}/src/snapshots/locked-celo-balances/on-chain-output-snapshots/${snapshotFileName}.out.csv`

    // Fetching thousands of balances is expensive, exit early if we already have the data locally
    if (await fileExists(outputFile)) {
      ora(
        `Skipping ${bold(
          path.basename(inputFile)
        )} because output file already exists`
      ).info()

      continue
    }

    const duneCsv = await loadCsvFile(inputFile)

    // Sanity check against human error during manual export from Dune into CSV
    checkIfFileNameAndSnapshotTimeColumnMatch(inputFile, duneCsv, 4)

    const addresses = duneCsv
      // remove header row
      .filter((_, i: number) => i > 0)
      // Addresses are in first column of Dune export
      .map((row) => row[0]) as Address[]

    estimateTimeToFetchAllBalancesFromNode(addresses)

    const blockNumber = await getBlockNumberForDate(date)
    const balances = await getBalancesAtBlockNumber(addresses, blockNumber)
    const sortedBalances = sortByTotal(balances) as LockedCeloBalances
    await generateOutputCsv(sortedBalances, outputFile, 'individual')
  }

  console.log('') // cli output formatting
}
