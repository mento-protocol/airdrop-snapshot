import type { Address } from 'viem'
import findSafeAddresses from './find-safe-addresses.js'
import generateFinalAllocationsCsv from './generate-final-allocations-csv.js'
import getAllocationsForAddresses from './get-allocations-for-addresses.js'
import runSanityChecks from './run-sanity-checks.js'
import splitAllocationsAcrossOwners from './split-allocations-across-owners.js'

type OwnerAddress = Address
type SafeAddress = Address
export type Allocations = Record<Address, bigint>
export type AllocationsTotal = Record<SafeAddress, bigint>
export type AllocationsSplitByOwner = Record<
  SafeAddress,
  {
    owners: Record<OwnerAddress, bigint>
  }
>

const safeAddresses = await findSafeAddresses()
const { normalAllocations, safeAllocations } = await getAllocationsForAddresses(
  safeAddresses
)

// For debugging purposes, only process the first entry to save time
// const firstEntry = Object.entries(safeAllocations).slice(1)[0]
const safeAllocationsSplitAcrossOwners = await splitAllocationsAcrossOwners(
  // For debugging purposes, only process the first entry to save time
  // { [firstEntry[0]]: firstEntry[1] }
  safeAllocations
)

// Iterate over safeAddress with split allocations and insert them into the final-snapshots/final-allocations-in-wei.csv
await generateFinalAllocationsCsv(
  normalAllocations,
  safeAllocationsSplitAcrossOwners
)

// Assert that after splitting safe allocations across owners, the sum of all allocations is still equal to the initial total airdrop amount
await runSanityChecks(safeAddresses)
