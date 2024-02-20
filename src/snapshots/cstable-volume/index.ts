import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import type { Address } from 'viem'
import fileExists from '../../helpers/file-exists.js'
import findDuplicateKeys from '../../helpers/find-duplicate-keys.js'
import getValidators from '../../helpers/get-validators.js'
import sortByTotal from '../../helpers/sort-by-total.js'
import loadReleaseGoldAddressesFromCsv from '../locked-celo-balances/release-gold/load-release-gold-addresses-from-csv.js'
import generateOutputCsv from './generate-output-csv.js'

export type CStableVolume = {
  [address: Address]: {
    total: number | null
    contract: string | null
    beneficiary: string | null
    cUSDinUSD: number | null
    cEURinUSD: number | null
    cREALinUSD: number | null
    cUSD: number | null
    cEUR: number | null
    cREAL: number | null
  }
}

type CStableVolumeCSV = [
  address: Address,
  totalVolumeInUSD: number,
  contract: string,
  cUSDVolumeinUSD: number,
  cEURVolumeinUSD: number,
  cREALVolumeinUSD: number,
  cUSDVolume: number,
  cEURVolume: number,
  cREALVolume: number
]

const results = []

// 0. Define output object
const adjustedVolume: CStableVolume = {}

// 1. Load validator & validator group addresses
const validators = await getValidators('validators')
const validatorGroups = await getValidators('validator-groups')
const validatorsAndGroups = validators.concat(validatorGroups)

const snapshotPath = path.resolve(
  'src/snapshots/cstable-volume/cstable-volume-dune-export.csv'
)
if (!(await fileExists(snapshotPath))) {
  throw new Error(`Snapshot file not found: ${snapshotPath}`)
}

// 2. Create CSV parser for dune volume snapshot
const parser = fs.createReadStream(snapshotPath).pipe(
  parse({
    columns: true,
    cast: (value, context) => {
      if (context.header) {
        return value
      }

      switch (context.column) {
        case 'Address':
        case 'Contract':
          return value

        case 'Snapshot Date':
          return new Date(value.replace('12-00', '12:00 UTC'))

        default:
          return Number(value)
      }
    },
  })
)

// 3. Load release gold addresses from csv to check snapshot for release gold contracts
const releaseGoldFile = path.resolve('src/snapshots/release-gold-addresses.csv')
let releaseGoldBeneficiaryMap: Record<Address, Address> = {}
if (
  !(await fileExists(path.resolve('src/snapshots/release-gold-addresses.csv')))
) {
  throw new Error('Release gold addresses file not found')
} else {
  releaseGoldBeneficiaryMap = await loadReleaseGoldAddressesFromCsv(
    releaseGoldFile
  )
}

// 4. Load dune volume snapshot csv into memory and double validator's cUSD volume
parser.on('readable', function () {
  let row: {
    Address: Address
    'Total Volume in USD': number
    Contract: string
    Beneficiary: string
    'cUSD Volume in USD': number
    'cEUR Volume in USD': number
    'cREAL Volume in USD': number
    'cUSD Volume': number
    'cEUR Volume': number
    'cREAL Volume': number
  }

  while ((row = parser.read()) !== null) {
    const { Address: address } = row

    // If address hasn't been added to mapping yet, create it
    if (!adjustedVolume[address]) {
      adjustedVolume[address] = {
        total: null,
        contract: '',
        beneficiary: '',
        cUSDinUSD: null,
        cEURinUSD: null,
        cREALinUSD: null,
        cUSD: null,
        cEUR: null,
        cREAL: null,
      }
    }

    adjustedVolume[address].total = row['Total Volume in USD']
    adjustedVolume[address].contract = row['Contract']
    adjustedVolume[address].cUSDinUSD = row['cUSD Volume in USD']
    adjustedVolume[address].cEURinUSD = row['cEUR Volume in USD']
    adjustedVolume[address].cREALinUSD = row['cREAL Volume in USD']
    adjustedVolume[address].cUSD = row['cUSD Volume']
    adjustedVolume[address].cEUR = row['cEUR Volume']
    adjustedVolume[address].cREAL = row['cREAL Volume']

    /*
     * 5. Double Validator cUSD Volumes
     * For every validator or validator group address, multiply volume by 2 to account for inflows
     *
     * Why?
     * This is necessary because most validator cUSD inflows are via epoch rewards that are not captured in the Dune snapshot
     * As an imperfect but reasonable heuristic, we assume that the snapshot volume is made up only by the outflows.
     * If we simply double the snapshot volume, we can account for the inflows.
     */
    if (validatorsAndGroups.includes(address)) {
      // Double cUSD volume
      adjustedVolume[address].cUSD = row['cUSD Volume'] * 2

      // Double cUSD volume in USD
      adjustedVolume[address].cUSDinUSD = row['cUSD Volume in USD'] * 2

      /**
       * To account for the doubled cUSD volume, add the original cUSD volume ONE time to the total volume
       * Example: Total volume before doubling was $1,000 where the cUSD volume was $500 and cEUR volume was $500
       * After doubling the cUSD volume, the total volume should now be $1,500 (because we only doubled the cUSD volume)
       */
      adjustedVolume[address].total =
        row['Total Volume in USD'] + row['cUSD Volume in USD']
    }

    /*
     * 6. Check for release gold addresses and populate the 'Beneficiary' field if found
     */
    if (releaseGoldBeneficiaryMap.hasOwnProperty(address)) {
      adjustedVolume[address].beneficiary = releaseGoldBeneficiaryMap[address]
    }
  }
})

await finished(parser)

// 7. Check for duplicate addresses
const dupes = findDuplicateKeys(adjustedVolume)
if (dupes.length) {
  throw new Error(`Duplicate addresses found: ${dupes.join('\n- ')})}`)
}

// 8. Sort rows by total volume in USD
const sortedVolumes = sortByTotal(adjustedVolume) as CStableVolume

// 9. Write final output csv
await generateOutputCsv(
  sortedVolumes,
  'src/snapshots/cstable-volume/cstable-volume-processed.csv'
)
