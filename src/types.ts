export type AdrEntry = {
  id: string
  category: string
  filename: string
  title: string
  date: string
  status: string
  markdown: string
  /** Path relative to Storybook app root (e.g. `apps/web`) for `api.openInEditor`. */
  editorPath?: string
  /** Path relative to monorepo root for GitHub `blob/` URLs. */
  pathInRepo?: string
}

/** Written next to `entries` in `sb-adr-data.json` (from addon options + env at scan time). */
export type AdrManifestMeta = {
  githubRepoUrl?: string
  githubBranch: string
  indexReadmeEditorPath?: string
  indexReadmePathInRepo?: string
  /** Regex tested against each story tag; first matching tag with a resolved ADR wins. */
  tagMatchRegex?: string
  /** Manager panel tab label (min 3 characters; otherwise "ADRs"). */
  panelLabel?: string
  /** Auto-disable panel on stories without a qualifying ADR tag match. */
  hidePanelWhenNotTagged?: boolean
}

export type AdrManifestPayload = {
  entries: AdrEntry[]
  categories: string[]
  indexReadme: string
  meta?: AdrManifestMeta
}

export const RuleType = {
  VIOLATION: 'violations',
  PASS: 'passes',
  INCOMPLETION: 'incomplete',
} as const

export type RuleType = (typeof RuleType)[keyof typeof RuleType]

/** Manager-only stubs so the a11y-style `Tabs` shell type-checks without axe-core in this package. */
export type EnhancedResult = {
  id: string
  nodes: Array<{ target: unknown }>
}

export type EnhancedResults = {
  violations: EnhancedResult[]
  passes: EnhancedResult[]
  incomplete: EnhancedResult[]
}

export const EMPTY_ADR_RESULTS: EnhancedResults = {
  violations: [],
  passes: [],
  incomplete: [],
}

export type AdrParameters = Record<string, unknown>

export type AdrUiStatus =
  | 'initial'
  | 'manual'
  | 'running'
  | 'error'
  | 'ran'
  | 'ready'
  | 'component-test-error'

export type TestDiscrepancy =
  | null
  | 'cliPassedBrowserFailed'
  | 'browserPassedCliFailed'
  | 'cliFailedButModeManual'
