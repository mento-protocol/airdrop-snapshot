import { parse, Parser } from 'csv-parse'
import fs from 'fs'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import path from 'path'
import { Address } from 'viem'
import bold from '../../../helpers/bold.js'
import generateOutputCsv from '../generate-output-csv.js'
import type { LockedCeloBalances } from '../index.js'

const results: LockedCeloBalances = {}

export default async function addBeneficiaryColumnToSnapshot(
  contractAddresses: Set<`0x${string}`>,
  releaseGoldBeneficiaryMap: { [key: Address]: Address | string }
) {
  const snapshotFile = path.resolve(
    'src/snapshots/locked-celo-balances/total-average-locked-celo-across-all-snapshots.csv'
  )
  const spinner = ora(
    `Checking 'Beneficiary' column on ${path.basename(snapshotFile)}`
  ).start()

  // Skip file if 'Locked Celo in USD' column already exists in the CSV
  const csvData = fs.readFileSync(snapshotFile, 'utf8')
  if (csvData.includes('Beneficiary')) {
    spinner.succeed(
      `Skipping ${bold(
        path.basename(snapshotFile)
      )} — Already has "Beneficiary" column`
    )
  }

  // 2. Add 'Beneficiary' column
  try {
    spinner.text = `Adding 'Beneficiary' & 'Contract' columns to ${path.basename(
      snapshotFile
    )}`
    const parser = getParser(snapshotFile)
    parseFile(parser, contractAddresses, releaseGoldBeneficiaryMap)
    await finished(parser)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }

  // 3. Overwrite existing individual snapshot file augmented with beneficiary & contract columns
  generateOutputCsv(results, snapshotFile, 'total')
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

          case 'Average Locked Celo Balance':
          case 'Average Locked Celo in USD':
            return Number(value)
        }
      },
    })
  )
}

function parseFile(
  parser: Parser,
  contractAddresses: Set<`0x${string}`>,
  releaseGoldBeneficiaryMap: { [key: Address]: Address | string }
) {
  parser.on('readable', function () {
    let row: {
      Address: `0x${string}}`
      'Average Locked Celo Balance': number
      'Average Locked Celo in USD': number
    }

    while ((row = parser.read()) !== null) {
      const { Address: address } = row

      // If address hasn't been added to mapping yet, create it
      if (!results[address]) {
        results[address] = {
          total: 0,
          totalInUsd: 0,
          contract: '',
          beneficiary: '',
        }
      }

      results[address].total = row['Average Locked Celo Balance']
      results[address].totalInUsd = row['Average Locked Celo in USD']
      results[address].contract =
        contractAddresses.has(address) || releaseGoldBeneficiaryMap[address]
          ? 'Contract'
          : ''
      results[address].beneficiary = releaseGoldBeneficiaryMap[address] || ''
    }
  })
}
