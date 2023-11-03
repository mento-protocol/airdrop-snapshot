import fs from 'node:fs/promises'
import type { Balances } from './getBalancesAtBlockNumber.js'
import ora from 'ora'
import bold from '../../helpers/bold.js'

export default async function writeBalancesToCsv(
  balances: Balances,
  fileName: string
) {
  const spinner = ora(`Writing balances to ${fileName}`).start()

  let csvData = 'Address,Locked Celo Balance\n'
  csvData += Object.keys(balances)
    .map((address) => {
      return `${address},${balances[address]}`
    })
    .join('\n')

  await fs.writeFile(new URL(fileName, import.meta.url), csvData)

  spinner.succeed(`Wrote balances to ${bold(fileName)}`)
}
