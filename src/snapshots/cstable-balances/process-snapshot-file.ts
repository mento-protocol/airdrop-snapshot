import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { parse } from 'csv-parse'
import type { Balances } from './index.js'

export default async function processSnapshotFile(
  file: string,
  balances: Balances
) {
  console.log('Processing snapshot:', path.basename(file))
  const parser = fs.createReadStream(file).pipe(
    parse({
      columns: true,
      cast: (value, context) => {
        // Don't transform header row and address column
        if (context.header || context.column === 'Address') {
          return value
        }

        // All other columns should be numbers
        return Number(value)
      },
    })
  )

  parser.on('readable', function () {
    let row: {
      Address: string
      'Total cStables in USD': number
      'cUSD in USD': number
      'cEUR in USD': number
      'cREAL in USD': number
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
