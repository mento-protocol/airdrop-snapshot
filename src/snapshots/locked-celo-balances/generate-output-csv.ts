import fs from 'node:fs/promises'
import ora from 'ora'
import type { LockedCeloBalances } from './index.js'

/**
 * Generates final output CSV combining all snapshots into average balances sorted from highest to lowest
 */
export default async function generateOutputCsv(
  totalAverageBalances: LockedCeloBalances,
  outputPath: string
) {
  const spinner = ora(`Writing total average balances to ${outputPath}`).start()
  try {
    let csvData = 'Address,Average Locked Celo Balance\n'

    csvData += Object.keys(totalAverageBalances)
      .map((address) => `${address},${totalAverageBalances[address]}`)
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
