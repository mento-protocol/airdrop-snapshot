import type { CStableBalances } from './types.js'

/**
 * Sort balances by total highest to lowest
 */
export default function sortBalancesByTotal(
  balances: CStableBalances
): CStableBalances {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce((acc: CStableBalances, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
