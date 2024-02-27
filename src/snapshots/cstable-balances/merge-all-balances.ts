import { Parser, parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import type { Address } from 'viem'
import loadCsvFile from '../../helpers/load-csv-file.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import generateOutputCsv from './generate-output-csv.js'
import type { CStableBalances } from './types.js'

const mergedBalances: CStableBalances = {}

async function mergeAllBalances() {
  // Load releaseGold addresses to check snapshot addresses against
  const releaseGoldCsv = await loadCsvFile<
    Array<[releaseGoldAddress: Address, beneficiaryAddress: Address]>
  >(`${process.cwd()}/src/snapshots/release-gold-addresses.csv`)

  const finalOutputSnapshotFile: string = path.resolve(
    'final-snapshots/cstable-balances.csv'
  )
  const originalBalancesSnapshot: string = path.resolve(
    'src/snapshots/cstable-balances/total-average-across-all-snapshots-excluding-validators.csv'
  )
  const validatorBalancesSnapshot: string = path.resolve(
    'src/snapshots/cstable-balances/validator-balances/cstable-balances-for-validators.csv'
  )
  const validatorGroupBalancesSnapshot: string = path.resolve(
    'src/snapshots/cstable-balances/validator-balances/cstable-balances-for-validator-groups.csv'
  )
  const parserOriginalSnapshot = getParser(originalBalancesSnapshot)
  parseFile(parserOriginalSnapshot, releaseGoldCsv)
  await finished(parserOriginalSnapshot)

  const parserValidatorSnapshot = getParser(validatorBalancesSnapshot)
  parseFile(parserValidatorSnapshot, releaseGoldCsv)
  await finished(parserValidatorSnapshot)

  const parserValidatorGroupSnapshot = getParser(validatorGroupBalancesSnapshot)
  parseFile(parserValidatorGroupSnapshot, releaseGoldCsv)
  await finished(parserValidatorGroupSnapshot)

  const sortedMergedBalances = sortByTotal(mergedBalances) as CStableBalances
  generateOutputCsv(sortedMergedBalances, finalOutputSnapshotFile)
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
          case 'Beneficiary':
          case 'Contract':
            return value

          case 'Snapshot Time':
            return new Date(value.replace('12pm', '12:00 UTC'))

          default:
            return Number(value)
        }
      },
    })
  )
}

function parseFile(parser: Parser, releaseGoldCsv: Array<[Address, Address]>) {
  parser.on('readable', function () {
    let row: {
      Address: Address
      Contract: string
      Beneficiary: string
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

      const isReleaseGoldAddress = releaseGoldCsv.find(
        ([releaseGoldAddress]) => {
          return releaseGoldAddress === address
        }
      )

      mergedBalances[address].total = row['Average Total cStables in USD']
      mergedBalances[address].contract = row['Contract']
      mergedBalances[address].beneficiary = isReleaseGoldAddress
        ? isReleaseGoldAddress[1]
        : ''
      mergedBalances[address].cUSDinUSD = row['Average cUSD in USD']
      mergedBalances[address].cEURinUSD = row['Average cEUR in USD']
      mergedBalances[address].cREALinUSD = row['Average cREAL in USD']
      mergedBalances[address].cUSD = row['Average cUSD Balance']
      mergedBalances[address].cEUR = row['Average cEUR Balance']
      mergedBalances[address].cREAL = row['Average cREAL Balance']
    }
  })
}

await mergeAllBalances()
