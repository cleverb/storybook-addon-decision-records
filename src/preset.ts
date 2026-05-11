import fs from 'node:fs'
import path from 'node:path'

import type { Plugin, UserConfig } from 'vite'

import { regenerateSbAdrData } from './regenerate-manifest'

function withAdrAddonOptionsFromMain(
  options: Record<string, unknown>,
): Record<string, unknown> {
  if (!options || typeof options !== 'object') return options

  const fromAddons = extractAdrOptionsFromAddonsList(options.addons)
  if (fromAddons) return { ...options, ...fromAddons }

  const fromPresets = extractAdrOptionsFromAddonsList(options.presets)
  if (fromPresets) return { ...options, ...fromPresets }

  return options
}

function extractAdrOptionsFromAddonsList(
  addons: unknown,
): Record<string, unknown> | null {
  if (!Array.isArray(addons)) return null
  for (const entry of addons) {
    const picked = extractAdrOptionsFromAddonEntry(entry)
    if (picked) return picked
  }
  return null
}

function extractAdrOptionsFromAddonEntry(
  entry: unknown,
): Record<string, unknown> | null {
  if (!entry || typeof entry !== 'object') return null
  const e = entry as { name?: string; options?: unknown; presets?: unknown[] }
  if (
    typeof e.name === 'string' &&
    (e.name === '@cleverb/storybook-addon-adr' ||
      e.name.includes('storybook-addon-adr'))
  ) {
    if (e.options && typeof e.options === 'object')
      return e.options as Record<string, unknown>
    return null
  }
  if (Array.isArray(e)) return extractAdrOptionsFromAddonsList(e)
  if (Array.isArray(e.presets)) {
    const inner = extractAdrOptionsFromAddonsList(e.presets)
    if (inner) return inner
  }
  return null
}

type ResolvedAdrPaths = {
  adrRoot: string | null
  categories: string[] | undefined
  indexReadmePath: string | null
}

function resolveAdrPaths(options: Record<string, unknown>): ResolvedAdrPaths {
  const configDir =
    typeof options.configDir === 'string' ? options.configDir : process.cwd()
  const appRoot = path.resolve(configDir, '..')

  const adrRootRaw =
    (typeof options.adrRoot === 'string' && options.adrRoot) ||
    (typeof process.env.STORYBOOK_ADR_ROOT === 'string' &&
      process.env.STORYBOOK_ADR_ROOT) ||
    null

  if (!adrRootRaw) {
    console.warn(
      '[@cleverb/storybook-addon-adr] Missing `adrRoot`. Add to .storybook/main: { name: "@cleverb/storybook-addon-adr", options: { adrRoot: "…" } } or set STORYBOOK_ADR_ROOT.',
    )
    return {
      adrRoot: null,
      categories: undefined,
      indexReadmePath: null,
    }
  }

  const adrRoot = path.isAbsolute(adrRootRaw)
    ? adrRootRaw
    : path.resolve(appRoot, adrRootRaw)

  let categories: string[] | undefined
  if (Array.isArray(options.categories) && options.categories.length > 0) {
    categories = options.categories.filter(
      (c): c is string => typeof c === 'string',
    )
  }

  const readmeRaw =
    (typeof options.indexReadmePath === 'string' && options.indexReadmePath) ||
    (typeof process.env.STORYBOOK_ADR_INDEX_README === 'string' &&
      process.env.STORYBOOK_ADR_INDEX_README) ||
    null
  const indexReadmePath = readmeRaw
    ? path.isAbsolute(readmeRaw)
      ? readmeRaw
      : path.resolve(appRoot, readmeRaw)
    : null

  return { adrRoot, categories, indexReadmePath }
}

function resolveRepoRoot(
  merged: Record<string, unknown>,
  appRoot: string,
): string {
  const raw = merged.repoRoot
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(appRoot, raw)
  }
  return path.resolve(appRoot, '..', '..')
}

