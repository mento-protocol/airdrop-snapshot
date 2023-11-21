import path from 'node:path'
import fs from 'node:fs'
import ora from 'ora'
import bold from '../../helpers/bold.js'
import type { LockedCeloBalances } from './index.js'
import { finished } from 'node:stream/promises'
import { parse } from 'csv-parse'

// Schema of the Dune query export: Address | Locked Celo Balance | Snapshot Date
export type OnChainCsv = [`0x${string}`, number, Date]

/**
 * Loads a Dune Snapshot CSV export into memory
 */
export default async function processOnChainCsv(
  fileName: string,
  balances: LockedCeloBalances
): Promise<void> {
  const spinner = ora(`Loading on-chain CSV file ${bold(fileName)}...`).start()

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
              return Number(value) / 1e18

            case 'Snapshot Date':
              return new Date(value.replace('12-00', '12:00 UTC'))

            // deepcode ignore DuplicateCaseBody: code is cleaner to read this way
            default:
              return value
          }
        },
      })
    )

    parser.on('readable', function () {
      let row: {
        Address: string
        'Locked Celo Balance': number
        'Snapshot Date': Date
      }

      while ((row = parser.read()) !== null) {
        const { Address: address } = row

        // If address hasn't been added to mapping yet, create it
        if (!balances[address]) {
          balances[address].total = 0
        }

        // Add snapshot balances
        balances[address].total += row['Locked Celo Balance']
      }
    })

    await finished(parser)

    spinner.succeed(
      `Processed on-chain CSV file ${bold(path.basename(fileName))}.`
    )
  } catch (error) {
    spinner.fail(
      `Couldn't process on-chain CSV file ${bold(path.basename(fileName))}`
    )
    throw error
  }
}
