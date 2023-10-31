import fs from 'node:fs/promises'
import path from 'node:path'
import type { Balances } from './index.js'

export default async function generateOutputCsv(
  balances: Balances,
  outputPath: string
) {
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
    console.log(
      `🏁 Generated CSV file: ${path.relative(process.cwd(), outputPath)}`
    )
  } catch (error) {
    console.error('Error compiling output CSV:', error)
  }
}
