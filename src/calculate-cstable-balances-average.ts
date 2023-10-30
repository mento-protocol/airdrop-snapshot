import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse'
import type { CastingFunction } from 'csv-parse'
import { finished } from 'stream/promises'

type Row = {
  Address: string
  'Total cStables in USD': number
  'cUSD in USD': number
  'cEUR in USD': number
  'cREAL in USD': number
  'cUSD Balance': number
  'cEUR Balance': number
  'cREAL Balance': number
}

type Balance = {
  [address: string]: {
    balance: number
  }
}

const snapshotFolder = process.cwd() + '/src/snapshots/cstable-balances'
const balances: Balance = {}
const files = await fs.promises.readdir(snapshotFolder)
const csvFiles = files
  .filter((file) => path.extname(file).toLowerCase() === '.csv')
  .map((file) => snapshotFolder + '/' + file)

const castFn: CastingFunction = (value, context) => {
  // Don't transform header
  if (context.header) {
    return value
  }

  // Don't transform address values
  if (context.column === 'Address') {
    return String(value)
  }

  // All other values should be numbers
  return Number(value)
}

const processFile = async (file: string) => {
  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, cast: castFn }))

  parser.on('readable', function () {
    let row: Row
    while ((row = parser.read()) !== null) {
      const { Address: address } = row

      // If address hasn't been added to mapping, create it
      if (!balances[address]) {
        balances[address] = { balance: 0 }
      }

      if (address === '0xf4cab10dc19695aace14b7a16d7705b600ad5f73') {
        console.log('CURVE POOL:', row['Total cStables in USD'])
      }

      balances[address].balance += row['Total cStables in USD']
    }
  })

  await finished(parser)
}

for (const file of csvFiles) {
  console.log('Processing file:', path.basename(file))
  await processFile(file)
}

let csvData = 'Address,Average cStables ins USD across 12 Snapshots\n'
csvData += Object.keys(balances)
  .map((address) => {
    return `${address},${balances[address].balance / 12}`
  })
  .join('\n')

const outputPath = process.cwd() + '/average-cstables-balances.csv'

const bold = (text: string) => `\u001b[1m${text}\u001b[0m`
try {
  await fs.promises.writeFile(outputPath, csvData)
  console.log(
    '🏁 Average balances have been calculated and written to balances.csv'
  )
  console.log(
    `ℹ️ There are ${bold(
      String(Object.keys(balances).length)
    )} eligible addresses`
  )
} catch (error) {
  console.error('Error writing to CSV:', error)
}
