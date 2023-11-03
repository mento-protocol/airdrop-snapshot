import { Balances } from './getBalancesAtBlockNumber.js'

export default function sortBalances(balances: Balances) {
  return Object.entries(balances)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .reduce((acc: Balances, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}
