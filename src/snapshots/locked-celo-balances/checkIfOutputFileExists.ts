import ora from 'ora'
import path from 'path'
import bold from '../../helpers/bold.js'
import fileExists from '../../helpers/fileExists.js'

export default async function checkIfOutputFileExists(fileName: string) {
  // Fetching thousands of balances is expensive, exit early if we already have the data locally
  if (await fileExists(fileName)) {
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
