export interface RawMapping {
  source: string
  destination: string
  critical?: boolean
  type?: 'file' | 'directory'
}

export interface RawConfig {
  mappings: Record<string, RawMapping[]>
}

export interface ResolvedMapping {
  source: string
  destination: string
  critical: boolean
  type: 'file' | 'directory'
}

export interface LinkResultItem {
  source: string
  destination: string
  status: 'linked' | 'skipped'
}

export interface UnlinkResultItem {
  destination: string
  status: 'unlinked' | 'skipped_critical' | 'skipped_not_symlink'
}

export interface LinkResult {
  linked: number
  skipped: number
  items: LinkResultItem[]
}

export interface UnlinkResult {
  unlinked: number
  skipped: number
  items: UnlinkResultItem[]
}
