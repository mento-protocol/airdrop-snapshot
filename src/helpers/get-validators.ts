import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { Address } from 'viem'
import fileExists from './file-exists.js'

export default async function getValidators(
  type: 'validators' | 'validator-groups' = 'validators'
): Promise<Address[]> {
  const filePath = path.resolve(
    `src/snapshots/validators-and-groups/celo-${type}.csv`
  )
  if (!(await fileExists(filePath))) {
    throw new Error(`Validator file not found: ${filePath}`)
  }
  const validatorFile = await fs.readFile(filePath)
  return (
    parse(validatorFile)
      .map((addressWrappedInArray: string[]) => addressWrappedInArray[0])
      // remove header row
      .filter((_: string, i: number) => i > 0)
  )
}
