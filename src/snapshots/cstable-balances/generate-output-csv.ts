import fs from 'node:fs/promises'
import type { CStableBalances } from './types.js'
import ora from 'ora'

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
      'Address,Average Total cStables in USD,Average cUSD in USD,Average cEUR in USD,Average cREAL in USD,Average cUSD Balance,Average cEUR Balance,Average cREAL Balance\n'

    csvData += Object.keys(balances)
      .map((address) => {
        const { total, cUSDinUSD, cEURinUSD, cREALinUSD, cUSD, cEUR, cREAL } =
          balances[address]

        return `${address},${total},${cUSDinUSD},${cEURinUSD},${cREALinUSD},${cUSD},${cEUR},${cREAL}`
      })
      .join('\n')

    await fs.writeFile(outputPath, csvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
  }
}
