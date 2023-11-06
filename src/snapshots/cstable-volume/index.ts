import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'
import getValidators from '../../helpers/get-validators.js'
import bold from '../../helpers/bold.js'

const validators = await getValidators()
const snapshotFileName = 'cstable-volume-snapshot.csv'
const fullInputPath = new URL(
  process.cwd() + '/src/snapshots/cstable-volume/' + snapshotFileName,
  import.meta.url
)
const csv = await fs.readFile(fullInputPath)
const rows: Array<string[]> = parse(csv)
const rowsExclValidators = rows.filter((row) => !validators.includes(row[0]))

let csvData = ''
csvData += rowsExclValidators.join('\n')

const fullOutputPath = new URL(
  process.cwd() +
    '/src/snapshots/cstable-volume/cstable-volume-snapshot-excluding-validators.csv',
  import.meta.url
)
await fs.writeFile(fullOutputPath, csvData)

console.log(`${bold(String(rows.length))} addresses in snapshot`)
console.log(
  `${bold(
    String(rowsExclValidators.length)
  )} eligible addresses excluding validators`
)
