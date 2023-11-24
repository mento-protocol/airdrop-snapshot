import ora from 'ora'
import getClient from './get-blockchain-client.js'
import bold from './bold.js'

/**
 * Get the block number for a specific date
 */
export default async function getBlockNumberForDate(
  targetDate: Date
): Promise<bigint> {
  const spinner = ora(
    `Fetching block number for ${targetDate.toUTCString()}:`
  ).start()

  try {
    const client = getClient()
    let lowerBound = BigInt(0)
    let upperBound = await client.getBlockNumber()
    let currentDate: Date

    while (lowerBound <= upperBound) {
      const middleBlockNumber =
        lowerBound + (upperBound - lowerBound) / BigInt(2)
      const middleBlock = await client.getBlock({
        blockNumber: BigInt(middleBlockNumber),
      })

      currentDate = new Date(Number(middleBlock.timestamp) * 1000) // Convert to milliseconds

      if (currentDate < targetDate) {
        lowerBound = middleBlockNumber + BigInt(1)
      } else if (currentDate > targetDate) {
        upperBound = middleBlockNumber - BigInt(1)
      } else {
        spinner.suffixText = bold(lowerBound.toString())
        spinner.succeed()
        return middleBlockNumber
      }
    }

    spinner.suffixText = bold(lowerBound.toString())
    spinner.succeed()

    return lowerBound
  } catch (error) {
    spinner.fail()
    throw error
  }
}
