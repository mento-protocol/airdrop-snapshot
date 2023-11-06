import type { LockedCeloBalances } from './index.js'

/**
 * Sort balances by total highest to lowest
 */
export default function sortBalancesByTotal(
  balances: LockedCeloBalances
): LockedCeloBalances {
  return Object.entries(balances)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc: LockedCeloBalances, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
