import { parse } from 'csv-parse'
import fs from 'node:fs'
import { finished } from 'node:stream/promises'
import type { Address } from 'viem'
import bold from '../../helpers/bold.js'
import type { Allocations } from './index.js'

// Load and split allocations into two sets: normal and safe addresses
export default async function getAllocationsForAddresses(
  safeAddresses: Set<Address>
) {
  const normalAllocations: Allocations = {}
  const safeAllocations: Allocations = {}

  const parser = fs
    .createReadStream('./final-snapshots/airdrop-amounts-per-address.csv')
    .pipe(parse({ columns: true }))

  parser
    .on('readable', function () {
      let row
      while ((row = parser.read()) !== null) {
        const address = row['Address'].toLowerCase()
        const allocation = BigInt(row['total_distributed'] * 1e18)
        if (safeAddresses.has(row['Address'])) {
          safeAllocations[address] = allocation
        } else {
          normalAllocations[address] = allocation
        }
      }
    })
    .on('error', (error) => {
      console.error('Error while parsing allocations from CSV:', error)
    })

  await finished(parser)

  const totalNormalAllocations = getTotalAllocations(normalAllocations)
  const totalSafeAllocations = getTotalAllocations(safeAllocations)

  console.log(
    bold(
      `\nTotal Normal Allocations: ${totalNormalAllocations.toLocaleString()}`
    )
  )
  console.log(
    bold(`Total Safe Allocations: ${totalSafeAllocations.toLocaleString()}\n`)
  )

  return { normalAllocations, safeAllocations }
}

function getTotalAllocations(allocations: Allocations) {
  const total = Object.values(allocations).reduce(
    (total, allocation) => total + allocation,
    BigInt(0)
  )

  return Number(total) / 1e18
}
