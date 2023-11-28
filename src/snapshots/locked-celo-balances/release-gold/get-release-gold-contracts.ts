import { releaseGoldABI } from '@celo/abis/types/wagmi'
import ora from 'ora'
import type { Address } from 'viem'
import { ContractFunctionExecutionError, getContract } from 'viem'
import bold from '../../../helpers/bold.js'
import getBlockchainClient from '../../../helpers/get-blockchain-client.js'

/**
 * Scans all contract addresses for ReleaseGold contracts
 * @returns An object mapping of ReleaseGold contract addresses to their beneficiaries
 */
export default async function getReleaseGoldContracts(
  contractAddresses: Set<Address>
) {
  const releaseGoldBeneficiaryMap: { [key: Address]: Address } = {}
  const publicClient = getBlockchainClient()

  const spinner = ora(
    `Scanning ${bold(
      contractAddresses.size
    )} addresses for ReleaseGold contracts`
  ).start()

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
    }
    i++
  }
  spinner.succeed()

  return releaseGoldBeneficiaryMap
}
