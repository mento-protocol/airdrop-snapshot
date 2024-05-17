import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import type { Address } from 'viem'
import type { AllocationsSplitByOwner } from './index.js'

export default async function generateSafeAllocationsCsv(
  allocations: AllocationsSplitByOwner,
  outputPath: string
) {
  const spinner = ora(
    `Writing SAFE celo balances to ${path.basename(outputPath)}`
  ).start()
  try {
    let csvData = 'SAFE Address,Beneficiary,Allocation\n'

    Object.keys(allocations).forEach((safe) => {
      csvData += Object.entries(allocations[safe as Address].owners)
        .map(([owner, allocation]) => `${safe},${owner},${allocation}\n`)
        .join('\n')
    })

    // Remove empty lines
    const cleanedCsvData = csvData
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')

    await fs.writeFile(outputPath, cleanedCsvData)

    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}
