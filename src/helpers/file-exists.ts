import fs from 'node:fs/promises'

/**
 * Checks if a file exists
 *
 * rant: jesus christ wtf did they do to fs.exists() 🤯
 * https://nodejs.org/api/fs.html#fsexistspath-callback
 */
export default async function fileExists(filePath: string) {
  const fullPath = new URL(filePath, import.meta.url)

  const fileExists = !!(await fs.stat(fullPath).catch(() => null))

  return fileExists
}
