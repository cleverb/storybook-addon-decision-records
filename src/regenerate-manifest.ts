import fs from 'node:fs'
import path from 'node:path'

import { MANIFEST_FILENAME } from './constants'
import { scanAdrs, toPosixPath } from './scan'
import type { AdrManifestMeta, AdrManifestPayload } from './types'
import {
  parseHidePanelWhenNotTagged,
  parsePanelLabel,
  parseTagMatchRegex,
} from './adrTagConfig'

export function writeSbAdrData(
  appRoot: string,
  payload: AdrManifestPayload,
): void {
  const outPath = path.join(appRoot, 'public', MANIFEST_FILENAME)
  const dir = path.dirname(outPath)
  fs.mkdirSync(dir, { recursive: true })
  const body = JSON.stringify(
    {
      entries: payload.entries,
      categories: payload.categories,
      indexReadme: payload.indexReadme || '',
      meta: payload.meta ?? { githubBranch: 'main' },
    },
    null,
    0,
  )
  fs.writeFileSync(outPath, body, 'utf8')
}

export type RegenerateSbAdrDataOpts = {
  appRoot: string
  adrRoot: string
  categories?: string[] | null
  indexReadmePath?: string | null
  /** Monorepo root for GitHub paths; defaults to two levels above `appRoot`. */
  repoRoot?: string | null
  /** e.g. `https://github.com/org/repo` (no `/blob`). From options or `STORYBOOK_ADR_GITHUB_REPO`. */
  githubRepoUrl?: string | null
  /** From options, `STORYBOOK_ADR_GITHUB_BRANCH`, or `main`. */
  githubBranch?: string | null
  /** Regex string matched against story tags; default `ADR-[0-9]+`. */
  tagMatchRegex?: string | null
  /** Panel tab label (min 3 chars); default `ADRs`. */
  panelLabel?: string | null
  /** Auto-disable panel on stories without qualifying ADR tags. */
  hidePanelWhenNotTagged?: boolean | null
}

/** Scan ADRs and write `public/sb-adr-data.json` under `appRoot`. */
export function regenerateSbAdrData(opts: RegenerateSbAdrDataOpts): void {
  const {
    appRoot,
    adrRoot,
    categories,
    indexReadmePath,
    tagMatchRegex,
    panelLabel,
    hidePanelWhenNotTagged,
  } = opts

  const repoRoot =
    typeof opts.repoRoot === 'string' && opts.repoRoot.trim().length > 0
      ? path.isAbsolute(opts.repoRoot)
        ? path.resolve(opts.repoRoot)
        : path.resolve(appRoot, opts.repoRoot)
      : path.resolve(appRoot, '..', '..')

  const githubRepoRaw =
    (typeof opts.githubRepoUrl === 'string' && opts.githubRepoUrl.trim()) ||
    (typeof process.env.STORYBOOK_ADR_GITHUB_REPO === 'string' &&
      process.env.STORYBOOK_ADR_GITHUB_REPO.trim()) ||
    ''
  const githubRepoUrl = githubRepoRaw
    ? githubRepoRaw.replace(/\/+$/, '')
    : undefined

  const githubBranch =
    (typeof opts.githubBranch === 'string' && opts.githubBranch.trim()) ||
    (typeof process.env.STORYBOOK_ADR_GITHUB_BRANCH === 'string' &&
      process.env.STORYBOOK_ADR_GITHUB_BRANCH.trim()) ||
    'main'

  let indexReadme = ''
  if (indexReadmePath && fs.existsSync(indexReadmePath)) {
    indexReadme = fs.readFileSync(indexReadmePath, 'utf8')
  }

  const hasRoot =
    typeof adrRoot === 'string' && adrRoot.length > 0 && fs.existsSync(adrRoot)
  const { entries, categories: resolvedCats } = hasRoot
    ? scanAdrs(adrRoot, categories ?? undefined, {
        appRoot: path.resolve(appRoot),
        repoRoot,
      })
    : { entries: [], categories: [] as string[] }

  const meta: AdrManifestMeta = { githubBranch }
  if (githubRepoUrl) meta.githubRepoUrl = githubRepoUrl
  if (indexReadmePath && fs.existsSync(indexReadmePath)) {
    const absReadme = path.resolve(indexReadmePath)
    meta.indexReadmeEditorPath = toPosixPath(
      path.relative(path.resolve(appRoot), absReadme),
    )
    meta.indexReadmePathInRepo = toPosixPath(path.relative(repoRoot, absReadme))
  }
  meta.tagMatchRegex = parseTagMatchRegex(tagMatchRegex)
  meta.panelLabel = parsePanelLabel(panelLabel)
  meta.hidePanelWhenNotTagged = parseHidePanelWhenNotTagged(
    hidePanelWhenNotTagged,
  )

  writeSbAdrData(appRoot, {
    entries,
    categories: resolvedCats || [],
    indexReadme,
    meta,
  })
}
