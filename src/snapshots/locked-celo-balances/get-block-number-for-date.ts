import ora from 'ora'
import getClient from './get-client.js'
import bold from '../../helpers/bold.js'

/**
 * Get the block number for a specific date
 */
export default async function getBlockNumberForDate(
  targetDate: Date
): Promise<bigint> {
  const spinner = ora(
    `Fetching block number for ${bold(targetDate.toUTCString())}...`
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
        spinner.succeed(
          `Fetched block number ${bold(lowerBound.toString())} for ${bold(
            targetDate.toUTCString()
          )}`
        )
        return middleBlockNumber
      }
    }

    spinner.succeed(
      `Fetched block number for ${targetDate.toUTCString()}: ${bold(
        lowerBound.toString()
      )}`
    )

    return lowerBound
  } catch (error) {
    spinner.fail(`Couldn't fetch block number for ${targetDate.toUTCString()}`)
    throw error
  }
}
