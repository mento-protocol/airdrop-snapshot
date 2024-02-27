import ora from 'ora'
import type { Address } from 'viem'
import bold from '../../../helpers/bold.js'
import getBlockNumberForDate from '../../../helpers/get-block-number-for-date.js'
import type { Snapshot } from '../../snapshots.js'
import type { CStableBalances } from '../types.js'
import getAddressBalance from './get-address-balance.js'

export default async function getAllBalancesFor(
  addresses: Address[],
  snapshot: Snapshot,
  type: 'validators' | 'validator-groups'
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
        type,
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
