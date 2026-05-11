import DOMPurify from 'dompurify'
import { marked } from 'marked'
import React, { useMemo } from 'react'
import { useTheme } from 'storybook/theming'

import { ADR_MD_CSS } from './adrMarkdownCss'
import { markdownSyntaxThemeCss } from '../markdownThemeCss'

marked.use({
  gfm: true,
  breaks: false,
})

function stripFrontmatter(md: string): string {
  const t = String(md || '').replace(/^\uFEFF/, '')
  if (!t.startsWith('---')) return t
  const rest = t.slice(3)
  const end = rest.search(/\n---\s*(?:\n|$)/)
  if (end === -1) return t
  return rest
    .slice(end)
    .replace(/^\n---\s*\n?/, '')
    .trimStart()
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type AdrMarkdownBodyProps = {
  markdown: string
  /** Remove first `# heading` line after frontmatter so it is not duplicated under {@link AdrDocumentChrome}. */
  stripLeadingH1?: boolean
}

function stripFirstMarkdownAtxHeading(afterFrontmatter: string): string {
  const t = String(afterFrontmatter || '').replace(/^\uFEFF/, '')
  const m = t.match(/^#\s+.+(?:\r?\n|$)/)
  if (!m || m.index === undefined) return t
  return t.slice(m.index + m[0].length).replace(/^\s+/, '')
}

/** GFM markdown → sanitized HTML (`marked` + `dompurify`). */
export function AdrMarkdownBody({
  markdown,
  stripLeadingH1,
}: AdrMarkdownBodyProps) {
  const theme = useTheme()
  const html = useMemo(() => {
    let text = stripFrontmatter(markdown)
    if (stripLeadingH1) {
      text = stripFirstMarkdownAtxHeading(text)
    }
    if (!String(text).trim()) return ''
    try {
      const raw = marked.parse(text)
      return typeof raw === 'string'
        ? DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] })
        : ''
    } catch (err) {
      return DOMPurify.sanitize(
        `<pre class="cleverboy-adr-md-error">${escapeHtml(String(err))}</pre>`,
      )
    }
  }, [markdown, stripLeadingH1])

  const mdCss = useMemo(
    () => `${ADR_MD_CSS}\n${markdownSyntaxThemeCss(theme)}`,
    [theme],
  )

  if (!html.trim()) {
    return <p style={{ opacity: 0.7, margin: 0 }}>(empty)</p>
  }

  return (
    <div className="cleverboy-adr-md-wrap">
      <style>{mdCss}</style>
      <div className="cleverboy-adr-md-scroll">
        <div
          className="cleverboy-adr-md-root"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
