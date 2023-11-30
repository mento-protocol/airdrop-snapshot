import path from 'node:path'
import type { Address } from 'viem'
import fileExists from '../../../helpers/file-exists.js'
import getContractAddresses from './get-contract-addresses.js'
import getReleaseGoldContracts from './get-release-gold-contracts.js'
import insertBeneficiaryAddressesIntoOutputSnapshot from './insert-beneficiary-addresses-into-output-snapshot.js'
import loadReleaseGoldAddressesFromCsv from './load-release-gold-addresses-from-csv.js'
import writeReleaseGoldAddressesToCsv from './write-release-gold-addresses-to-csv.js'

// Important, otherwise manual process termination will not work via `Ctrl + C` while scanning addresses for ReleaseGold contracts
process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...')
  process.exit(1)
})

const releaseGoldFile = path.resolve('src/snapshots/release-gold-addresses.csv')
let releaseGoldBeneficiaryMap: { [key: Address]: Address } = {}

if (await fileExists(releaseGoldFile)) {
  releaseGoldBeneficiaryMap = await loadReleaseGoldAddressesFromCsv(
    releaseGoldFile
  )
} else {
  const contractAddresses = await getContractAddresses()
  releaseGoldBeneficiaryMap = await getReleaseGoldContracts(contractAddresses)
  await writeReleaseGoldAddressesToCsv(releaseGoldBeneficiaryMap)
}

await insertBeneficiaryAddressesIntoOutputSnapshot(releaseGoldBeneficiaryMap)
