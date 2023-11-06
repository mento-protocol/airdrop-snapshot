import type { CStableBalances } from '../snapshots/cstable-balances/index.js'
import type { LockedCeloBalances } from '../snapshots/locked-celo-balances/index.js'

/**
 * Filter out validators as we'll calculate their allocation separately
 */
export default function filterOutValidators(
  balances: CStableBalances | LockedCeloBalances,
  validators: string[]
) {
  return Object.fromEntries(
    Object.entries(balances).filter(
      ([address, _]) => !validators.includes(address)
    )
  )
}
