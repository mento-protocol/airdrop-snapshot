import ora from 'ora'
import bold from '../../helpers/bold.js'

export default function estimateCheckTime(addresses: Array<`0x${string}`>) {
  // NOTE: Empirical value of 400 fetches per second on a 50MBit/s connection using a standard Infura node
  const addressesPerMinute = 400
  const timeEstimationInMins = Math.ceil(addresses.length / addressesPerMinute)
  const formattedTime = `${String(timeEstimationInMins).padStart(2, '0')}mins`

  ora(
    `${bold(
      formattedTime
    )} estimated time to fetch all balances from archive node (based on ~${addressesPerMinute} addresses per minute)`
  ).info()
}
