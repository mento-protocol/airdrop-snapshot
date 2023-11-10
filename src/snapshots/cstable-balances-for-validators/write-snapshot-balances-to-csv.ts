import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import bold from '../../helpers/bold.js'
import transformDateToFilename from '../../helpers/transform-date-to-filename.js'
import { CStableBalances } from '../cstable-balances/types.js'

/**
 * Write fetched snapshot balances to a new CSV
 */
export default async function writeSnapshotBalancesToCsv(
  balances: CStableBalances,
  snapshot: Date,
  type: 'validators' | 'validator-groups'
) {
  const filePath = `${process.cwd()}/src/snapshots/cstable-balances-for-validators/monthly-snapshots-${type}/${transformDateToFilename(
    snapshot
  )}.csv`
  const fileName = path.basename(filePath)

  const spinner = ora(`Writing snapshot balances to ${bold(fileName)}`).start()

  try {
    let csvData =
      'Address,Total cStables in USD,cUSD in USD,cEUR in USD,cREAL in USD,cUSD Balance,cEUR Balance,cREAL Balance,Snapshot Date\n'
    csvData += Object.keys(balances)
      .map((address) => {
        const { cUSDinUSD, cEURinUSD, cREALinUSD, cUSD, cEUR, cREAL } =
          balances[address]
        const totalCstablesInUsd = cUSDinUSD + cEURinUSD + cREALinUSD
        return `${address},${totalCstablesInUsd},${cUSDinUSD},${cEURinUSD},${cREALinUSD},${cUSD},${cEUR},${cREAL},${fileName.replace(
          '12-00.csv',
          ''
        )}`
      })
      .join('\n')

    await fs.writeFile(filePath, csvData)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
