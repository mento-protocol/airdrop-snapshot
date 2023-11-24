import path from 'node:path'
import fs from 'node:fs/promises'
import { parse } from 'csv-parse/sync'
import ora from 'ora'
import bold from '../../helpers/bold.js'

// Schema of the Dune query export
export type DuneCsv = [
  `0x${string}`,
  `<a href=${string}`,
  string,
  'Contract' | '',
  string
]

/**
 * Loads a Dune Snapshot CSV export into memory
 */
export default async function loadDuneSnapshotFile(
  filePath: string
): Promise<DuneCsv> {
  const spinner = ora(`Loading CSV file ${bold(filePath)}...`).start()

  try {
    const fullPath = new URL(filePath, import.meta.url)
    const csv = await fs.readFile(fullPath)
    const rows = parse(csv) as DuneCsv

    spinner.succeed(
      `Loaded CSV file ${bold(path.basename(filePath))} with ${bold(
        String(rows.length)
      )} rows.`
    )

    return rows
  } catch (error) {
    spinner.fail(`Couldn't load CSV file ${bold(path.basename(filePath))}`)
    throw error
  }
}
