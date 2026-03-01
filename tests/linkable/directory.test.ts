import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { linkDirectory, unlinkDirectory } from '../../src/linkable/directory.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'don-dir-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('linkDirectory', () => {
  test('ソースディレクトリが存在する場合、シンボリックリンクを作成して true を返す', () => {
    const source = path.join(tmpDir, 'srcdir')
    const dest = path.join(tmpDir, 'destdir')
    fs.mkdirSync(source)

    const result = linkDirectory(source, dest)

    expect(result).toBe(true)
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(true)
    expect(fs.readlinkSync(dest)).toBe(source)
  })

  test('ソースが存在しない場合、false を返す', () => {
    const source = path.join(tmpDir, 'nonexistent')
    const dest = path.join(tmpDir, 'destdir')

    const result = linkDirectory(source, dest)

    expect(result).toBe(false)
    expect(fs.existsSync(dest)).toBe(false)
  })

  test('destination が通常ディレクトリの場合、スキップして false を返す', () => {
    const source = path.join(tmpDir, 'srcdir')
    const dest = path.join(tmpDir, 'destdir')
    fs.mkdirSync(source)
    fs.mkdirSync(dest)

    const result = linkDirectory(source, dest)

    expect(result).toBe(false)
    expect(fs.lstatSync(dest).isSymbolicLink()).toBe(false)
  })

  test('既存シンボリックリンクがある場合、削除して再作成する', () => {
    const source1 = path.join(tmpDir, 'srcdir1')
    const source2 = path.join(tmpDir, 'srcdir2')
    const dest = path.join(tmpDir, 'destdir')
    fs.mkdirSync(source1)
    fs.mkdirSync(source2)
    fs.symlinkSync(source1, dest)

    const result = linkDirectory(source2, dest)

    expect(result).toBe(true)
    expect(fs.readlinkSync(dest)).toBe(source2)
  })
})

describe('unlinkDirectory', () => {
  test('シンボリックリンクの場合、削除して true を返す', () => {
    const source = path.join(tmpDir, 'srcdir')
    const dest = path.join(tmpDir, 'destdir')
    fs.mkdirSync(source)
    fs.symlinkSync(source, dest)

    const result = unlinkDirectory(dest)

    expect(result).toBe(true)
    expect(fs.existsSync(dest)).toBe(false)
  })

  test('通常ディレクトリの場合、false を返す（削除しない）', () => {
    const dest = path.join(tmpDir, 'realdir')
    fs.mkdirSync(dest)

    const result = unlinkDirectory(dest)

    expect(result).toBe(false)
    expect(fs.existsSync(dest)).toBe(true)
  })

  test('存在しない場合、false を返す', () => {
    const dest = path.join(tmpDir, 'nonexistent')

    const result = unlinkDirectory(dest)

    expect(result).toBe(false)
  })
})
