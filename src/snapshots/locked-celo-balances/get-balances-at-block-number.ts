import ora from 'ora'
import type { Address } from 'viem'
import { formatEther, getContract } from 'viem'
import bold from '../../helpers/bold.js'
import getClient from '../../helpers/get-blockchain-client.js'
import type { LockedCeloBalances } from './index.js'
import LockedCeloAbi from './locked-celo-abi.js'

const LOCKED_CELO_PROXY = '0x6cc083aed9e3ebe302a6336dbc7c921c9f03349e'

/**
 * Fetches LockedCelo balances at a past block from an archive node
 */
export default async function getBalancesAtBlockNumber(
  addresses: Address[],
  blockNumber: bigint
): Promise<LockedCeloBalances> {
  const spinner = ora(
    `Fetching locked Celo balance for ${bold(
      String(addresses.length)
    )} addresses from archive node at block ${bold(String(blockNumber))}...`
  ).start()

  // Our main object we want to populate with LockedCelo balances on a given snapshot date
  const balances: LockedCeloBalances = {}

  try {
    for (let i = 0; i < addresses.length; i++) {
      // Adds a counter to the CLI output as a progress indicator
      spinner.suffixText = `${(i + 1).toString()} / ${addresses.length}`

      const address = addresses[i]
      const balance = await getLockedCeloBalanceForBlock(address, blockNumber)
      balances[address].total = Number(balance)
      if (process.env.DEBUG) {
        console.log(
          Number(formatEther(balance)).toLocaleString('en-us', {
            maximumFractionDigits: 2,
          })
        )
      }
    }
    spinner.succeed(
      `Fetched all ${bold(
        String(addresses.length)
      )} balances at block number ${bold(blockNumber.toString())}`
    )
    spinner.suffixText = ''

    return balances
  } catch (error) {
    spinner.fail(
      `Failed to fetch balances for block number ${bold(
        blockNumber.toString()
      )}`
    )
    throw error
  }
}

async function getLockedCeloBalanceForBlock(
  address: Address,
  blockNumber: bigint
): Promise<bigint> {
  const LockedCelo = getContract({
    address: LOCKED_CELO_PROXY,
    abi: LockedCeloAbi,
    publicClient: getClient(),
  })

  const rawBalance = await LockedCelo.read.getAccountTotalLockedGold(
    [address],
    {
      blockNumber,
    }
  )

  return rawBalance
}
