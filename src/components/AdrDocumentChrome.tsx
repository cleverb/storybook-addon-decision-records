import React from 'react'

import { Button } from 'storybook/internal/components'
import { GithubIcon, EditorIcon } from '@storybook/icons'
import type { API } from 'storybook/manager-api'
import { styled } from 'storybook/theming'

type ThemeLike = {
  color?: { default?: string; secondary?: string }
  appBorderColor?: string
  background?: { app?: string }
}

const Title = styled.h1((p: { theme: ThemeLike }) => ({
  margin: 0,
  fontFamily: 'var(--sb-font-heading, Georgia, "Times New Roman", serif)',
  fontSize: 22,
  fontWeight: 600,
  lineHeight: 1.25,
  color: p.theme.color?.default ?? 'inherit',
}))

const Rule = styled.div((p: { theme: ThemeLike }) => ({
  height: 1,
  background: p.theme.appBorderColor ?? 'var(--sb-color-border, #ddd)',
  marginTop: 12,
  marginBottom: 12,
}))

const MetaRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
})

const MetaLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  fontSize: 12,
  opacity: 0.85,
})

const StatusPill = styled.span((p: { theme: ThemeLike }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  background: p.theme.background?.app ?? 'rgba(0,0,0,0.06)',
  border: `1px solid ${p.theme.appBorderColor ?? '#ddd'}`,
}))

const Actions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
})

const IconAnchor = styled.a((p: { theme: ThemeLike }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 4,
  color: p.theme.color?.secondary ?? '#1ea7fd',
  border: `1px solid ${p.theme.appBorderColor ?? 'transparent'}`,
  textDecoration: 'none',
  '&:hover': {
    background: p.theme.background?.app ?? 'rgba(0,0,0,0.05)',
  },
}))

export type AdrDocumentChromeProps = {
  title: string
  /** Raw ISO or display string from frontmatter */
  date: string
  status: string
  canOpenInEditor: boolean
  editorPath?: string
  githubHref?: string | null
  api: API
}

function formatDateLabel(raw: string): string {
  const t = String(raw || '').trim()
  if (!t) return '—'
  const d = new Date(t)
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return t
}

export function AdrDocumentChrome({
  title,
  date,
  status,
  canOpenInEditor,
  editorPath,
  githubHref,
  api,
}: AdrDocumentChromeProps) {
  const dateLabel = formatDateLabel(date)
  const rawStatus = String(status || '').trim()
  const showMetaLeft = dateLabel !== '—' || rawStatus.length > 0

  return (
    <header>
      <Title>{title}</Title>
      <Rule />
      <MetaRow>
        {showMetaLeft ? (
          <MetaLeft>
            {dateLabel !== '—' ? <span>{dateLabel}</span> : null}
            {rawStatus ? <StatusPill>{rawStatus}</StatusPill> : null}
          </MetaLeft>
        ) : (
          <span style={{ flex: 1 }} />
        )}
        <Actions>
          {canOpenInEditor && editorPath ? (
            <Button
              padding="small"
              variant="ghost"
              ariaLabel="Open ADR in editor"
              onClick={() => {
                api.openInEditor({ file: editorPath })
              }}
            >
              <EditorIcon />
            </Button>
          ) : null}
          {githubHref ? (
            <IconAnchor
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              title="View file on GitHub"
              aria-label="View file on GitHub"
            >
              <GithubIcon />
            </IconAnchor>
          ) : null}
        </Actions>
      </MetaRow>
    </header>
  )
}
