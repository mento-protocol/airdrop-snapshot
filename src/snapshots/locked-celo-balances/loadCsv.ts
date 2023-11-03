import path from 'node:path'
import fs from 'node:fs/promises'
import { parse } from 'csv-parse/sync'
import ora from 'ora'
import bold from '../../helpers/bold.js'
import type { InputCsv } from './index.js'

export default async function load(fileName: string): Promise<InputCsv> {
  const spinner = ora(`Loading CSV file ${bold(fileName)}...`).start()

  try {
    const fullPath = new URL(
      process.cwd() + '/src/snapshots/locked-celo-balances/' + fileName,
      import.meta.url
    )
    const csv = await fs.readFile(fullPath)
    const rows = parse(csv) as InputCsv
    spinner.succeed(
      `Loaded CSV file ${bold(path.basename(fileName))} with ${bold(
        String(rows.length)
      )} rows.`
    )

    return rows
  } catch (error) {
    spinner.fail(`Couldn't load CSV file ${bold(path.basename(fileName))}`)
    throw error
  }
}
