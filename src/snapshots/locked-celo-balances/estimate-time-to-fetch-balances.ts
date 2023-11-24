import ora from 'ora'
import bold from '../../helpers/bold.js'

/**
 * Little helper to gauge how long it'll take to fetch balances for an array of addresses from an archive node
 */
export default function estimateTimeToFetchAllBalancesFromNode(
  addresses: Array<`0x${string}`>
) {
  // NOTE: Empirical value of 400 fetches per second on a 50MBit/s connection using a standard Infura node
  const addressesPerMinute = 400
  const timeEstimationInMins = Math.ceil(addresses.length / addressesPerMinute)
  const formattedTime = `${String(timeEstimationInMins)} mins`

  ora(
    `${bold(formattedTime)} estimated time to fetch ${bold(
      String(addresses.length)
    )} balances from archive node (based on ~${addressesPerMinute} addresses per minute)`
  ).info()
}
