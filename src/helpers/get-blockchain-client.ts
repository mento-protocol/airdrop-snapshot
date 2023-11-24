import env from 'env-var'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'

const RPC_URL = env.get('RPC_URL').required().asUrlString()

/**
 * Creates a viem client
 */
export default function getBlockchainClient() {
  const client = createPublicClient({
    chain: celo,
    transport: http(RPC_URL),
  })

  return client
}
