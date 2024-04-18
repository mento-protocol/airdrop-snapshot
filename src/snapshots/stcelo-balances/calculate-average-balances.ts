import snapshots from '../snapshots.js'
import type { StCeloBalances } from './index.js'

// Returns the average balances calculated as total balances / snapshots.length
export default function calculateAverageBalances(
  balances: StCeloBalances
): StCeloBalances {
  return Object.fromEntries(
    Object.entries(balances).map(([address, balance]) => {
      return [
        address,
        {
          total: balance.total / snapshots.length,
          totalInUsd: balance.totalInUsd / snapshots.length,
          contract: balance.contract,
        },
      ]
    })
  )
}
