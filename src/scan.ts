import fs from 'node:fs'
import path from 'node:path'

import type { AdrEntry } from './types'
import { parseFrontmatter, titleFromBody } from './frontmatter'

/** Normalize to forward slashes for JSON + URLs. */
export function toPosixPath(p: string): string {
  return p.split(path.sep).join('/')
}

export function scanAdrs(
  adrRoot: string,
  categories: string[] | null | undefined,
  roots: { appRoot: string; repoRoot: string },
): { entries: AdrEntry[]; categories: string[] } {
  if (!fs.existsSync(adrRoot) || !fs.statSync(adrRoot).isDirectory()) {
    return { entries: [], categories: [] }
  }

  const entries: AdrEntry[] = []

  let cats: string[]
  if (categories && categories.length > 0) {
    cats = [...categories]
  } else {
    const dirents = fs.readdirSync(adrRoot, { withFileTypes: true })
    cats = dirents.filter((d) => d.isDirectory()).map((d) => d.name)
  }

  for (const cat of cats) {
    const dir = path.join(adrRoot, cat)
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.md'))
    for (const file of files) {
      const fp = path.join(dir, file)
      const abs = path.resolve(fp)
      const raw = fs.readFileSync(fp, 'utf8')
      const { data, body } = parseFrontmatter(raw)
      const title = data.title || titleFromBody(body)
      const editorPath = toPosixPath(path.relative(roots.appRoot, abs))
      const pathInRepo = toPosixPath(path.relative(roots.repoRoot, abs))
      entries.push({
        id: `${cat}/${file}`,
        category: cat,
        filename: file,
        title,
        date: data.date || '',
        status: data.status || '',
        markdown: raw,
        editorPath,
        pathInRepo,
      })
    }
  }

  const adrNumericId = (filename: string): number | null => {
    const m = /^ADR-(\d{4})-/i.exec(filename)
    return m ? parseInt(m[1], 10) : null
  }

  entries.sort((a, b) => {
    const na = adrNumericId(a.filename)
    const nb = adrNumericId(b.filename)
    if (na != null && nb != null && na !== nb) return na - nb
    if (na != null && nb == null) return -1
    if (na == null && nb != null) return 1
    const byDate = String(b.date).localeCompare(String(a.date))
    if (byDate !== 0) return byDate
    return a.filename.localeCompare(b.filename)
  })

  return { entries, categories: cats }
}
