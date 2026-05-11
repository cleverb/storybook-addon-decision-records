import { describe, expect, it } from 'vitest'

import { parseFrontmatter, titleFromBody } from '../frontmatter'

describe('frontmatter', () => {
  it('parses key value frontmatter and body', () => {
    const raw = [
      '---',
      'status: accepted',
      'date: 2026-01-01',
      '---',
      '# Title',
      'Body',
    ].join('\n')
    const parsed = parseFrontmatter(raw)
    expect(parsed.data.status).toBe('accepted')
    expect(parsed.data.date).toBe('2026-01-01')
    expect(parsed.body).toContain('# Title')
  })

  it('extracts title from markdown heading', () => {
    expect(titleFromBody('Text\n# Heading Here\nMore')).toBe('Heading Here')
  })
})
