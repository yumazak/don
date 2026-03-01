import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { linkFile, unlinkFile } from '../../src/linkable/file.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'don-file-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('linkFile', () => {
  test('ソースが存在する場合、シンボリックリンクを作成して true を返す', () => {
    const source = path.join(tmpDir, 'source.txt')
    const dest = path.join(tmpDir, 'dest.txt')
    fs.writeFileSync(source, 'hello')

    const result = linkFile(source, dest)

    expect(result).toBe(true)
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(true)
    expect(fs.readlinkSync(dest)).toBe(source)
  })

  test('ソースが存在しない場合、false を返す', () => {
    const source = path.join(tmpDir, 'nonexistent.txt')
    const dest = path.join(tmpDir, 'dest.txt')

    const result = linkFile(source, dest)

    expect(result).toBe(false)
    expect(fs.existsSync(dest)).toBe(false)
  })

  test('destination の親ディレクトリが存在しない場合、自動作成する', () => {
    const source = path.join(tmpDir, 'source.txt')
    const dest = path.join(tmpDir, 'deep', 'nested', 'dest.txt')
    fs.writeFileSync(source, 'hello')

    const result = linkFile(source, dest)

    expect(result).toBe(true)
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(true)
  })

  test('既存シンボリックリンクがある場合、削除して再作成する', () => {
    const source1 = path.join(tmpDir, 'source1.txt')
    const source2 = path.join(tmpDir, 'source2.txt')
    const dest = path.join(tmpDir, 'dest.txt')
    fs.writeFileSync(source1, 'first')
    fs.writeFileSync(source2, 'second')
    fs.symlinkSync(source1, dest)

    const result = linkFile(source2, dest)

    expect(result).toBe(true)
    expect(fs.readlinkSync(dest)).toBe(source2)
  })
})

describe('unlinkFile', () => {
  test('シンボリックリンクの場合、削除して true を返す', () => {
    const source = path.join(tmpDir, 'source.txt')
    const dest = path.join(tmpDir, 'dest.txt')
    fs.writeFileSync(source, 'hello')
    fs.symlinkSync(source, dest)

    const result = unlinkFile(dest)

    expect(result).toBe(true)
    expect(fs.existsSync(dest)).toBe(false)
  })

  test('通常ファイルの場合、false を返す（削除しない）', () => {
    const dest = path.join(tmpDir, 'regular.txt')
    fs.writeFileSync(dest, 'hello')

    const result = unlinkFile(dest)

    expect(result).toBe(false)
    expect(fs.existsSync(dest)).toBe(true)
  })

  test('存在しない場合、false を返す', () => {
    const dest = path.join(tmpDir, 'nonexistent.txt')

    const result = unlinkFile(dest)

    expect(result).toBe(false)
  })
})
