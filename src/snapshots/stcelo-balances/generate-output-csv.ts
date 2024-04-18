import fs from 'node:fs/promises'
import ora from 'ora'
import type { Address } from 'viem'
import type { StCeloBalances } from './index.js'

/**
 * Generates final output CSV combining all snapshots into average balances sorted from highest to lowest
 */
export default async function jenerateOutputCsv(
  balances: StCeloBalances,
  outputPath: string
) {
  const spinner = ora(`Writing total average balances to ${outputPath}`).start()
  try {
    let csvData =
      'Address,Average Total stCELO,Average Total stCELO in USD,Contract\n'

    csvData += Object.keys(balances)
      .map((address) => {
        const { total, totalInUsd, contract } = balances[address as Address]

        return `${address},${total},${totalInUsd},"${contract}"`
      })
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    console.error("Couldn't write CSV: ", error)
    spinner.fail()
  }
}
