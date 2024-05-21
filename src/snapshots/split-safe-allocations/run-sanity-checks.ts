import { parse } from 'csv-parse'
import assert from 'node:assert'
import fs from 'node:fs'
import { finished } from 'node:stream/promises'
import ora from 'ora'
import { Address } from 'viem'
import findDuplicateKeys from '../../helpers/find-duplicate-keys.js'
import type { Allocations } from './index.js'

export default async function runSanityChecks(safeAddresses: Set<Address>) {
  const spinner = ora('Running sanity checks').start()
  const originalAllocations = await loadOriginalAllocations()
  const allocationsAfterSafeSplit = await loadAllocationsAfterSafeSplit()
  const safeOwners = await loadSafeOwners()

  findDuplicateKeysInOriginalAllocations(originalAllocations)

  ensureCorrectNoOfRecipients(
    originalAllocations,
    allocationsAfterSafeSplit,
    safeAddresses,
    safeOwners
  )

  await ensureAllSafeOwnersHaveAllocations(
    safeOwners,
    allocationsAfterSafeSplit
  )

  await ensureNoSafeContractAddressesHasAllocation(
    safeAddresses,
    allocationsAfterSafeSplit
  )

  await compareTotalAllocationBeforeAndAfterSplit(
    originalAllocations,
    allocationsAfterSafeSplit
  )
  spinner.succeed('Sanity checks passed!')
}

async function ensureAllSafeOwnersHaveAllocations(
  safeOwners: Set<string>,
  allocationsAfterSafeSplit: Allocations
) {
  for (const owner of safeOwners) {
    if (allocationsAfterSafeSplit[owner as Address] === undefined) {
      throw new Error(`Safe owner ${owner} has no allocation after safe split!`)
    }
  }
}

async function ensureNoSafeContractAddressesHasAllocation(
  safeAddresses: Set<string>,
  allocationsAfterSafeSplit: Allocations
) {
  for (const address of safeAddresses) {
    if (allocationsAfterSafeSplit[address as Address]) {
      throw new Error(
        `Safe address ${address} found in final allocations which should not be there!`
      )
    }
  }
}

async function compareTotalAllocationBeforeAndAfterSplit(
  originalAllocations: Allocations,
  allocationsAfterSafeSplit: Allocations
) {
  const totalTokensAllocatedOriginally = Object.values(
    originalAllocations
  ).reduce((acc, current) => acc + current, BigInt(0))

  const totalTokensAllocatedAfterSafeSplit = Object.values(
    allocationsAfterSafeSplit
  ).reduce((acc, current) => acc + current, BigInt(0))

  // For Debugging
  // console.log(
  //   '\nTotal tokens allocated originally:',
  //   bold((Number(totalTokensAllocatedOriginally) / 1e18).toLocaleString())
  // )
  // console.log(
  //   'Total tokens allocated after safe split:',
  //   bold((Number(totalTokensAllocatedAfterSafeSplit) / 1e18).toLocaleString()),
  //   '\n'
  // )

  // There's a tiny difference between the two totals due to rounding errors so we can't check for strict equality
  assert(
    totalTokensAllocatedAfterSafeSplit - totalTokensAllocatedOriginally <= 1n &&
      totalTokensAllocatedOriginally - totalTokensAllocatedAfterSafeSplit >=
        -1n,
    `\nTotal allocations after safe split don't match original allocations!\n
    Delta of 'Original Allocations — Post Safe Split Allocations': ${(
      Number(
        totalTokensAllocatedOriginally - totalTokensAllocatedAfterSafeSplit
      ) / 1e18
    ).toLocaleString()}\n`
  )
}

async function loadOriginalAllocations() {
  const originalAllocationsFilePath =
    './final-snapshots/airdrop-amounts-per-address.csv'

  const parser = fs
    .createReadStream(originalAllocationsFilePath)
    .pipe(parse({ columns: true }))

  const originalAllocations: Allocations = {}

  parser
    .on('readable', function () {
      let row
      while ((row = parser.read()) !== null) {
        originalAllocations[row['Address']] = BigInt(
          row['total_distributed'] * 1e18
        )
      }
    })
    .on('error', (error) => {
      console.error('Error while reading CSV file:', error)
    })

  await finished(parser)

  return originalAllocations
}

async function loadAllocationsAfterSafeSplit() {
  const allocationsAfterSafeSplitFilePath =
    './final-snapshots/final-allocations-in-wei.csv'

  const parser = fs
    .createReadStream(allocationsAfterSafeSplitFilePath)
    .pipe(parse({ columns: true }))

  const allocationsAfterSafeSplit: Allocations = {}

  parser
    .on('readable', function () {
      let row
      while ((row = parser.read()) !== null) {
        const address = row['Address'].toLowerCase()
        allocationsAfterSafeSplit[address] = BigInt(row['Allocation'])
      }
    })
    .on('error', (error) => {
      console.error('Error while reading CSV file:', error)
    })

  await finished(parser)

  return allocationsAfterSafeSplit
}

async function loadSafeOwners() {
  const safeOwners = new Set<string>()
  const parser = fs
    .createReadStream(
      './src/snapshots/split-safe-allocations/safe-allocations-split-by-owner.csv'
    )
    .pipe(parse({ columns: true }))

  parser
    .on('readable', function () {
      let row
      while ((row = parser.read()) !== null) {
        const address = row['Beneficiary'].toLowerCase()
        safeOwners.add(address)
      }
    })
    .on('error', (error) => {
      console.error('Error while parsing allocations from CSV:', error)
    })

  await finished(parser)

  return safeOwners
}
function findDuplicateKeysInOriginalAllocations(
  originalAllocations: Allocations
) {
  const duplicates = findDuplicateKeys(originalAllocations, true)

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate keys found in original allocations: ${duplicates.join(', ')}`
    )
  }
}
function ensureCorrectNoOfRecipients(
  originalAllocations: Allocations,
  allocationsAfterSafeSplit: Allocations,
  safeAddresses: Set<string>,
  safeOwners: Set<string>
) {
  const totalOriginalRecipients = Object.keys(originalAllocations).length
  const totalRecipientsPostSplit = Object.keys(allocationsAfterSafeSplit).length

  const safeOwnersAlreadyPresentInOriginalAllocations = Object.keys(
    originalAllocations
  ).filter((address) => {
    return safeOwners.has(address)
  }).length

  // For Debugging
  // console.log(
  //   '\nOriginal Recipients:',
  //   totalOriginalRecipients,
  //   '\nRecipients Post Split:',
  //   totalRecipientsPostSplit,
  //   '\nTotal Safe Addresses:',
  //   safeAddresses.size,
  //   '\nSafe Owner Addresses:',
  //   safeOwners.size,
  //   '\nSafe Owners in Original Allo:',
  //   safeOwnersAlreadyPresentInOriginalAllocations
  // )

  assert(
    totalOriginalRecipients -
      safeAddresses.size +
      safeOwners.size -
      safeOwnersAlreadyPresentInOriginalAllocations ===
      totalRecipientsPostSplit,
    'Number of recipients after safe split looks wrong!'
  )
}
