/** Build `https://github.com/org/repo/blob/branch/path/to/file.md` from repo root-relative path. */
export function buildGithubBlobUrl(
  repoUrl: string,
  branch: string,
  pathInRepo: string,
): string {
  const base = repoUrl.replace(/\/+$/, '')
  const rel = pathInRepo
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
  return `${base}/blob/${encodeURIComponent(branch)}/${rel}`
}
