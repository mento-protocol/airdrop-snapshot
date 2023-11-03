import env from 'env-var'
import ora from 'ora'
import getClient from './getClient.js'
import bold from '../../helpers/bold.js'

const RPC_URL = env.get('RPC_URL').required().asUrlString()

/**
 * Helper function to get the block number for a specific date
 */
export default async function getBlockNumberForDate(
  targetDate: Date
): Promise<bigint> {
  const spinner = ora(
    `Fetching block number for ${bold(targetDate.toUTCString())}...`
  ).start()

  try {
    const client = getClient(RPC_URL)
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
          `Fetched block number for ${targetDate.toUTCString()}: ${bold(
            lowerBound.toString()
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
