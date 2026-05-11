import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { scanAdrs } from '../scan'

describe('scanAdrs', () => {
  it('scans categories and sorts ADR files by numeric id', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adr-scan-'))
    const adrRoot = path.join(tmp, 'docs', 'decisions')
    fs.mkdirSync(path.join(adrRoot, 'frontend'), { recursive: true })

    fs.writeFileSync(
      path.join(adrRoot, 'frontend', 'ADR-0002-second.md'),
      '# Second\n',
      'utf8',
    )
    fs.writeFileSync(
      path.join(adrRoot, 'frontend', 'ADR-0001-first.md'),
      '# First\n',
      'utf8',
    )

    const result = scanAdrs(adrRoot, ['frontend'], {
      appRoot: tmp,
      repoRoot: tmp,
    })

    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].filename).toBe('ADR-0001-first.md')
    expect(result.entries[1].filename).toBe('ADR-0002-second.md')
  })
})
