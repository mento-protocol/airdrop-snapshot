import type { CStableBalances } from '../snapshots/cstable-balances/types.js'
import type { CStableVolume } from '../snapshots/cstable-volume/index.js'
import type { LockedCeloBalances } from '../snapshots/locked-celo-balances/index.js'

/**
 * Sort entries by total highest to lowest
 */
export default function sortByTotal(
  balances: LockedCeloBalances | CStableBalances | CStableVolume
) {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce(
      (
        acc: LockedCeloBalances | CStableBalances | CStableVolume,
        [key, value]
      ) => {
        acc[key] = value
        return acc
      },
      {}
    )
}
