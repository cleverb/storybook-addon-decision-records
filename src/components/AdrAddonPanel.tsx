import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

import { Badge } from 'storybook/internal/components'
import { styled, useTheme } from 'storybook/theming'
import {
  useParameter,
  useStorybookApi,
  useStorybookState,
  type API,
} from 'storybook/manager-api'

import { MANIFEST_FILENAME } from '../constants'
import { buildGithubBlobUrl } from '../adrGithub'
import {
  DEFAULT_TAG_MATCH_REGEX,
  findEntryMatchingAdrTag,
  parsePanelLabel,
  parseTagMatchRegex,
} from '../adrTagConfig'
import { parseFrontmatter } from '../frontmatter'
import { setPanelLabelFromManifest } from '../panelLabelSync'
import type { AdrEntry, AdrManifestMeta } from '../types'
import { RuleType } from '../types'
import { AdrContextProvider, useAdrContext } from './AdrContext'
import { AdrDocumentChrome } from './AdrDocumentChrome'
import { AdrMarkdownBody } from './AdrMarkdownBody'
import { Tabs } from './Tabs'

const Tab = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
})

function manifestHref(): string {
  try {
    return new URL(MANIFEST_FILENAME, window.location.href).href
  } catch {
    return MANIFEST_FILENAME
  }
}

