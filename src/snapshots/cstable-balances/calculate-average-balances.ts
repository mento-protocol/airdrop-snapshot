import type { Balances } from './index.ts'

// Returns the average balances calculated as total balances / 12 snapshots
export default function calculateAverageBalances(balances: Balances) {
  return Object.fromEntries(
    Object.entries(balances).map(([address, bal]) => {
      return [
        address,
        {
          total: bal.total / 12,
          cUSDinUSD: bal.cUSDinUSD / 12,
          cEURinUSD: bal.cEURinUSD / 12,
          cREALinUSD: bal.cREALinUSD / 12,
          cUSD: bal.cUSD / 12,
          cEUR: bal.cEUR / 12,
          cREAL: bal.cREAL / 12,
        },
      ]
    })
  )
}
