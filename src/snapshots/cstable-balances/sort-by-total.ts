import type { CStableVolume } from '../cstable-volume/index.js'
import type { CStableBalances } from './types.js'

/**
 * Sort balances by total highest to lowest
 */
export default function sortByTotal(
  balances: CStableBalances | CStableVolume
): CStableBalances | CStableVolume {
  return Object.entries(balances)
    .sort((a, b) => b[1].total - a[1].total)
    .reduce((acc: CStableBalances | CStableVolume, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
