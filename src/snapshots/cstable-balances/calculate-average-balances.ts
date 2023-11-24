import type { CStableBalances } from './types.js'

// Returns the average balances calculated as total balances / 12 snapshots
export default function calculateAverageBalances(
  balances: CStableBalances
): CStableBalances {
  return Object.fromEntries(
    Object.entries(balances).map(([address, balance]) => {
      return [
        address,
        {
          total: balance.total / 12,
          cUSDinUSD: balance.cUSDinUSD / 12,
          cEURinUSD: balance.cEURinUSD / 12,
          cREALinUSD: balance.cREALinUSD / 12,
          cUSD: balance.cUSD / 12,
          cEUR: balance.cEUR / 12,
          cREAL: balance.cREAL / 12,
        },
      ]
    })
  )
}