function resolveGithubOptions(
  merged: Record<string, unknown>,
  viteEnv: Record<string, string> = {},
): {
  githubRepoUrl: string | undefined
  githubBranch: string
} {
  const fromOptions =
    typeof merged.githubRepoUrl === 'string' && merged.githubRepoUrl.trim()
      ? merged.githubRepoUrl.trim()
      : undefined
  const fromVite =
    typeof viteEnv.STORYBOOK_ADR_GITHUB_REPO === 'string' &&
    viteEnv.STORYBOOK_ADR_GITHUB_REPO.trim()
      ? viteEnv.STORYBOOK_ADR_GITHUB_REPO.trim()
      : undefined
  const fromEnv =
    typeof process.env.STORYBOOK_ADR_GITHUB_REPO === 'string' &&
    process.env.STORYBOOK_ADR_GITHUB_REPO.trim()
      ? process.env.STORYBOOK_ADR_GITHUB_REPO.trim()
      : undefined
  const githubRepoUrl =
    (fromOptions ?? fromVite ?? fromEnv)?.replace(/\/+$/, '') || undefined

  const branchFromOptions =
    typeof merged.githubBranch === 'string' && merged.githubBranch.trim()
      ? merged.githubBranch.trim()
      : undefined
  const branchFromVite =
    typeof viteEnv.STORYBOOK_ADR_GITHUB_BRANCH === 'string' &&
    viteEnv.STORYBOOK_ADR_GITHUB_BRANCH.trim()
      ? viteEnv.STORYBOOK_ADR_GITHUB_BRANCH.trim()
      : undefined
  const branchFromEnv =
    typeof process.env.STORYBOOK_ADR_GITHUB_BRANCH === 'string' &&
    process.env.STORYBOOK_ADR_GITHUB_BRANCH.trim()
      ? process.env.STORYBOOK_ADR_GITHUB_BRANCH.trim()
      : undefined
  const githubBranch =
    branchFromOptions ?? branchFromVite ?? branchFromEnv ?? 'main'

  return { githubRepoUrl, githubBranch }
}

/** Manager UI is loaded once via `package.json` `exports["./manager"]` (see `manager.js`); do not add `managerEntries` here or Storybook loads the addon twice. */

export async function viteFinal(
  config: UserConfig,
  options: Record<string, unknown>,
): Promise<UserConfig> {
  const merged: Record<string, unknown> = {
    ...withAdrAddonOptionsFromMain(options),
    ...(typeof options.configDir === 'string'
      ? { configDir: options.configDir }
      : {}),
  }

  const configDir =
    typeof merged.configDir === 'string' ? merged.configDir : process.cwd()
  const appRoot = path.resolve(configDir, '..')
  const repoRoot = resolveRepoRoot(merged, appRoot)
  const mode =
    (typeof config.mode === 'string' && config.mode) ||
    process.env.MODE ||
    'development'
  const { loadEnv } = await import('vite')
  const viteLoadedEnv: Record<string, string> = {
    ...loadEnv(mode, appRoot, ''),
    ...loadEnv(mode, repoRoot, ''),
  }

  const runScan = () => {
    const { adrRoot, categories, indexReadmePath } = resolveAdrPaths(merged)
    const { githubRepoUrl, githubBranch } = resolveGithubOptions(
      merged,
      viteLoadedEnv,
    )
    regenerateSbAdrData({
      appRoot,
      adrRoot: adrRoot || '',
      categories,
      indexReadmePath,
      repoRoot,
      githubRepoUrl,
      githubBranch,
      tagMatchRegex:
        typeof merged.tagMatchRegex === 'string'
          ? merged.tagMatchRegex
          : undefined,
      panelLabel:
        typeof merged.panelLabel === 'string' ? merged.panelLabel : undefined,
    })
  }

  runScan()

  const { adrRoot: adrRootForWatch } = resolveAdrPaths(merged)
  const watchRoot =
    adrRootForWatch && fs.existsSync(adrRootForWatch)
      ? path.resolve(adrRootForWatch)
      : null

  let debounce: ReturnType<typeof setTimeout> | null = null
  const scheduleScan = () => {
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => {
      debounce = null
      runScan()
    }, 120)
  }

  const adrWatchPlugin: Plugin | null = watchRoot
    ? {
        name: 'cleverboy-adr-manifest-watch',
        configureServer(server) {
          server.watcher.add(watchRoot)
          const onFs = (file: string) => {
            if (typeof file === 'string' && file.startsWith(watchRoot))
              scheduleScan()
          }
          server.watcher.on('change', onFs)
          server.watcher.on('add', onFs)
          server.watcher.on('unlink', onFs)
        },
      }
    : null

  const plugins = [...(config.plugins ?? [])]
  if (adrWatchPlugin) plugins.push(adrWatchPlugin)

  return {
    ...config,
    plugins,
  }
}
