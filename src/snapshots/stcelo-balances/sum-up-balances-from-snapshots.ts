import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import type { Address } from 'viem'
import bold from '../../helpers/bold.js'
import type { StCeloBalances } from './index.js'

export default async function sumUpBalancesFromSnapshotCsv(
  file: string,
  balances: StCeloBalances
): Promise<void> {
  const spinner = ora(
    `Adding balances from snapshot CSV ${bold(path.basename(file))}`
  ).start()

  try {
    const parser = fs.createReadStream(file).pipe(
      parse({
        columns: true,
        cast: (value, context) => {
          if (context.header) {
            return value
          }

          switch (context.column) {
            case 'Snapshot Time':
              return new Date(value)

            case 'stCELO Balance':
            case 'stCELO in USD (approximate)':
              return Number(value)

            default:
              return value
          }
        },
      })
    )

    parser.on('readable', function () {
      let row: {
        Address: Address
        Contract: string
        'stCELO Balance': number
        'stCELO in USD (approximate)': number
      }

      while ((row = parser.read()) !== null) {
        const { Address: address } = row

        // If address hasn't been added to mapping yet, create it
        if (!balances[address]) {
          balances[address] = {
            total: 0,
            totalInUsd: 0,
            contract: '',
          }
        }

        // Add snapshot balances
        balances[address].total += row['stCELO Balance']
        balances[address].totalInUsd += row['stCELO in USD (approximate)']
        balances[address].contract = row.Contract
      }
    })

    await finished(parser)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
