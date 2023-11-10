import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { Parser, parse } from 'csv-parse'
import type { CStableBalances } from '../snapshots/cstable-balances/types.js'
import sortBalancesByTotal from '../snapshots/cstable-balances/sort-balances-by-total.js'
import generateOutputCsv from '../snapshots/cstable-balances/generate-output-csv.js'

const mergedBalances: CStableBalances = {}

export default async function mergeCsvs(
  originalContentFilePath: string = path.resolve(
    'final-snapshots/cstable-balances.csv'
  ),
  newContentFilePath: string = path.resolve(
    'src/snapshots/cstable-balances-for-validators/cstable-balances-for-validator-groups.csv'
  )
) {
  const parserOriginalFile = getParser(originalContentFilePath)
  parseFile(parserOriginalFile)
  await finished(parserOriginalFile)

  const parserNewContent = getParser(newContentFilePath)
  parseFile(parserNewContent)
  await finished(parserNewContent)

  const sortedMergedBalances = sortBalancesByTotal(mergedBalances)
  generateOutputCsv(sortedMergedBalances, originalContentFilePath)
}

function getParser(filePath: string) {
  return fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      cast: (value, context) => {
        if (context.header) {
          return value
        }

        switch (context.column) {
          case 'Address':
            return value

          case 'Snapshot Date':
            return new Date(value.replace('12-00', '12:00 UTC'))

          default:
            return Number(value)
        }
      },
    })
  )
}

function parseFile(parser: Parser) {
  parser.on('readable', function () {
    let row: {
      Address: string
      'Average Total cStables in USD': number
      'Average cUSD in USD': number
      'Average cEUR in USD': number
      'Average cREAL in USD': number
      'Average cUSD Balance': number
      'Average cEUR Balance': number
      'Average cREAL Balance': number
    }

    while ((row = parser.read()) !== null) {
      const { Address: address } = row

      // If address hasn't been added to mapping yet, create it
      if (!mergedBalances[address]) {
        mergedBalances[address] = {
          total: 0,
          cUSDinUSD: 0,
          cEURinUSD: 0,
          cREALinUSD: 0,
          cUSD: 0,
          cEUR: 0,
          cREAL: 0,
        }
      }

      mergedBalances[address].total = row['Average Total cStables in USD']
      mergedBalances[address].cUSDinUSD = row['Average cUSD in USD']
      mergedBalances[address].cEURinUSD = row['Average cEUR in USD']
      mergedBalances[address].cREALinUSD = row['Average cREAL in USD']
      mergedBalances[address].cUSD = row['Average cUSD Balance']
      mergedBalances[address].cEUR = row['Average cEUR Balance']
      mergedBalances[address].cREAL = row['Average cREAL Balance']
    }
  })
}

await mergeCsvs()
