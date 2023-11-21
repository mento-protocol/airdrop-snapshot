import fs from 'node:fs/promises'
import ora from 'ora'
import type { LockedCeloBalances } from './index.js'
import path from 'node:path'

/**
 * Depending on `type` param, can generate
 * - Individual snapshot CSVs
 * - Total output CSV combining all snapshots into average balances
 */
export default async function generateOutputCsv(
  balances: LockedCeloBalances,
  outputPath: string,
  type: 'individual' | 'total'
) {
  const spinner = ora(
    `Writing locked celo balances to ${path.basename(outputPath)}`
  ).start()
  try {
    let csvData =
      type === 'individual'
        ? 'Address,Locked Celo Balance,Locked Celo in USD,Snapshot Date\n'
        : 'Address,Average Locked Celo Balance,Average Locked Celo in USD\n'

    csvData += Object.keys(balances)
      .map((address) =>
        type === 'individual'
          ? `${address},${balances[address].total},${
              balances[address].totalInUsd
            },${path.basename(outputPath).replace('.out.csv', '')}`
          : `${address},${balances[address].total},${balances[address].totalInUsd}`
      )
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
