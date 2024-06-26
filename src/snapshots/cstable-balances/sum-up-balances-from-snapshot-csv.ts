import { parse } from 'csv-parse'
import fs from 'node:fs'
import { finished } from 'node:stream/promises'
import type { Address } from 'viem'
import type { CStableBalances } from './types.js'

export default async function sumUpBalancesFromSnapshotCsv(
  file: string,
  balances: CStableBalances
): Promise<void> {
  const parser = fs.createReadStream(file).pipe(
    parse({
      columns: true,
      cast: (value, context) => {
        if (context.header) {
          return value
        }

        switch (context.column) {
          case 'Contract':
          case 'Address':
            return value

          case 'Snapshot Time':
            return new Date(value)

          default:
            return Number(value)
        }
      },
    })
  )

  parser.on('readable', function () {
    let row: {
      Address: Address
      'Total cStables in USD': number
      'cUSD in USD': number
      'cEUR in USD': number
      'cREAL in USD': number
      Contract: string
      'cUSD Balance': number
      'cEUR Balance': number
      'cREAL Balance': number
    }

    while ((row = parser.read()) !== null) {
      const { Address: address } = row

      // If address hasn't been added to mapping yet, create it
      if (!balances[address]) {
        balances[address] = {
          total: 0,
          contract: '',
          beneficiary: '',
          cUSDinUSD: 0,
          cEURinUSD: 0,
          cREALinUSD: 0,
          cUSD: 0,
          cEUR: 0,
          cREAL: 0,
        }
      }

      // Add snapshot balances
      balances[address].total += row['Total cStables in USD']
      balances[address].contract = row.Contract
      balances[address].beneficiary = ''
      balances[address].cUSDinUSD += row['cUSD in USD']
      balances[address].cEURinUSD += row['cEUR in USD']
      balances[address].cREALinUSD += row['cREAL in USD']
      balances[address].cUSD += row['cUSD Balance']
      balances[address].cEUR += row['cEUR Balance']
      balances[address].cREAL += row['cREAL Balance']
    }
  })

  await finished(parser)
}
