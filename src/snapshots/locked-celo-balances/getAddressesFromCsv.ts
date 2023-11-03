import type { InputCsv } from './index.js'

export default function getAddressesFromCsv(
  csv: InputCsv
): Array<`0x${string}`> {
  return (
    csv
      // remove header row
      .filter((_, i: number) => i > 0)
      // Addresses are in first column of Dune export
      .map((row) => row[0]) as Array<`0x${string}`>
  )
}
