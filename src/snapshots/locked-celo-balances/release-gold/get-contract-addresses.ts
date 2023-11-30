import ora from 'ora'
import path from 'path'
import type { Address } from 'viem'
import bold from '../../../helpers/bold.js'
import transformDateToFilename from '../../../helpers/transform-date-to-filename.js'
import snapshots from '../../snapshots.js'
import loadDuneSnapshotFile from '../load-dune-snapshot-file.js'

export default async function getContractAddresses(): Promise<Set<Address>> {
  const spinner = ora(
    'Filtering out contract addresses from Dune input snapshots'
  ).start()

  // Use a Set to collect unique contract addresses across all snapshots
  const contractAddresses = new Set<Address>()

  try {
    for (const snapshot of snapshots) {
      const snapshotFileName = transformDateToFilename(snapshot.date)

      // Load snapshot into memory
      const duneCsv = await loadDuneSnapshotFile(
        path.resolve(
          `src/snapshots/locked-celo-balances/dune-input-snapshots/${snapshotFileName}.in.csv`
        )
      )

      // Filter out contract addresses and add them to the result Set
      duneCsv
        .filter((row) => row[3] === 'Contract')
        .forEach((contract) => {
          contractAddresses.add(contract[0] as Address)
        })
    }
  } catch (error) {
    spinner.fail()
    throw error
  }

  spinner.succeed(
    `Found ${bold(
      contractAddresses.size
    )} smart contract addresses across all snapshots`
  )

  return contractAddresses
}
