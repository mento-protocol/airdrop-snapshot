import type { CStableBalances } from './index.js'

export default function filterOutSmallBalances(balances: CStableBalances) {
  return Object.fromEntries(
    Object.entries(balances).filter(
      ([address, balances]) => balances.total >= 10
    )
  )
}
