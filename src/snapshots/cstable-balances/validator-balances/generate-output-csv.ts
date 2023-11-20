import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import bold from '../../../helpers/bold.js'
import { CStableBalances } from '../types.js'

/**
 * Write fetched snapshot balances to a new CSV
 */
export default async function generateOutputCsv(
  balances: CStableBalances,
  outputPath: string,
  type: 'individual' | 'total'
) {
  const fileName = path.basename(outputPath)

  const spinner = ora(`Writing snapshot balances to ${bold(fileName)}`).start()

  try {
    const csvHeaderIndividual =
      'Address,Total cStables in USD,cUSD in USD,cEUR in USD,cREAL in USD,cUSD Balance,cEUR Balance,cREAL Balance,Snapshot Date\n'

    const csvHeaderTotalAverage =
      'Address,Average Total cStables in USD,Average cUSD in USD,Average cEUR in USD,Average cREAL in USD,Average cUSD Balance,Average cEUR Balance,Average cREAL Balance'

    const header =
      type === 'individual' ? csvHeaderIndividual : csvHeaderTotalAverage
    let csvData = `${header}\n`

    csvData += Object.keys(balances)
      .map((address) => {
        const { cUSDinUSD, cEURinUSD, cREALinUSD, cUSD, cEUR, cREAL } =
          balances[address]
        const totalCstablesInUsd = cUSDinUSD + cEURinUSD + cREALinUSD

        const individual = `${address},${totalCstablesInUsd},${cUSDinUSD},${cEURinUSD},${cREALinUSD},${cUSD},${cEUR},${cREAL},${fileName.replace(
          '12-00.csv',
          ''
        )}`
        const total = `${address},${totalCstablesInUsd},${cUSDinUSD},${cEURinUSD},${cREALinUSD},${cUSD},${cEUR},${cREAL}`

        return type === 'individual' ? individual : total
      })
      .join('\n')

    await fs.writeFile(outputPath, csvData)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
