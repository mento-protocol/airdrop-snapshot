import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import type { Address } from 'viem'
import type { LockedCeloBalances } from './index.js'

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
        : 'Address,Average Locked Celo Balance,Average Locked Celo in USD,Contract,Beneficiary\n'

    csvData += Object.keys(balances)
      .map((address) =>
        type === 'individual'
          ? `${address},${balances[address as Address].total},${
              balances[address as Address].totalInUsd
            },${path.basename(outputPath).replace('.out.csv', '')}`
          : `${address},${balances[address as Address].total},${
              balances[address as Address].totalInUsd
            },${balances[address as Address].contract},${
              balances[address as Address].beneficiary
            }`
      )
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
