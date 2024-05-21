import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import type { Address } from 'viem'
import bold from '../../helpers/bold.js'

export default async function findSafeAddresses() {
  const spinner = ora('Finding SAFE addresses in snapshots').start()
  // Init empty set to store SAFE addresses in
  const safeAddresses = new Set<Address>()

  const snapshotFiles = [
    'cstable-balances.csv',
    'cstable-volume.csv',
    'locked-celo-balances.csv',
    'stcelo-balances.csv',
  ]

  for (const file of snapshotFiles) {
    const filePath = path.join('./final-snapshots', file)
    spinner.text = `Loading SAFE addresses from ${filePath}...`

    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }))

    parser
      .on('readable', function () {
        let row
        while ((row = parser.read()) !== null) {
          if (row['Contract'] === 'Gnosis Safe') {
            safeAddresses.add(row['Address'].toLowerCase())
          }
        }
      })
      .on('error', (error) => {
        console.error('Error while reading CSV file:', error)
        spinner.fail()
      })

    await finished(parser)
  }

  spinner.succeed(
    `SAFE Addresses found in snapshot CSVs: ${bold(safeAddresses.size)}`
  )

  return safeAddresses
}
