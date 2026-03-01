import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { linkAll, unlinkAll } from '../src/manager.js'

let tmpDir: string
let destDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'don-manager-test-'))
  destDir = path.join(tmpDir, 'dest')
  fs.mkdirSync(destDir, { recursive: true })
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeConfig(config: Record<string, unknown>) {
  fs.writeFileSync(path.join(tmpDir, 'dotfiles.json'), JSON.stringify(config), 'utf-8')
}

function createSourceFile(relativePath: string, content = 'test') {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

function createSourceDir(relativePath: string) {
  fs.mkdirSync(path.join(tmpDir, relativePath), { recursive: true })
}

describe('linkAll', () => {
  test('全マッピングのリンクが作成される', () => {
    createSourceFile('files/a.txt')
    createSourceFile('files/b.txt')
    writeConfig({ mappings: { group1: [{ source: 'files/a.txt', destination: `${destDir}/a.txt` }], group2: [{ source: 'files/b.txt', destination: `${destDir}/b.txt` }] } })
    const result = linkAll(tmpDir)

    expect(result.linked).toBe(2)
    expect(result.skipped).toBe(0)
    expect(fs.lstatSync(path.join(destDir, 'a.txt')).isSymbolicLink()).toBe(true)
    expect(fs.lstatSync(path.join(destDir, 'b.txt')).isSymbolicLink()).toBe(true)
  })

  test('select で指定グループのみリンクされる', () => {
    createSourceFile('files/a.txt')
    createSourceFile('files/b.txt')
    writeConfig({ mappings: { group1: [{ source: 'files/a.txt', destination: `${destDir}/a.txt` }], group2: [{ source: 'files/b.txt', destination: `${destDir}/b.txt` }] } })
    const result = linkAll(tmpDir, 'group1')

    expect(result.linked).toBe(1)
    expect(fs.lstatSync(path.join(destDir, 'a.txt')).isSymbolicLink()).toBe(true)
    expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(false)
  })

  test('ソースが存在しない場合はスキップ', () => {
    writeConfig({ mappings: { g: [{ source: 'files/nonexistent.txt', destination: `${destDir}/a.txt` }] } })
    const result = linkAll(tmpDir)

    expect(result.linked).toBe(0)
    expect(result.skipped).toBe(1)
  })

  test('ディレクトリ型のリンクが作成される', () => {
    createSourceDir('mydir')
    writeConfig({ mappings: { g: [{ source: 'mydir', destination: `${destDir}/mydir`, type: 'directory' }] } })
    const result = linkAll(tmpDir)

    expect(result.linked).toBe(1)
    expect(fs.lstatSync(path.join(destDir, 'mydir')).isSymbolicLink()).toBe(true)
  })
})

describe('unlinkAll', () => {
  test('全シンボリックリンクが削除される', () => {
    createSourceFile('files/a.txt')
    createSourceFile('files/b.txt')
    writeConfig({ mappings: { g: [{ source: 'files/a.txt', destination: `${destDir}/a.txt` }, { source: 'files/b.txt', destination: `${destDir}/b.txt` }] } })
    linkAll(tmpDir)
    const result = unlinkAll(tmpDir)

    expect(result.unlinked).toBe(2)
    expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, 'b.txt'))).toBe(false)
  })

  test('critical ファイルはデフォルトでスキップされる', () => {
    createSourceFile('files/important.txt')
    writeConfig({ mappings: { g: [{ source: 'files/important.txt', destination: `${destDir}/important.txt`, critical: true }] } })
    linkAll(tmpDir)
    const result = unlinkAll(tmpDir)

    expect(result.skipped).toBe(1)
    expect(result.items[0].status).toBe('skipped_critical')
    expect(fs.lstatSync(path.join(destDir, 'important.txt')).isSymbolicLink()).toBe(true)
  })

  test('force で critical ファイルも削除される', () => {
    createSourceFile('files/important.txt')
    writeConfig({ mappings: { g: [{ source: 'files/important.txt', destination: `${destDir}/important.txt`, critical: true }] } })
    linkAll(tmpDir)
    const result = unlinkAll(tmpDir, undefined, true)

    expect(result.unlinked).toBe(1)
    expect(fs.existsSync(path.join(destDir, 'important.txt'))).toBe(false)
  })

  test('select で指定グループのみ削除される', () => {
    createSourceFile('files/a.txt')
    createSourceFile('files/b.txt')
    writeConfig({ mappings: { group1: [{ source: 'files/a.txt', destination: `${destDir}/a.txt` }], group2: [{ source: 'files/b.txt', destination: `${destDir}/b.txt` }] } })
    linkAll(tmpDir)
    const result = unlinkAll(tmpDir, 'group1')

    expect(result.unlinked).toBe(1)
    expect(fs.existsSync(path.join(destDir, 'a.txt'))).toBe(false)
    expect(fs.lstatSync(path.join(destDir, 'b.txt')).isSymbolicLink()).toBe(true)
  })
})
