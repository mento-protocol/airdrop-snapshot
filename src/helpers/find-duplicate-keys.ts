export default function findDuplicateKeys(
  obj: Record<string, unknown>
): string[] {
  const seen: Record<string, boolean> = {}
  const duplicates: string[] = []

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (seen[key]) {
        duplicates.push(key)
      } else {
        seen[key] = true
      }
    }
  }

  return duplicates
}
