import ora from 'ora'
import bold from '../../helpers/bold.js'
import type { Snapshot } from './types.js'
import getAddressBalance from './get-address-balance.js'
import getBlockNumberForDate from '../../helpers/get-block-number-for-date.js'
import type { CStableBalances } from '../cstable-balances/types.js'

export default async function getAllBalancesFor(
  addresses: Array<`0x${string}`>,
  snapshot: Snapshot
): Promise<CStableBalances> {
  const blockNumber = await getBlockNumberForDate(snapshot.date)
  const spinner = ora(
    `Fetching validator balances at block ${bold(
      blockNumber.toString()
    )} from archive node:`
  ).start()

  const balances: CStableBalances = {}

  try {
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      spinner.suffixText = `${(i + 1).toString()} / ${addresses.length}`
      balances[address] = await getAddressBalance(
        address,
        blockNumber,
        snapshot.pricesInUsd
      )
    }

    spinner.succeed()
    return balances
  } catch (error) {
    spinner.fail()
    throw error
  }
}
