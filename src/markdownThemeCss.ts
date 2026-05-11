/** Theme-aware overrides for markdown chrome (manager panel has no reliable `--sb-*` fallbacks). */
export function markdownSyntaxThemeCss(theme: {
  appBorderColor?: string
  background?: { app?: string; tertiary?: string }
  color?: { default?: string; secondary?: string }
}): string {
  const border = theme.appBorderColor ?? 'currentColor'
  const surface = theme.background?.app ?? 'transparent'
  const tertiary = theme.background?.tertiary ?? surface
  const link = theme.color?.secondary ?? '#1ea7fd'
  const defaultText = theme.color?.default ?? 'inherit'

  return `
.cleverboy-adr-md-wrap .cleverboy-adr-md-root blockquote {
  border-left-color: ${border};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root th,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root td {
  border-color: ${border};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root thead th {
  background: ${tertiary};
  color: ${defaultText};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root tbody tr:nth-child(even) td {
  background: color-mix(in srgb, ${defaultText} 6%, ${surface});
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root tbody tr:hover td {
  background: color-mix(in srgb, ${defaultText} 10%, ${surface});
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root pre {
  background: ${tertiary};
  color: ${defaultText};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root code {
  background: ${tertiary};
  color: ${defaultText};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root hr {
  border-top-color: ${border};
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root a {
  color: ${link};
}
`
}
