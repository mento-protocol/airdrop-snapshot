import getBlockNumberForDate from './getBlockNumberForDate.js'
import getAddressesFromCsv from './getAddressesFromCsv.js'
import getBalancesAtBlockNumber from './getBalancesAtBlockNumber.js'
import writeBalancesToCsv from './writeBalancesToCsv.js'
import sortBalances from './sortBalances.js'
import transformDateToFilename from '../../helpers/transformDateToFilename.js'
import checkIfFileNameAndSnapshotTimeColumnMatch from './checkIfFileNameAndSnapshotTimeColumnMatch.js'
import loadCsv from './loadCsv.js'
import checkIfOutputFileExists from './checkIfOutputFileExists.js'
import estimateCheckTime from './estimateCheckTime.js'

export type InputCsv = [
  `0x${string}`,
  `<a href=${string}`,
  string,
  'Contract' | '',
  string
]

const snapshotDates = [
  new Date('2022-11-15 12:00 UTC'),
  new Date('2022-12-15 12:00 UTC'),
  new Date('2023-01-15 12:00 UTC'),
  new Date('2023-02-15 12:00 UTC'),
  new Date('2023-03-15 12:00 UTC'),
  new Date('2023-04-15 12:00 UTC'),
  new Date('2023-05-15 12:00 UTC'),
  new Date('2023-06-15 12:00 UTC'),
  new Date('2023-07-15 12:00 UTC'),
  new Date('2023-08-15 12:00 UTC'),
  new Date('2023-09-15 12:00 UTC'),
  new Date('2023-10-15 12:00 UTC'),
]

// cli output formatting
console.log('')

for (const date of snapshotDates) {
  const snapshotFileName = transformDateToFilename(date)
  const inputFileName = `dune-snapshots/${snapshotFileName}.in.csv`
  const outputFileName = `locked-celo-balances/contract-snapshots/${snapshotFileName}.out.csv`

  // Fetching thousands of balances is expensive, exit early if we already have the data locally
  if (await checkIfOutputFileExists(outputFileName)) {
    continue
  }

  const inputCsv = await loadCsv<InputCsv>(inputFileName)

  // Sanity check against human error during manual export from Dune into CSV
  checkIfFileNameAndSnapshotTimeColumnMatch(inputFileName, inputCsv)

  const addresses = getAddressesFromCsv(inputCsv)
  estimateCheckTime(addresses)

  const blockNumber = await getBlockNumberForDate(date)
  const balances = await getBalancesAtBlockNumber(addresses, blockNumber)
  const sortedBalances = sortBalances(balances)
  await writeBalancesToCsv(sortedBalances, outputFileName)
}
