import { parse } from 'csv-parse'
import fs from 'node:fs'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import bold from '../../helpers/bold.js'
import type { LockedCeloBalances } from './index.js'

// Schema of the Dune query export: Address | Locked Celo Balance | Snapshot Date
export type OnChainCsv = [`0x${string}`, number, Date]

/**
 * Loads a Dune Snapshot CSV export into memory
 */
export default async function sumUpBalancesFromSnapshotCsvs(
  fileName: string,
  balances: LockedCeloBalances
): Promise<void> {
  const spinner = ora(`Adding balances from snapshot ${bold(fileName)}`).start()

  try {
    const fullPath = new URL(
      process.cwd() + '/src/snapshots/locked-celo-balances/' + fileName,
      import.meta.url
    )

    const parser = fs.createReadStream(fullPath).pipe(
      parse({
        columns: true,
        cast: (value, context) => {
          if (context.header) {
            return value
          }

          switch (context.column) {
            case 'Address':
              return value

            case 'Locked Celo Balance':
            case 'Locked Celo in USD':
              return Number(value)

            case 'Snapshot Date':
              return new Date(value.replace('12-00', '12:00 UTC'))
          }
        },
      })
    )

    parser.on('readable', function () {
      try {
        let row: {
          Address: string
          'Locked Celo Balance': number
          'Locked Celo in USD': number
          'Snapshot Date': Date
        }

        while ((row = parser.read()) !== null) {
          const { Address: address } = row

          // If address hasn't been added to mapping yet, create it
          if (!balances[address]) {
            balances[address] = {
              total: 0,
              totalInUsd: 0,
            }
          }

          // Add snapshot balances
          balances[address].total += row['Locked Celo Balance']
          balances[address].totalInUsd += row['Locked Celo in USD']
        }
      } catch (error) {
        spinner.fail()
        throw error
      }
    })

    await finished(parser)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
