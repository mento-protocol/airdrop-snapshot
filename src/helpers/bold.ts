// Helper for prettier console output
export default function bold(text: string | number) {
  return `\u001b[1m${text}\u001b[0m`
}
