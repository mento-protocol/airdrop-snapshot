import fs from 'node:fs/promises'
import type { Address } from 'viem'
import type { Allocations, AllocationsSplitByOwner } from './index.js'

export default async function generateFinalAllocationsCsv(
  normalAllocations: Allocations,
  safeAllocationsSplitAcrossOwners: AllocationsSplitByOwner
) {
  let result: Array<{ address: Address; allocation: BigInt }> = []

  Object.keys(normalAllocations).forEach((address) => {
    const allocation = normalAllocations[address as Address]
    result.push({
      address: address as Address,
      allocation: allocation * BigInt(1e18),
    })
  })

  Object.keys(safeAllocationsSplitAcrossOwners).forEach((address) => {
    const owners = safeAllocationsSplitAcrossOwners[address as Address].owners
    Object.entries(owners).forEach(([owner, allocation]) => {
      result.push({
        address: owner as Address,
        allocation: allocation * BigInt(1e18),
      })
    })
  })

  result.sort((a, b) => Number(b.allocation) - Number(a.allocation))

  const csvData =
    'Address,Allocation\n' +
    result.map((row) => `${row.address},${row.allocation}`).join('\n')

  await fs.writeFile(
    './final-snapshots/airdrop-amounts-per-address-after-safe-split.csv',
    csvData
  )
}
