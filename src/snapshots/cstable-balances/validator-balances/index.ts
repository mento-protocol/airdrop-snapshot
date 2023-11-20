import getValidators from '../../../helpers/get-validators.js'
import generateOutputCsv from './generate-output-csv.js'
import getAllBalancesFor from './get-all-balances.js'
import snapshots from '../../snapshots.js'
import fileExists from '../../../helpers/file-exists.js'
import transformDateToFilename from '../../../helpers/transform-date-to-filename.js'
import ora from 'ora'
import bold from '../../../helpers/bold.js'
import path from 'path'
import sortByTotal from '../../../helpers/sort-by-total.js'
import calculateAverageBalances from '../calculate-average-balances.js'
import sumUpBalancesFromSnapshotCsv from '../sum-up-balances-from-snapshot-csv.js'
import type { CStableBalances } from '../types.js'
import getIndividualSnapshotFiles from '../get-individual-snapshot-files.js'
import filterOutSmallBalances from '../filter-out-small-balances.js'

// NOTE: The reason we need to query validator balances separately is that Celo epoch
// rewards are paid out in cUSD without emitting an ERC20 Transfer event. Hence, those
// cUSD inflows can't be indexed and will lead to incorrect balances in the Dune queries.

if (
  process.argv.length < 3 ||
  (process.argv[2] !== 'validators' && process.argv[2] !== 'validator-groups')
) {
  console.error(
    `\nPlease pass the address list filename you want to process:\n${bold(
      'npx tsx src/snapshots/cstable-balances/validator-balances/index.ts <validators | validator-groups>'
    )}\n`
  )
  process.exit(1)
}

const type = process.argv[2]

// fetches either validator OR validator group addresses from CSV file
const validators = await getValidators(type)

// 1. Fetch cStable balances from an archive node and write them into 1 CSV per snapshot
for (const snapshot of snapshots) {
  const snapshotFile = `${process.cwd()}/src/snapshots/cstable-balances/validator-balances/monthly-snapshots-${type}/${transformDateToFilename(
    snapshot.date
  )}.csv`
  // Fetching thousands of balances is expensive, exit early if we already have the data locally
  if (await fileExists(snapshotFile)) {
    ora(
      `Skipping ${bold(
        transformDateToFilename(snapshot.date).replace(' 12-00', '')
      )} because output file already exists: ${bold(
        path.basename(snapshotFile)
      )}`
    ).info()

    continue
  }

  const snapshotBalances = await getAllBalancesFor(validators, snapshot)
  const sortedSnapshotBalances = sortByTotal(
    snapshotBalances
  ) as CStableBalances
  const outputPath = path.resolve(
    `src/snapshots/cstable-balances/validator-balances/monthly-snapshots-${type}/${transformDateToFilename(
      snapshot.date
    )}.csv`
  )
  await generateOutputCsv(sortedSnapshotBalances, outputPath, 'individual')
}

// 2. Sum up balances across all snapshot files and calculate average total balance
const totalBalances: CStableBalances = {}
for (const file of await getIndividualSnapshotFiles(
  `src/snapshots/cstable-balances/validator-balances/monthly-snapshots-${type}`
)) {
  await sumUpBalancesFromSnapshotCsv(file, totalBalances)
}

console.log('') // output formatting

const averageBalances = calculateAverageBalances(totalBalances)
const balancesExcludingDust = filterOutSmallBalances(averageBalances) // Min. average balance for eligibility is > $10
const sortedTotalBalances = sortByTotal(
  balancesExcludingDust
) as CStableBalances

const finalOutputSnapshotFile =
  process.cwd() +
  `/src/snapshots/cstable-balances/validator-balances/cstable-balances-for-${type}.csv`

generateOutputCsv(sortedTotalBalances, finalOutputSnapshotFile, 'total')