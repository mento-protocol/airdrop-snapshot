import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'

export default function getClient(rpcUrl: string) {
  const client = createPublicClient({
    chain: celo,
    transport: http(rpcUrl),
  })

  return client
}
