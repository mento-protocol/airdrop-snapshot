import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Load individual monthly snapshot files
 */
export default async function getIndividualSnapshotFiles(
  snapshotFolder: string
) {
  try {
    const snapshotFiles = (await fs.readdir(path.resolve(snapshotFolder)))
      .filter((file) => path.extname(file).toLowerCase() === '.csv')
      .map((file) => snapshotFolder + '/' + file)

    // Poor man's unit test
    if (snapshotFiles.length !== 12) {
      throw new Error(
        'It should be exactly 12 snapshot files as per the eligibility criteria'
      )
    }

    return snapshotFiles
  } catch (error) {
    throw new Error(
      `Couldn't read snapshot files from ${path.resolve(snapshotFolder)}`
    )
  }
}
