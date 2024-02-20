import fs from 'node:fs/promises'
import ora from 'ora'
import type { Address } from 'viem'
import type { CStableVolume } from '../cstable-volume/index.js'

export default async function generateOutputCsv(
  volumes: CStableVolume,
  outputPath: string
) {
  const spinner = ora(`Writing adjusted volumes to ${outputPath}`).start()
  try {
    let csvData =
      'Address,Total Volume in USD,Contract,Beneficiary,cUSD Volume in USD,cEUR Volume in USD,cREAL Volume in USD,cUSD Volume,cEUR Volume,cREAL Volume\n'

    csvData += Object.keys(volumes)
      .map((address) => {
        const {
          total,
          cUSDinUSD,
          cEURinUSD,
          cREALinUSD,
          cUSD,
          cEUR,
          cREAL,
          contract,
          beneficiary,
        } = volumes[address as Address]

        return `${address},${total},${contract?.replace(
          /\,/g,
          ''
        )},${beneficiary},${cUSDinUSD || ''},${cEURinUSD || ''},${
          cREALinUSD || ''
        },${cUSD || ''},${cEUR || ''},${cREAL || ''}`
      })
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
  }
}
