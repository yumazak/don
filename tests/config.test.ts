import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getGroupMappings, getPathMappings, ConfigNotFoundError, InvalidGroupError } from '../src/config.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'don-config-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeConfig(config: Record<string, unknown>) {
  fs.writeFileSync(path.join(tmpDir, 'dotfiles.json'), JSON.stringify(config), 'utf-8')
}

describe('getGroupMappings', () => {
  test('正常な JSON を読み込んで ResolvedMapping を返す', () => {
    writeConfig({ mappings: { tools: [{ source: 'files/tool.conf', destination: '~/.config/tool.conf' }] } })
    const groups = getGroupMappings(tmpDir)
    expect(Object.keys(groups)).toEqual(['tools'])
    expect(groups.tools).toHaveLength(1)
    expect(groups.tools[0].source).toBe(path.resolve(tmpDir, 'files/tool.conf'))
    expect(groups.tools[0].destination).toBe(path.join(os.homedir(), '.config/tool.conf'))
  })

  test('~ がホームディレクトリに展開される', () => {
    writeConfig({ mappings: { g: [{ source: 'a.txt', destination: '~/a.txt' }] } })
    const groups = getGroupMappings(tmpDir)
    expect(groups.g[0].destination).toBe(path.join(os.homedir(), 'a.txt'))
  })

  test('critical デフォルトが false', () => {
    writeConfig({ mappings: { g: [{ source: 'a.txt', destination: '~/a.txt' }] } })
    const groups = getGroupMappings(tmpDir)
    expect(groups.g[0].critical).toBe(false)
  })

  test('critical: true が正しく読み込まれる', () => {
    writeConfig({ mappings: { g: [{ source: 'a.txt', destination: '~/a.txt', critical: true }] } })
    const groups = getGroupMappings(tmpDir)
    expect(groups.g[0].critical).toBe(true)
  })

  test('type デフォルトが file', () => {
    writeConfig({ mappings: { g: [{ source: 'a.txt', destination: '~/a.txt' }] } })
    const groups = getGroupMappings(tmpDir)
    expect(groups.g[0].type).toBe('file')
  })

  test('type: directory が正しく読み込まれる', () => {
    writeConfig({ mappings: { g: [{ source: 'mydir', destination: '~/mydir', type: 'directory' }] } })
    const groups = getGroupMappings(tmpDir)
    expect(groups.g[0].type).toBe('directory')
  })

  test('dotfiles.json が存在しない場合 ConfigNotFoundError', () => {
    expect(() => getGroupMappings(tmpDir)).toThrow(ConfigNotFoundError)
  })

  test('mappings キーがない場合、空オブジェクトを返す', () => {
    writeConfig({ other_key: 'value' })
    const groups = getGroupMappings(tmpDir)
    expect(groups).toEqual({})
  })
})

describe('getPathMappings', () => {
  test('select なしで全マッピングを返す', () => {
    writeConfig({ mappings: { a: [{ source: 'a.txt', destination: '~/a.txt' }], b: [{ source: 'b.txt', destination: '~/b.txt' }] } })
    const mappings = getPathMappings(tmpDir)
    expect(mappings).toHaveLength(2)
  })

  test('select で指定グループのみ返す', () => {
    writeConfig({ mappings: { a: [{ source: 'a.txt', destination: '~/a.txt' }], b: [{ source: 'b.txt', destination: '~/b.txt' }] } })
    const mappings = getPathMappings(tmpDir, 'a')
    expect(mappings).toHaveLength(1)
    expect(mappings[0].source).toBe(path.resolve(tmpDir, 'a.txt'))
  })

  test('存在しないグループで InvalidGroupError', () => {
    writeConfig({ mappings: { a: [{ source: 'a.txt', destination: '~/a.txt' }] } })
    expect(() => getPathMappings(tmpDir, 'nonexistent')).toThrow(InvalidGroupError)
  })
})
