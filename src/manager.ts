import { getPathMappings } from './config.js'
import { linkFile, unlinkFile } from './linkable/file.js'
import { linkDirectory, unlinkDirectory } from './linkable/directory.js'
import type { ResolvedMapping, LinkResult, LinkResultItem, UnlinkResult, UnlinkResultItem } from './types.js'

function linkMapping(mapping: ResolvedMapping): LinkResultItem {
  const linked = mapping.type === 'directory'
    ? linkDirectory(mapping.source, mapping.destination)
    : linkFile(mapping.source, mapping.destination)

  return {
    source: mapping.source,
    destination: mapping.destination,
    status: linked ? 'linked' : 'skipped',
  }
}

function unlinkMapping(mapping: ResolvedMapping, force: boolean): UnlinkResultItem {
  if (mapping.critical && !force) {
    console.log(`Skipping critical file: ${mapping.destination}`)
    return { destination: mapping.destination, status: 'skipped_critical' }
  }

  if (mapping.critical) {
    console.log(`Force unlinking critical file: ${mapping.destination}`)
  }

  const unlinked = mapping.type === 'directory'
    ? unlinkDirectory(mapping.destination)
    : unlinkFile(mapping.destination)

  return {
    destination: mapping.destination,
    status: unlinked ? 'unlinked' : 'skipped_not_symlink',
  }
}

export function linkAll(configRoot: string, select?: string): LinkResult {
  const mappings = getPathMappings(configRoot, select)
  const items = mappings.map((m) => linkMapping(m))

  return {
    linked: items.filter((i) => i.status === 'linked').length,
    skipped: items.filter((i) => i.status === 'skipped').length,
    items,
  }
}

export function unlinkAll(configRoot: string, select?: string, force = false): UnlinkResult {
  const mappings = getPathMappings(configRoot, select)
  const items = mappings.map((m) => unlinkMapping(m, force))

  return {
    unlinked: items.filter((i) => i.status === 'unlinked').length,
    skipped: items.filter((i) => i.status !== 'unlinked').length,
    items,
  }
}
