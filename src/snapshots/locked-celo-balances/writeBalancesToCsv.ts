import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import type { Balances } from './getBalancesAtBlockNumber.js'
import bold from '../../helpers/bold.js'

export default async function writeBalancesToCsv(
  balances: Balances,
  fileName: string
) {
  const spinner = ora(`Writing balances to ${fileName}`).start()

  try {
    let csvData = 'Address,Locked Celo Balance,Snapshot Date\n'
    csvData += Object.keys(balances)
      .map((address) => {
        return `${address},${balances[address]},${path.basename(fileName)}`
      })
      .join('\n')

    await fs.writeFile(new URL(fileName, import.meta.url), csvData)
    spinner.succeed(`Wrote balances to ${bold(fileName)}`)
  } catch (error) {
    spinner.fail(`Failed to write balances to ${bold(fileName)}`)
    throw error
  }
}
