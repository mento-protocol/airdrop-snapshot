import { releaseGoldABI } from '@celo/abis/types/wagmi'
import ora from 'ora'
import path from 'path'
import type { Address } from 'viem'
import { ContractFunctionExecutionError, getContract } from 'viem'
import bold from '../../../helpers/bold.js'
import getBlockchainClient from '../../../helpers/get-blockchain-client.js'
import loadCsvFile from '../load-csv-file.js'

type ReleaseGoldSelfdestructEvent = [
  block_time: string,
  block_number: number,
  contract_address: `0x${string}`,
  tx_from: `0x${string}`,
  tx_hash: `0x${string}`
]

/**
 * Scans all contract addresses for ReleaseGold contracts
 * @returns An object mapping of ReleaseGold contract addresses to their beneficiaries
 */
export default async function getReleaseGoldContracts(
  contractAddresses: Set<Address>
) {
  const releaseGoldBeneficiaryMap: { [key: Address]: Address | string } = {}
  const publicClient = getBlockchainClient()

  const spinner = ora(
    `Scanning ${bold(
      contractAddresses.size
    )} addresses for ReleaseGold contracts`
  ).start()

  const releaseGoldSelfdestructEvents = await loadCsvFile<
    ReleaseGoldSelfdestructEvent[]
  >(
    path.resolve(
      `src/snapshots/locked-celo-balances/dune-input-snapshots/release-gold-selfdestruct-events.csv`
    )
  )

  let i = 1
  for (const address of contractAddresses) {
    spinner.suffixText = `[${i}/${contractAddresses.size}]`
    const ReleaseGold = getContract({
      address,
      abi: releaseGoldABI,
      publicClient,
    })

    try {
      const beneficiary = await ReleaseGold.read.beneficiary()
      releaseGoldBeneficiaryMap[address] = beneficiary
    } catch (error) {
      /**
       * `ContractFunctionExecutionError` is an expected error when the contract does not have a beneficiary() function
       * We only want to throw if the error is something unexpected
       */
      if (!(error instanceof ContractFunctionExecutionError)) {
        spinner.fail()
        throw error
      }

      // If the contract self-destructed, we can find the beneficiary from the self-destruct event
      const hasSelfdestructed = releaseGoldSelfdestructEvents.find(
        ([, , contractAddress]) => contractAddress === address
      )

      if (!!hasSelfdestructed) {
        releaseGoldBeneficiaryMap[address] = 'self-destructed; look up manually'
      }
    }

    i++
  }
  spinner.succeed()

  return releaseGoldBeneficiaryMap
}
