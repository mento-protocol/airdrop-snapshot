// Our main object we'll use to sum up balances for each address across all snapshots
export type CStableBalances = {
  [address: string | `0x${string}`]: CStableBalance
}

export type CStableBalance = {
  total: number
  cUSDinUSD: number
  cEURinUSD: number
  cREALinUSD: number
  cUSD: number
  cEUR: number
  cREAL: number
}
