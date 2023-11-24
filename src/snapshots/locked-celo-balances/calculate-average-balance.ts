import type { LockedCeloBalances } from './index.js'

/**
 * Helper function that calculates the average balance
 */
export default function calculateAverageBalance(
  balances: LockedCeloBalances
): LockedCeloBalances {
  return Object.fromEntries(
    Object.entries(balances).map(([address, bal]) => {
      return [
        address,
        { total: bal.total / 12, totalInUsd: bal.totalInUsd / 12 },
      ]
    })
  )
}
