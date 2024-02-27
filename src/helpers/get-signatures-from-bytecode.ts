import { functionSelectors } from 'evmole'
import { Address } from 'viem'
import getBlockchainClient from './get-blockchain-client.js'

const address = process.argv[2] as Address

const client = getBlockchainClient()
const bytecode = await client.getBytecode({
  address,
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
