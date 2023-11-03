import fs from 'node:fs/promises'
import ora from 'ora'
import path from 'path'
import bold from '../../helpers/bold.js'

export default async function checkIfOutputFileExists(fileName: string) {
  const fullPath = new URL(
    process.cwd() + '/src/snapshots/locked-celo-balances/' + fileName,
    import.meta.url
  )

  // jesus christ wtf did they do to fs.exists() 🤯
  // deprecated => https://nodejs.org/api/fs.html#fsexistspath-callback
  const fileExists = !!(await fs.stat(fullPath).catch(() => null))

  // Fetching thousands of balances is expensive, exit early if we already have the data locally
  if (fileExists) {
    ora(
      `Skipping ${bold(
        path.basename(fileName)
      )} because output file already exists: dune-snapshots/${bold(
        path.basename(fileName)
      )}`
    ).info()

    return true
  }

  return false
}
