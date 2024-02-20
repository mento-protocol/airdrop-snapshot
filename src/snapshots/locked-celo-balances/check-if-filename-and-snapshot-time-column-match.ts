import path from 'node:path'
import type { DuneCsv } from '../../helpers/load-csv-file.js'

/**
 * Sanity check to guard against accidental typos when exporting a Dune snapshot to CSV and manually naming the file
 */
export default function checkIfFileNameAndSnapshotTimeColumnMatch(
  filePath: string,
  csv: DuneCsv
) {
  // First Row is the Header Row, hence we need to get the second row at index 1 for the first timestamp value
  const timestampColumnOfSecondRow = csv.map((row) => row[4])[1]
  const fileNameNormalized = path.basename(filePath).slice(0, 13)
  const timestampNormalized = timestampColumnOfSecondRow.slice(0, 13)

  if (fileNameNormalized !== timestampNormalized) {
    throw new Error(
      `Mismatch between fileName (${fileNameNormalized}) and timestamp column ${timestampNormalized} in CSV. Make sure you've exported the right snapshot from Dune and named the file with the same date!`
    )
  }
}
