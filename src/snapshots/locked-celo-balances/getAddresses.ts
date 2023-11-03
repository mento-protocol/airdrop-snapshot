import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'
import ora from 'ora'
import bold from '../../helpers/bold.js'

export default async function getAddresses(fileName: string) {
  const spinner = ora(
    'Fetching addresses to check LockedCelo balances for from Dune snapshot CSV...'
  ).start()

  const csv = await fs.readFile(new URL(fileName, import.meta.url))
  const addresses = parse(csv)
    // remove header row
    .filter((_: string, i: number) => i > 0)
    .map((row: string[]) => row[0])

  spinner.succeed(`Fetched addresses from ${bold(fileName)}`)

  return addresses
}
