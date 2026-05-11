import type { AdrEntry } from './types'

/** Default: matches tags like `ADR-0001` (see `docs/decisions` filename prefix). */
export const DEFAULT_TAG_MATCH_REGEX = 'ADR-[0-9]+'

export const DEFAULT_PANEL_LABEL = 'ADRs'

export function parseTagMatchRegex(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return DEFAULT_TAG_MATCH_REGEX
  const s = raw.trim()
  try {
    void new RegExp(s)
    return s
  } catch {
    console.warn(
      `[@cleverb/storybook-addon-adr] Invalid tagMatchRegex ${JSON.stringify(s)}; using default ${JSON.stringify(DEFAULT_TAG_MATCH_REGEX)}.`,
    )
    return DEFAULT_TAG_MATCH_REGEX
  }
}

export function parsePanelLabel(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_PANEL_LABEL
  const t = raw.trim()
  if (t.length < 3) return DEFAULT_PANEL_LABEL
  return t
}

export function findEntryMatchingAdrTag(
  entries: AdrEntry[],
  tag: string,
): AdrEntry | undefined {
  const prefix = `${tag}-`
  return entries.find((e) => e.filename.startsWith(prefix))
}
