import type { LockedCeloBalances } from '../snapshots/locked-celo-balances/index.js'
import type { CStableBalances } from '../snapshots/cstable-balances/types.js'
import type { CStableVolume } from '../snapshots/cstable-volume/index.js'

/**
 * Filter out validators as we'll calculate their allocation separately
 */
export default function filterOutValidators(
  balances: LockedCeloBalances | CStableBalances | CStableVolume,
  validators: string[]
) {
  return Object.fromEntries(
    Object.entries(balances).filter(
      ([address, _]) => !validators.includes(address)
    )
  )
}