async function fetchManifest(href: string): Promise<{
  entries: AdrEntry[]
  categories: string[]
  indexReadme: string
  meta?: AdrManifestMeta
}> {
  const res = await fetch(href, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<{
    entries: AdrEntry[]
    categories: string[]
    indexReadme: string
    meta?: AdrManifestMeta
  }>
}

function stopBubble(ev: MouseEvent) {
  ev.stopPropagation()
}

function absorbButton(ev: MouseEvent) {
  ev.preventDefault()
  ev.stopPropagation()
}

function storyTags(
  api: API,
  storyId: string | undefined,
  refId: string | undefined,
): string[] {
  if (!storyId) return []
  const data = api.getData(storyId, refId)
  const raw = data?.tags
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string')
}

function matchingTagsForStory(tags: string[], tagPattern: string): string[] {
  let re: RegExp
  try {
    re = new RegExp(tagPattern)
  } catch {
    re = new RegExp(DEFAULT_TAG_MATCH_REGEX)
  }
  return tags.filter((t) => re.test(t))
}

function chipStyle(
  theme: {
    appBorderColor?: string
    background?: { hoverable?: string; tertiary?: string }
    color?: { default?: string }
  },
  on: boolean,
): React.CSSProperties {
  return {
    padding: '4px 10px',
    borderRadius: 999,
    border: `1px solid ${theme.appBorderColor ?? 'currentColor'}`,
    background: on
      ? (theme.background?.hoverable ??
        theme.background?.tertiary ??
        'transparent')
      : 'transparent',
    fontSize: 11,
    cursor: 'pointer',
    color: theme.color?.default ?? 'inherit',
  }
}

type AdrPanelContentProps = {
  manualTick: number
  api: API
  canOpenInEditor: boolean
}

function AdrPanelContent({
  manualTick,
  api,
  canOpenInEditor,
}: AdrPanelContentProps) {
  const theme = useTheme()
  const shell: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: 'var(--sb-font-body, ui-sans-serif, system-ui)',
    fontSize: 13,
    color: theme.color?.default ?? 'inherit',
    background: theme.background?.app ?? 'transparent',
  }
  const { tab, setTab } = useAdrContext()
  const sbState = useStorybookState()

  const [entries, setEntries] = useState<AdrEntry[]>([])
  const [readmeMd, setReadmeMd] = useState('')
  const [catList, setCatList] = useState<string[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshToken] = useState(0)

  const [manifestMeta, setManifestMeta] = useState<AdrManifestMeta>({
    githubBranch: 'main',
  })

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | 'all' | 'tagged'>('all')
  const [selected, setSelected] = useState<AdrEntry | null>(null)
  const [tagPattern, setTagPattern] = useState(DEFAULT_TAG_MATCH_REGEX)

  const entriesRef = useRef(entries)
  entriesRef.current = entries
  const lastStoryKeyDefaultedRef = useRef<string>('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    const href = manifestHref()
    fetchManifest(href)
      .then((data) => {
        if (cancelled) return
        setEntries(Array.isArray(data.entries) ? data.entries : [])
        setCatList(Array.isArray(data.categories) ? data.categories : [])
        setReadmeMd(
          typeof data.indexReadme === 'string' ? data.indexReadme : '',
        )
        const meta: AdrManifestMeta = {
          githubBranch:
            typeof data.meta?.githubBranch === 'string' &&
            data.meta.githubBranch.trim()
              ? data.meta.githubBranch.trim()
              : 'main',
        }
        if (
          typeof data.meta?.githubRepoUrl === 'string' &&
          data.meta.githubRepoUrl.trim()
        ) {
          meta.githubRepoUrl = data.meta.githubRepoUrl
            .trim()
            .replace(/\/+$/, '')
        }
        if (typeof data.meta?.indexReadmeEditorPath === 'string') {
          meta.indexReadmeEditorPath = data.meta.indexReadmeEditorPath
        }
        if (typeof data.meta?.indexReadmePathInRepo === 'string') {
          meta.indexReadmePathInRepo = data.meta.indexReadmePathInRepo
        }
        setManifestMeta(meta)
        setTagPattern(parseTagMatchRegex(data.meta?.tagMatchRegex))
        setPanelLabelFromManifest(parsePanelLabel(data.meta?.panelLabel))
      })
      .catch(() => {
        if (cancelled) return
        setLoadError(
          `Could not load ${MANIFEST_FILENAME}. Add staticDirs: ['../public'] (or your public path) in .storybook/main, run \`yarn dev\` or \`yarn storybook\` so \`public/${MANIFEST_FILENAME}\` is generated, then refresh this panel.`,
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshToken, manualTick])

  const activeTags = useMemo(
    () => storyTags(api, sbState.storyId, sbState.refId),
    [api, sbState.storyId, sbState.refId],
  )

  const taggedEntries = useMemo(() => {
    const matchingTags = matchingTagsForStory(activeTags, tagPattern)
    const hits: AdrEntry[] = []
    const seen = new Set<string>()
    // Storybook merges tags from multiple levels. Process from right-to-left so
    // story-level overrides win over inherited/default tags.
    for (const t of [...matchingTags].reverse()) {
      const hit = findEntryMatchingAdrTag(entries, t)
      if (!hit || seen.has(hit.id)) continue
      seen.add(hit.id)
      hits.push(hit)
    }
    return hits
  }, [activeTags, entries, tagPattern])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const source = cat === 'tagged' ? taggedEntries : entries
    return source.filter((row) => {
      if (cat !== 'all' && cat !== 'tagged' && row.category !== cat)
        return false
      if (!needle) return true
      return (
        row.title.toLowerCase().includes(needle) ||
        row.markdown.toLowerCase().includes(needle) ||
        row.category.toLowerCase().includes(needle)
      )
    })
  }, [q, cat, entries, taggedEntries])

  useEffect(() => {
    if (selected && !filtered.find((r) => r.id === selected.id))
      setSelected(null)
  }, [filtered, selected])

  useEffect(() => {
    if (loading || loadError) return
    const storyKey = `${sbState.storyId ?? ''}|${sbState.refId ?? ''}`
    const routingKey = `${storyKey}|${tagPattern}`
    const list = entriesRef.current
    const tags = storyTags(api, sbState.storyId, sbState.refId)
    const matchingTags = matchingTagsForStory(tags, tagPattern)
    const anyTagMatchesPattern = matchingTags.length > 0
    if (anyTagMatchesPattern && list.length === 0) {
      return
    }

    // Reverse to prefer story-level tags over inherited defaults.
    for (const t of [...matchingTags].reverse()) {
      const hit = findEntryMatchingAdrTag(list, t)
      if (hit) {
        setQ('')
        setCat('tagged')
        setSelected(hit)
        setTab(RuleType.PASS)
        lastStoryKeyDefaultedRef.current = routingKey
        return
      }
    }

    if (lastStoryKeyDefaultedRef.current === routingKey) {
      return
    }
    lastStoryKeyDefaultedRef.current = routingKey
    setTab(RuleType.VIOLATION)
    setCat('all')
    setSelected(null)
  }, [
    loading,
    loadError,
    sbState.storyId,
    sbState.refId,
    tagPattern,
    entries.length,
    api,
    setTab,
  ])

  const indexTitle = useMemo(() => {
    if (!readmeMd.trim()) return 'Documentation'
    const { body } = parseFrontmatter(readmeMd)
    const m = body.match(/^#\s+(.+)$/m)
    return m ? m[1].trim() : 'Documentation'
  }, [readmeMd])

  const indexGithubHref = useMemo(() => {
    if (!manifestMeta.githubRepoUrl || !manifestMeta.indexReadmePathInRepo)
      return null
    return buildGithubBlobUrl(
      manifestMeta.githubRepoUrl,
      manifestMeta.githubBranch,
      manifestMeta.indexReadmePathInRepo,
    )
  }, [manifestMeta])

  const selectedGithubHref = useMemo(() => {
    if (!selected?.pathInRepo || !manifestMeta.githubRepoUrl) return null
    return buildGithubBlobUrl(
      manifestMeta.githubRepoUrl,
      manifestMeta.githubBranch,
      selected.pathInRepo,
    )
  }, [selected, manifestMeta])

  const tabs = useMemo(() => {
    const border = theme.appBorderColor ?? 'currentColor'
    const hoverBg =
      theme.background?.hoverable ??
      theme.background?.tertiary ??
      'rgba(128,128,128,0.15)'

    if (loading) {
      const panel = (
        <div
          style={{
            padding: 16,
            color: theme.color?.default,
            background: theme.background?.app,
          }}
        >
          Loading ADRs…
        </div>
      )
      return [
        {
          label: <Tab>README</Tab>,
          panel,
          type: RuleType.VIOLATION,
        },
        {
          label: (
            <Tab>
              Browse
              <Badge
                compact
                status={tab === RuleType.PASS ? 'active' : 'neutral'}
              >
                {filtered.length}
              </Badge>
            </Tab>
          ),
          panel,
          type: RuleType.PASS,
        },
      ]
    }

    if (loadError) {
      const panel = (
        <div
          style={{
            padding: 16,
            maxWidth: 480,
            lineHeight: 1.5,
            color: theme.color?.default,
            background: theme.background?.app,
          }}
        >
          <strong>ADR data unavailable</strong>
          <p style={{ marginTop: 8 }}>{loadError}</p>
        </div>
      )
      return [
        {
          label: <Tab>README</Tab>,
          panel,
          type: RuleType.VIOLATION,
        },
        {
          label: (
            <Tab>
              Browse
              <Badge
                compact
                status={tab === RuleType.PASS ? 'active' : 'neutral'}
              >
                {filtered.length}
              </Badge>
            </Tab>
          ),
          panel,
          type: RuleType.PASS,
        },
        // {
        //   label: (
        //     <Tab>
        //       Inconclusive
        //       <Badge compact status={tab === RuleType.INCOMPLETION ? 'active' : 'neutral'}>
        //         {incomplete.length}
        //       </Badge>
        //     </Tab>
        //   ),
        //   panel,
        //   type: RuleType.INCOMPLETION,
        // },
      ]
    }

    const adrIndexReadmePanel = (
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {readmeMd ? (
              <>
                <AdrDocumentChrome
                  title={indexTitle}
                  date=""
                  status=""
                  canOpenInEditor={canOpenInEditor}
                  editorPath={manifestMeta.indexReadmeEditorPath}
                  githubHref={indexGithubHref}
                  api={api}
                />
                <div style={{ marginTop: 12 }}>
                  <AdrMarkdownBody markdown={readmeMd} stripLeadingH1 />
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.6, padding: 24 }}>No README found.</div>
            )}
          </div>
        </div>
      </div>
    )

    const adrBrowsePanel = (
      <div style={{ display: 'flex', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '42%',
                flexShrink: 0,
                borderRight: `1px solid ${border}`,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ flexShrink: 0, padding: 10, paddingBottom: 0 }}>
                <input
                  type="search"
                  placeholder="Search ADRs…"
                  value={q}
                  onClick={stopBubble}
                  onChange={(ev) => setQ(ev.target.value)}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: `1px solid ${border}`,
                    background: theme.background?.app,
                    color: theme.color?.default,
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  padding: '10px',
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={(ev) => {
                      absorbButton(ev)
                      setCat('all')
                    }}
                    style={chipStyle(theme, cat === 'all')}
                  >
                    All
                  </button>
                  {taggedEntries.length > 0 ? (
                    <button
                      type="button"
                      onClick={(ev) => {
                        absorbButton(ev)
                        setCat('tagged')
                      }}
                      style={chipStyle(theme, cat === 'tagged')}
                    >
                      Tagged
                    </button>
                  ) : null}
                  {catList.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={(ev) => {
                        absorbButton(ev)
                        setCat(c)
                      }}
                      style={chipStyle(theme, cat === c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {filtered.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={(ev) => {
                      absorbButton(ev)
                      setSelected(row)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      border: 'none',
                      borderBottom: `1px solid ${border}`,
                      background:
                        selected?.id === row.id ? hoverBg : 'transparent',
                      cursor: 'pointer',
                      color: theme.color?.default,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{row.title}</div>
                    <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                      {row.category} · {row.date || '—'} · {row.status || '—'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
                padding: 16,
              }}
              onClick={stopBubble}
            >
              {selected ? (
                <>
                  <AdrDocumentChrome
                    title={selected.title}
                    date={selected.date}
                    status={selected.status}
                    canOpenInEditor={canOpenInEditor}
                    editorPath={selected.editorPath}
                    githubHref={selectedGithubHref}
                    api={api}
                  />
                  <div style={{ marginTop: 12 }}>
                    <AdrMarkdownBody
                      key={selected.id}
                      markdown={selected.markdown}
                      stripLeadingH1
                    />
                  </div>
                </>
              ) : (
                <div style={{ opacity: 0.6, padding: 24, textAlign: 'center' }}>
                  Select an ADR from the list.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )

    return [
      {
        label: <Tab>README</Tab>,
        panel: adrIndexReadmePanel,
        type: RuleType.VIOLATION,
      },
      {
        label: (
          <Tab>
            Browse
            <Badge
              compact
              status={tab === RuleType.PASS ? 'active' : 'neutral'}
            >
              {filtered.length}
            </Badge>
          </Tab>
        ),
        panel: adrBrowsePanel,
        type: RuleType.PASS,
      },
    ]
  }, [
    loading,
    loadError,
    tab,
    readmeMd,
    q,
    cat,
    catList,
    taggedEntries,
    filtered,
    selected,
    manifestMeta,
    canOpenInEditor,
    api,
    indexTitle,
    indexGithubHref,
    selectedGithubHref,
    theme,
  ])

  return (
    <div style={shell} onClick={stopBubble}>
      <Tabs tabs={tabs} />
    </div>
  )
}

export function AdrAddonPanel({ active }: { active: boolean }) {
  // Grab the specific parameters passed to the active story
  const params = useParameter('adr', {})
  console.log('params::', params)
  console.log('active::', active)
  // useGlobals().setParameter('adr', { disable: active ? false : true });
  // useGlobals({ ['adr']: false });
  // addons.getChannel().emit?.(FORCE_RE_RENDER);

  const api = useStorybookApi()
  const state = useStorybookState()
  const canOpenInEditor =
    typeof globalThis !== 'undefined' &&
    (globalThis as { CONFIG_TYPE?: string }).CONFIG_TYPE === 'DEVELOPMENT' &&
    !state.refId

  const [manualTick, setManualTick] = useState(0)
  const onManual = useCallback(() => setManualTick((n) => n + 1), [])

  return (
    <AdrContextProvider onManual={onManual}>
      {/* <Toolbar
        storyFileName={storyFileName || undefined}
        importPath={importPath}
        canOpenInEditor={canOpenInEditor}
        api={api}
      /> */}
      <AdrPanelContent
        manualTick={manualTick}
        api={api}
        canOpenInEditor={canOpenInEditor}
      />
    </AdrContextProvider>
  )
}
