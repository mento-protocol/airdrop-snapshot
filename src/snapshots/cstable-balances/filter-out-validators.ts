import type { Balances } from './index.js'

export default function filterOutValidators(
  balances: Balances,
  validators: string[]
) {
  return Object.fromEntries(
    Object.entries(balances).filter(
      ([address, _]) => !validators.includes(address)
    )
  )
}
