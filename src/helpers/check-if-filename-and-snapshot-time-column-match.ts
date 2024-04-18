import path from 'node:path'

/**
 * Sanity check to guard against accidental typos when exporting a Dune snapshot to CSV and manually naming the file
 */
export default function checkIfFileNameAndSnapshotTimeColumnMatch(
  filePath: string,
  csv: Array<string>,
  timestampColumnIndex: number
) {
  // First Row is the Header Row, hence we need to get the second row at index 1 for the first timestamp value
  const timestampColumnOfSecondRow = csv.map(
    (row) => row[timestampColumnIndex]
  )[1]

  if (!timestampColumnOfSecondRow) {
    throw new Error(
      `Didn't find timestamp in column ${timestampColumnIndex}. Make sure you're using the correct index.`
    )
  }

  const fileNameNormalized = path.basename(filePath).slice(0, 13)
  const timestampNormalized = timestampColumnOfSecondRow.slice(0, 13)

  if (fileNameNormalized !== timestampNormalized) {
    throw new Error(
      `Mismatch between fileName (${fileNameNormalized}) and timestamp column ${timestampNormalized} in CSV. Make sure you've exported the right snapshot from Dune and named the file with the same date!`
    )
  }
}
