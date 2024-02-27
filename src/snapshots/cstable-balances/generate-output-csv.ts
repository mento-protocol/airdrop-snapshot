import fs from 'node:fs/promises'
import ora from 'ora'
import type { Address } from 'viem'
import type { CStableBalances } from './types.js'

/**
 * Generates final output CSV combining all snapshots into average balances sorted from highest to lowest
 */
export default async function generateOutputCsv(
  balances: CStableBalances,
  outputPath: string
) {
  const spinner = ora(`Writing total average balances to ${outputPath}`).start()
  try {
    let csvData =
      'Address,Average Total cStables in USD,Contract,Beneficiary,Average cUSD in USD,Average cEUR in USD,Average cREAL in USD,Average cUSD Balance,Average cEUR Balance,Average cREAL Balance\n'

    csvData += Object.keys(balances)
      .map((address) => {
        const {
          total,
          contract,
          beneficiary,
          cUSDinUSD,
          cEURinUSD,
          cREALinUSD,
          cUSD,
          cEUR,
          cREAL,
        } = balances[address as Address]

        return `${address},${total},${contract},${beneficiary},${cUSDinUSD},${cEURinUSD},${cREALinUSD},${cUSD},${cEUR},${cREAL}`
      })
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
  }
}
