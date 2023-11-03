import path from 'node:path'
import fs from 'node:fs/promises'

// jesus christ wtf did they do to fs.exists() 🤯
// deprecated => https://nodejs.org/api/fs.html#fsexistspath-callback
export default async function fileExists(fileName: string): Promise<boolean> {
  const fullPath = new URL(
    process.cwd() + '/src/snapshots/' + fileName,
    import.meta.url
  )

  return !!(await fs.stat(fullPath).catch(() => null))
}
