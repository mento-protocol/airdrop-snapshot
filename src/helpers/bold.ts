// Helper for prettier console output
export default function bold(text: string | number | bigint) {
  return `\u001b[1m${text}\u001b[0m`
}
