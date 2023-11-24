import type { CStableBalances } from './types.js'

export default function filterOutSmallBalances(
  balances: CStableBalances
): CStableBalances {
  return Object.fromEntries(
    Object.entries(balances).filter(([_, balances]) => balances.total >= 10)
  )
}
