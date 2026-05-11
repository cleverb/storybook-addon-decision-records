/** YAML frontmatter parser for ADR markdown (no Node deps — safe for Storybook manager bundle). */
export function parseFrontmatter(content: string): {
  data: Record<string, string>
  body: string
} {
  const lines = content.split(/\r?\n/)
  if (lines[0] !== '---') return { data: {}, body: content }
  const end = lines.indexOf('---', 1)
  if (end === -1) return { data: {}, body: content }
  const fmLines = lines.slice(1, end)
  const body = lines.slice(end + 1).join('\n')
  const data: Record<string, string> = {}
  for (const line of fmLines) {
    const m = line.match(/^([\w-]+):\s*(.*)$/)
    if (m) data[m[1]] = m[2].trim()
  }
  return { data, body }
}

export function titleFromBody(body: string): string {
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : 'Untitled'
}
