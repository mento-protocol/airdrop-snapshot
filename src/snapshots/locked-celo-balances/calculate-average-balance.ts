import { snapshotDates, type LockedCeloBalances } from './index.js'

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
        {
          total: bal.total / snapshotDates.length,
          totalInUsd: bal.totalInUsd / snapshotDates.length,
        },
      ]
    })
  )
}
