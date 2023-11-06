import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import bold from '../../helpers/bold.js'
import type { LockedCeloBalances } from './index.js'

/**
 * Write fetched on-chain balances to a new CSV
 */
export default async function writeOnChainBalancesToCsv(
  balances: LockedCeloBalances,
  filePath: string
) {
  const fileName = path.basename(filePath)
  const spinner = ora(`Writing on-chain balances to ${bold(fileName)}`).start()

  try {
    let csvData = 'Address,Locked Celo Balance,Snapshot Date\n'
    csvData += Object.keys(balances)
      .map((address) => {
        return `${address},${balances[address]},${fileName.replace(
          '.out.csv',
          ''
        )}`
      })
      .join('\n')

    const fullPath = new URL(filePath, import.meta.url)
    await fs.writeFile(fullPath, csvData)
    spinner.succeed(`Wrote on-chain balances to ${bold(fileName)}`)
  } catch (error) {
    spinner.fail(`Failed to write on-chain balances to ${bold(fileName)}`)
    throw error
  }
}
