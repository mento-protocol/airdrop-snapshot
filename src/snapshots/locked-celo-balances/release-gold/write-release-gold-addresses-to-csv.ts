import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import type { Address } from 'viem'
import bold from '../../../helpers/bold.js'

export default async function writeReleaseGoldAddressesToCsv(releaseGoldBeneficiaryMap: {
  [key: Address]: Address
}) {
  const spinner = ora('Writing ReleaseGold addresses to CSV').start()
  const outputPath = path.resolve('src/snapshots/release-gold-addresses.csv')

  try {
    let csvData = `Release Gold Address,Beneficiary Address\n`
    csvData += Object.keys(releaseGoldBeneficiaryMap)
      .map(
        (address) =>
          `${address},${releaseGoldBeneficiaryMap[address as Address]}\n`
      )
      .join('\n')
    await fs.writeFile(outputPath, csvData)
  } catch (error) {
    spinner.fail()
    throw error
  }
  spinner.succeed(
    `Found ${bold(
      Object.keys(releaseGoldBeneficiaryMap).length
    )} ReleaseGold contracts and stored them in ${bold(
      path.basename(outputPath)
    )}`
  )
}
