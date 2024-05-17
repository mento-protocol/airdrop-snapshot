import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import type { Address } from 'viem'

export default async function findSafeAddresses() {
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
    console.log(`Loading SAFE addresses from ${filePath}...`)

    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }))

    parser
      .on('readable', function () {
        let row
        while ((row = parser.read()) !== null) {
          if (row['Contract'] === 'Gnosis Safe') {
            safeAddresses.add(row['Address'])
          }
        }
      })
      .on('end', () => {
        return
      })
      .on('error', (error) => {
        console.error('Error while reading CSV file:', error)
      })

    await finished(parser)
  }

  console.log('SAFE Addresses loaded:', safeAddresses.size)

  return safeAddresses
}
