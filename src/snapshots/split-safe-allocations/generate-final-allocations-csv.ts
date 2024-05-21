import fs from 'node:fs/promises'
import type { Address } from 'viem'
import type { Allocations, AllocationsSplitByOwner } from './index.js'

export default async function generateFinalAllocationsCsv(
  normalAllocations: Allocations,
  safeAllocationsSplitAcrossOwners: AllocationsSplitByOwner
) {
  const finalAllocations: Allocations = {}

  Object.keys(normalAllocations).forEach((_address) => {
    const address = _address.toLowerCase() as Address
    const allocation = normalAllocations[address]
    if (finalAllocations[address]) {
      finalAllocations[address] += allocation
    } else {
      finalAllocations[address] = allocation
    }
  })

  Object.keys(safeAllocationsSplitAcrossOwners).forEach((address) => {
    const owners = safeAllocationsSplitAcrossOwners[address as Address].owners
    Object.entries(owners).forEach(([_owner, allocation]) => {
      const owner = _owner.toLowerCase() as Address
      if (finalAllocations[owner]) {
        finalAllocations[owner] += allocation
      } else {
        finalAllocations[owner] = allocation
      }
    })
  })

  const sortedEntries = Object.entries(finalAllocations).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  )
  const sortedAllocations = Object.fromEntries(sortedEntries)

  const csvData =
    'Address,Allocation\n' +
    Object.entries(sortedAllocations)
      .map((row) => `${row[0]},${row[1]}`)
      .join('\n')

  await fs.writeFile('./final-snapshots/final-allocations-in-wei.csv', csvData)
}
