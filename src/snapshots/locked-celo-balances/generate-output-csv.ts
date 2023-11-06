import fs from 'node:fs/promises'
import path from 'node:path'
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
    spinner.succeed(
      `Wrote total average balances to ${path.relative(
        process.cwd(),
        outputPath
      )}`
    )
  } catch (error) {
    spinner.fail(
      `Failed to write total average balances to ${path.relative(
        process.cwd(),
        outputPath
      )}`
    )
    throw error
  }
}
