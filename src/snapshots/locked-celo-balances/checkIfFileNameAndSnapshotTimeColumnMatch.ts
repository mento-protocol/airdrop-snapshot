import path from 'node:path'
import type { InputCsv } from './index.js'

export default function checkIfFileNameAndSnapshotTimeColumnMatch(
  fileName: string,
  csv: InputCsv
) {
  // First Row is the Header Row, hence we need to get the second row for the first timestamp value
  const timestampColumnOfSecondRow = csv.map((row) => row[4])[1]
  const fileNameNormalized = path.basename(fileName).slice(0, 13)
  const timestampNormalized = timestampColumnOfSecondRow.slice(0, 13)

  if (fileNameNormalized !== timestampNormalized) {
    throw new Error(
      `Mismatch between fileName (${fileNameNormalized}) and timestamp column ${timestampNormalized} in CSV. Make sure you've exported the right snapshot from Dune and named the file with the same date!`
    )
  }
}
