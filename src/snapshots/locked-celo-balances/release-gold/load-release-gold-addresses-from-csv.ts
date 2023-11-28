import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import type { Address } from 'viem'
import bold from '../../../helpers/bold.js'

export default async function loadReleaseGoldAddressesFromCsv(
  releaseGoldFile: string
): Promise<{ [key: Address]: Address }> {
  const spinner = ora(
    `Loading cached ReleaseGold addresses from ${bold(
      path.basename(releaseGoldFile)
    )}`
  ).start()

  try {
    const releaseGoldBeneficiaryMap: { [key: Address]: Address } = {}
    const parser = fs
      .createReadStream(releaseGoldFile)
      .pipe(parse({ columns: true }))

    parser.on('readable', function () {
      let row: {
        'Release Gold Address': `0x${string}}`
        'Beneficiary Address': `0x${string}}`
      }

      while ((row = parser.read()) !== null) {
        const {
          'Release Gold Address': address,
          'Beneficiary Address': beneficiary,
        } = row

        releaseGoldBeneficiaryMap[address] = beneficiary
      }
    })

    await finished(parser)

    spinner.succeed()
    return releaseGoldBeneficiaryMap
  } catch (error) {
    spinner.fail()
    throw error
  }
}
