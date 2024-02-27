import type { Address } from 'viem'

// Our main object we'll use to sum up balances for each address across all snapshots
export type CStableBalances = {
  [address: Address]: CStableBalance
}

export type CStableBalance = {
  total: number
  contract: string
  beneficiary: string
  cUSDinUSD: number
  cEURinUSD: number
  cREALinUSD: number
  cUSD: number
  cEUR: number
  cREAL: number
}
