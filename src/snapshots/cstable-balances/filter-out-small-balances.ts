import type { Balances } from './index.js'

export default function filterOutSmallBalances(balances: Balances) {
  return Object.fromEntries(
    Object.entries(balances).filter(
      ([address, balances]) => balances.total >= 10
    )
  )
}
