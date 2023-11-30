import fs from 'node:fs/promises'
import ora from 'ora'
import path from 'path'
import type { Address } from 'viem'

/**
 * Replace ReleaseGold contracts with beneficiary addresses in the output snapshots
 */
export default async function insertBeneficiaryAddressesIntoOutputSnapshot(releaseGoldBeneficiaryMap: {
  [key: Address]: Address
}) {
  const spinner = ora(
    'Replacing ReleaseGold addresses with beneficiaries in output snapshot'
  ).start()

  try {
    const snapshotFile = path.resolve(
      `src/snapshots/locked-celo-balances/total-average-locked-celo-across-all-snapshots.csv`
    )
    let csv = await fs.readFile(snapshotFile, 'utf8')

    Object.entries(releaseGoldBeneficiaryMap).forEach(
      ([releaseGoldAddress, beneficiary]: [string, Address]) => {
        csv = csv.replace(releaseGoldAddress, beneficiary)
      }
    )
    fs.writeFile(
      snapshotFile.replace('.csv', '-with-release-gold-beneficiaries.csv'),
      csv
    )
  } catch (error) {
    spinner.fail()
    throw error
  }

  spinner.succeed()
}
