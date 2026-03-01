import fs from 'node:fs'
import path from 'node:path'

function isRegularDirectory(filePath: string): boolean {
  try {
    const stat = fs.lstatSync(filePath)
    return stat.isDirectory() && !stat.isSymbolicLink()
  } catch {
    return false
  }
}

export function linkDirectory(source: string, destination: string): boolean {
  if (!fs.existsSync(source)) return false
  if (isRegularDirectory(destination)) return false

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

export function unlinkDirectory(destination: string): boolean {
  try {
    const stat = fs.lstatSync(destination)
    if (!stat.isSymbolicLink()) return false
    fs.unlinkSync(destination)
    return true
  } catch {
    return false
  }
}
