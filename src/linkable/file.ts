import fs from 'node:fs'
import path from 'node:path'

export function linkFile(source: string, destination: string): boolean {
  if (!fs.existsSync(source)) return false

  fs.mkdirSync(path.dirname(destination), { recursive: true })

  try {
    const stat = fs.lstatSync(destination)
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(destination)
    }
  } catch {
    // destination does not exist — ok
  }

  fs.symlinkSync(source, destination)
  return true
}

export function unlinkFile(destination: string): boolean {
  try {
    const stat = fs.lstatSync(destination)
    if (!stat.isSymbolicLink()) return false
    fs.unlinkSync(destination)
    return true
  } catch {
    return false
  }
}
