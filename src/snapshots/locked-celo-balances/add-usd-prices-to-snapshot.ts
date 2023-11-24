import type { LockedCeloBalances } from './index.js'
import type { Snapshot } from '../snapshots.js'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import { finished } from 'node:stream/promises'
import { Parser, parse } from 'csv-parse'
import generateOutputCsv from './generate-output-csv.js'
import snapshots from '../snapshots.js'
import transformDateToFilename from '../../helpers/transform-date-to-filename.js'
import bold from '../../helpers/bold.js'

const lockedCeloBalances: LockedCeloBalances = {}

async function addLockedCeloInUsdColumnToSnapshot() {
  // 1. Iterate over all snapshots
  for (const snapshot of snapshots) {
    const snapshotFile = path.resolve(
      `src/snapshots/locked-celo-balances/on-chain-output-snapshots/${transformDateToFilename(
        snapshot.date
      )}.out.csv`
    )
    const spinner = ora(`Processing ${path.basename(snapshotFile)}`).start()

    // Skip file if 'Locked Celo in USD' column already exists in the CSV
    const csvData = fs.readFileSync(snapshotFile, 'utf8')
    if (csvData.includes('Locked Celo in USD')) {
      spinner.succeed(
        `Skipping ${bold(
          path.basename(snapshotFile)
        )} — Already has "Locked Celo in USD" column`
      )
      continue
    }

    // 2. Add 'Locked Celo in USD' column to each snapshot
    try {
      const parser = getParser(snapshotFile)
      parseFile(parser, snapshot)
      await finished(parser)
      spinner.succeed()
    } catch (error) {
      spinner.fail()
      throw error
    }

    // 3. Overwrite existing individual snapshot file augmented with USD prices
    generateOutputCsv(lockedCeloBalances, snapshotFile, 'individual')
  }
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

          case 'Locked Celo Balance':
            return Number(value)

          case 'Snapshot Date':
            return new Date(value.replace('12-00', '12:00 UTC'))
        }
      },
    })
  )
}

function parseFile(parser: Parser, snapshot: Snapshot) {
  parser.on('readable', function () {
    let row: {
      Address: `0x${string}}`
      'Locked Celo Balance': number
      'Snapshot Date': Date
    }

    while ((row = parser.read()) !== null) {
      const { Address: address } = row

      // If address hasn't been added to mapping yet, create it
      if (!lockedCeloBalances[address]) {
        lockedCeloBalances[address] = {
          total: 0,
          totalInUsd: 0,
        }
      }

      lockedCeloBalances[address].total = row['Locked Celo Balance'] / 1e18
      lockedCeloBalances[address].totalInUsd =
        (row['Locked Celo Balance'] / 1e18) * snapshot.pricesInUsd.celo
    }
  })
}

await addLockedCeloInUsdColumnToSnapshot()
