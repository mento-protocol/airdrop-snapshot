import snapshots from '../snapshots.js'
import type { CStableBalances } from './types.js'

// Returns the average balances calculated as total balances / snapshots.length
export default function calculateAverageBalances(
  balances: CStableBalances
): CStableBalances {
  return Object.fromEntries(
    Object.entries(balances).map(([address, balance]) => {
      return [
        address,
        {
          total: balance.total / snapshots.length,
          contract: balance.contract,
          beneficiary: balance.beneficiary,
          cUSDinUSD: balance.cUSDinUSD / snapshots.length,
          cEURinUSD: balance.cEURinUSD / snapshots.length,
          cREALinUSD: balance.cREALinUSD / snapshots.length,
          cUSD: balance.cUSD / snapshots.length,
          cEUR: balance.cEUR / snapshots.length,
          cREAL: balance.cREAL / snapshots.length,
        },
      ]
    })
  )
}
