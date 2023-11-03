import env from 'env-var'
import ora from 'ora'
import { formatEther, getContract } from 'viem'
import LockedCeloAbi from './LockedCeloAbi.js'
import getClient from './getClient.js'
import bold from '../../helpers/bold.js'

const RPC_URL = env.get('RPC_URL').required().asUrlString()
const LOCKED_CELO_PROXY = '0x6cc083aed9e3ebe302a6336dbc7c921c9f03349e'

export type Balances = {
  [address: string]: bigint
}

export default async function getBalancesAtBlockNumber(
  addresses: Array<`0x${string}`>,
  blockNumber: bigint
): Promise<Balances> {
  const spinner = ora(
    `Fetching locked Celo balance for ${bold(
      String(addresses.length)
    )} addresses from archive node at block ${bold(String(blockNumber))}...`
  ).start()

  // Our main object we want to populate with LockedCelo balances on a given snapshot date
  const balances: Balances = {}

  try {
    for (let i = 0; i < addresses.length; i++) {
      // Adds a counter to the CLI output as a progress indicator
      spinner.suffixText = `${(i + 1).toString()} / ${addresses.length}`

      const address = addresses[i]
      const balance = await getLockedCeloBalanceForBlock(address, blockNumber)
      balances[address] = balance
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
  address: `0x${string}`,
  blockNumber: bigint
): Promise<bigint> {
  const LockedCelo = getContract({
    address: LOCKED_CELO_PROXY,
    abi: LockedCeloAbi,
    publicClient: getClient(RPC_URL),
  })

  const rawBalance = await LockedCelo.read.getAccountTotalLockedGold(
    [address],
    {
      blockNumber,
    }
  )

  return rawBalance
}
