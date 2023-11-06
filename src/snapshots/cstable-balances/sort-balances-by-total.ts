import type { CStableBalances } from './index.js'

export default function balancesSortedByTotal(balances: CStableBalances) {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce((acc: CStableBalances, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
