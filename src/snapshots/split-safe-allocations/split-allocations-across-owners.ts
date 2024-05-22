import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import { Address, getContract } from 'viem'
import fileExists from '../../helpers/file-exists.js'
import getClient from '../../helpers/get-blockchain-client.js'
import generateSafeAllocationsCsv from './generate-safe-allocations-csv.js'
import type { AllocationsSplitByOwner, AllocationsTotal } from './index.js'
import SafeAbi from './safe-abi.js'

export default async function splitAllocationsAcrossOwners(
  safeAddressesWithAllocations: AllocationsTotal
): Promise<AllocationsSplitByOwner> {
  // exit early if we already cached safe owners into a file
  const cachedSafeOwnersFilePath = path.resolve(
    './src/snapshots/split-safe-allocations/safe-allocations-split-by-owner.csv'
  )
  if (await fileExists(cachedSafeOwnersFilePath)) {
    return await loadOwnersForSafeFromCsv(cachedSafeOwnersFilePath)
  } else {
    const safeAllocationsSplitAcrossOwners = await loadOwnersForSafeFromOnchain(
      safeAddressesWithAllocations
    )
    await generateSafeAllocationsCsv(
      safeAllocationsSplitAcrossOwners,
      './src/snapshots/split-safe-allocations/safe-allocations-split-by-owner.csv'
    )

    return safeAllocationsSplitAcrossOwners
  }
}

async function loadOwnersForSafeFromOnchain(
  safeAddressesWithAllocations: AllocationsTotal
) {
  const safeAddressesWithSplitAllocations: AllocationsSplitByOwner = {}
  for (const [_safeAddress, allocationTotal] of Object.entries(
    safeAddressesWithAllocations
  )) {
    const safeAddress = _safeAddress.toLowerCase() as Address
    const owners = await getOwnersForSafeAddress(safeAddress as Address)

    // We don't need that much precision here so using lossy JS Number math should be ok
    const allocationPerOwner = allocationTotal / BigInt(owners.length)

    for (const _owner of owners) {
      const owner = _owner.toLowerCase() as Address
      if (!safeAddressesWithSplitAllocations[safeAddress]) {
        safeAddressesWithSplitAllocations[safeAddress] = {
          owners: {},
        }
      }

      safeAddressesWithSplitAllocations[safeAddress].owners[owner] =
        allocationPerOwner
    }
  }

  return safeAddressesWithSplitAllocations
}

async function getOwnersForSafeAddress(
  _safeAddress: Address
): Promise<Address[]> {
  const safeAddress = _safeAddress.toLowerCase() as Address
  const spinner = ora(`Fetching SAFE owners for ${safeAddress}`).start()

  let owners: Address[]
  try {
    const Safe = getContract({
      address: safeAddress,
      abi: SafeAbi,
      publicClient: getClient(),
    })

    // Array.from() necessary because getOwners() returns a readonly array which TypeScript doesn't like
    owners = Array.from(await Safe.read.getOwners())
  } catch (error) {
    spinner.fail(`Failed to fetch owners for ${safeAddress}`)

    throw error
  }

  spinner.succeed(`Fetched ${owners.length} owners for ${safeAddress}`)

  return owners
}

async function loadOwnersForSafeFromCsv(
  filePath: string
): Promise<AllocationsSplitByOwner> {
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }))

  const allocations: AllocationsSplitByOwner = {}

  parser
    .on('readable', function () {
      let row
      while ((row = parser.read()) !== null) {
        const safeAddress = row['SAFE Address'].toLowerCase()
        const ownerAddress = row['Beneficiary'].toLowerCase()
        if (!allocations[safeAddress]) {
          allocations[safeAddress] = { owners: {} }
        }

        allocations[safeAddress].owners[ownerAddress] = BigInt(
          row['Allocation']
        )
      }
    })
    .on('error', (error) => {
      console.error('Error while reading CSV file:', error)
    })

  await finished(parser)

  return allocations
}
