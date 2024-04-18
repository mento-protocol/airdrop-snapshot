import type { Address } from 'viem'

type Balance = { [address: Address]: { total: number } }

/**
 * Sort entries by total highest to lowest
 */
export default function sortByTotal(balances: Balance) {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce((acc: Balance, [key, value]) => {
      acc[key as Address] = value
      return acc
    }, {})
}
