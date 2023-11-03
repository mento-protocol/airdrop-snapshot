import path from 'node:path'
import fs from 'node:fs/promises'
import { parse } from 'csv-parse/sync'
import ora from 'ora'
import bold from '../../helpers/bold.js'

export default async function load<T>(fileName: string): Promise<T> {
  const spinner = ora(`Loading CSV file ${bold(fileName)}...`).start()

  try {
    const csv = await fs.readFile(new URL(fileName, import.meta.url))
    const rows = parse(csv) as T
    spinner.succeed(`Loaded CSV file ${bold(path.basename(fileName))}.`)

    return rows
  } catch (error) {
    spinner.fail(`Couldn't load CSV file ${bold(path.basename(fileName))}`)
    throw error
  }
}
