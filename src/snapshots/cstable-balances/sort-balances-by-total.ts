import type { Balances } from './index.js'

export default function balancesSortedByTotal(balances: Balances) {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce((acc: Balances, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
