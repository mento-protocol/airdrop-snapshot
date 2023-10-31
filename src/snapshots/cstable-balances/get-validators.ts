import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'
export default async function getValidators() {
  const validatorFile = await fs.readFile(
    'src/snapshots/cstable-balances/all-historical-celo-validator-addresses.csv'
  )
  return (
    parse(validatorFile)
      .map((addressWrappedInArray: string[]) => addressWrappedInArray[0])
      // remove header row
      .filter((_: string, i: number) => i > 0)
  )
}
