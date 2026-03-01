import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { RawConfig, ResolvedMapping } from './types.js'

export class ConfigNotFoundError extends Error {
  constructor(filePath: string) {
    super(`Config file not found: ${filePath}`)
    this.name = 'ConfigNotFoundError'
  }
}

export class InvalidGroupError extends Error {
  constructor(group: string) {
    super(`Group not found: ${group}`)
    this.name = 'InvalidGroupError'
  }
}

function expandHome(filePath: string): string {
  if (!filePath.startsWith('~')) return filePath
  return path.join(os.homedir(), filePath.slice(1))
}

function loadConfig(configRoot: string): RawConfig {
  const configPath = path.join(configRoot, 'dotfiles.json')
  if (!fs.existsSync(configPath)) {
    throw new ConfigNotFoundError(configPath)
  }

  const content = fs.readFileSync(configPath, 'utf-8')
  const config = JSON.parse(content) as RawConfig | null
  return { mappings: config?.mappings ?? {} }
}

export function getGroupMappings(configRoot: string): Record<string, ResolvedMapping[]> {
  const config = loadConfig(configRoot)
  const result: Record<string, ResolvedMapping[]> = {}

  for (const [group, rawMappings] of Object.entries(config.mappings)) {
    result[group] = rawMappings.map((raw) => ({
      source: path.resolve(configRoot, raw.source),
      destination: expandHome(raw.destination),
      critical: raw.critical === true,
      type: raw.type ?? 'file',
    }))
  }

  return result
}

export function getPathMappings(configRoot: string, select?: string): ResolvedMapping[] {
  const groups = getGroupMappings(configRoot)

  if (!select) {
    return Object.values(groups).flat()
  }

  if (!groups[select]) {
    throw new InvalidGroupError(select)
  }

  return groups[select]
}
