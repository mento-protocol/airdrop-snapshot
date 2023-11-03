import getBlockNumberForDate from './getBlockNumberForDate.js'
import getAddresses from './getAddresses.js'
import getBalancesAtBlockNumber from './getBalancesAtBlockNumber.js'
import writeBalancesToCsv from './writeBalancesToCsv.js'
import sortBalances from './sortBalances.js'

// cli output formatting
console.log('')

const snapshotDates = [
  new Date('2022-11-15 12:00 UTC'),
  new Date('2022-12-15 12:00 UTC'),
  new Date('2023-01-15 12:00 UTC'),
  new Date('2023-02-15 12:00 UTC'),
  new Date('2023-03-15 12:00 UTC'),
  new Date('2023-04-15 12:00 UTC'),
  new Date('2023-05-15 12:00 UTC'),
  new Date('2023-06-15 12:00 UTC'),
  new Date('2023-07-15 12:00 UTC'),
  new Date('2023-08-15 12:00 UTC'),
  new Date('2023-09-15 12:00 UTC'),
  new Date('2023-10-15 12:00 UTC'),
]

// TODO: Replace hardcoding once we iterate over all snapshots
const blockNumberForSnapshotDate = await getBlockNumberForDate(
  snapshotDates.at(-1) as Date
)
const addresses = await getAddresses('test.csv')
const balances = await getBalancesAtBlockNumber(
  addresses,
  blockNumberForSnapshotDate
)
const sortedBalances = sortBalances(balances)
await writeBalancesToCsv(sortedBalances, 'output.csv')
