import { functionSelectors } from 'evmole'
import getBlockchainClient from './get-blockchain-client.js'

const UNVERIFIED_CONTRACT_ADDRESS = '0xc97e88e4803775e87701eedf5bdef8f4a9c89876'

const client = getBlockchainClient()
const bytecode = await client.getBytecode({
  address: UNVERIFIED_CONTRACT_ADDRESS,
})

const selectors = functionSelectors(bytecode)
const textSignatures = []
for (const selector of selectors) {
  textSignatures.push(
    await fetch(
      `https://www.4byte.directory/api/v1/signatures/\?hex_signature\=${selector}`
    )
      .then((res) => res.json())
      .then((res) => res.results)
  )
}

console.log(textSignatures)
