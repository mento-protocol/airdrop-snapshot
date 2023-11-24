import type { LockedCeloBalances } from './index.js'

/**
 * Filter out small balances
 */
export default function filterOutSmallBalances(balances: LockedCeloBalances) {
  return Object.fromEntries(
    Object.entries(balances).filter(([_, balance]) => balance.totalInUsd >= 10)
  )
}
