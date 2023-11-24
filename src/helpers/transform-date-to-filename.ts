/**
 * Transforms a date to a string with schema: '2023-10-15 12-00'
 * Necessary because some file systems don't allow colons ":" in file names
 */
export default function transformDateToFilename(isoDate: Date) {
  return isoDate
    .toISOString() // ISO String Format: '2023-10-15T12:00:00.000Z'
    .slice(0, 16)
    .replace('T', ' ')
    .replace(':', '-')
}
