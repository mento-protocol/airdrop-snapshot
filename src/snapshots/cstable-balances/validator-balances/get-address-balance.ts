import CUSD_ABI from './abis/cusd.js'
import CEUR_ABI from './abis/ceur.js'
import CREAL_ABI from './abis/creal.js'
import { getContract } from 'viem'
import getBlockchainClient from '../../../helpers/get-blockchain-client.js'
import type { Prices } from './types.js'
import type { CStableBalance } from '../types.js'

const CUSD_ADDRESS = '0x765de816845861e75a25fca122bb6898b8b1282a'
const CEUR_ADDRESS = '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73'
const CREAL_ADDRESS = '0xe8537a3d056da446677b9e9d6c5db704eaab4787'

// Initializing this once outside the function so we don't need to repeat this for every single address
const publicClient = getBlockchainClient()
const cUSD = getContract({
  address: CUSD_ADDRESS,
  abi: CUSD_ABI,
  publicClient,
})
const cEUR = getContract({
  address: CEUR_ADDRESS,
  abi: CEUR_ABI,
  publicClient,
})
const cREAL = getContract({
  address: CREAL_ADDRESS,
  abi: CREAL_ABI,
  publicClient,
})

export default async function getAddressBalance(
  address: `0x${string}`,
  blockNumber: bigint,
  prices: Prices
): Promise<CStableBalance> {
  const cUSDBalance = Number(
    await cUSD.read.balanceOf([address], {
      blockNumber,
    })
  )
  const cEURBalance = Number(
    await cEUR.read.balanceOf([address], {
      blockNumber,
    })
  )
  const cREALBalance = Number(
    await cREAL.read.balanceOf([address], {
      blockNumber,
    })
  )

  const cUSDinUSD = (cUSDBalance / 1e18) * prices.cUSD
  const cEURinUSD = (cEURBalance / 1e18) * prices.cEUR
  const cREALinUSD = (cREALBalance / 1e18) * prices.cREAL
  const total = cUSDinUSD + cEURinUSD + cREALinUSD

  const balance: CStableBalance = {
    total,
    cUSD: cUSDBalance / 1e18,
    cUSDinUSD,
    cEUR: cEURBalance / 1e18,
    cEURinUSD,
    cREAL: cREALBalance / 1e18,
    cREALinUSD,
  }

  return balance
}
