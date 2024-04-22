import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'
import path from 'node:path'
import ora from 'ora'
import type { Address } from 'viem'
import bold from './bold.js'

// Schema of the Dune query export
export type DuneCsv = [
  Address,
  `<a href=${string}`,
  string,
  'Contract' | '',
  string
]

/**
 * Loads a CSV file into memory
 */
export default async function loadCsvFile<T extends Array<unknown> = DuneCsv>(
  filePath: string
): Promise<T> {
  const spinner = ora(
    `Loading CSV file ${bold(path.basename(filePath))}...`
  ).start()

  try {
    const fullPath = new URL(filePath, import.meta.url)
    const csv = await fs.readFile(fullPath)
    const rows = parse(csv) as T

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
