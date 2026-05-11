/** Scoped typography for sanitized HTML (GFM tables, code, lists, etc.). */
export const ADR_MD_CSS = `
.cleverboy-adr-md-wrap .cleverboy-adr-md-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root {
  font-size: 13px;
  line-height: 1.62;
  color: inherit;
  max-width: 52rem;
  word-break: break-word;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root > *:first-child { margin-top: 0; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root > *:last-child { margin-bottom: 0; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h1,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h2,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h3 {
  font-weight: 700;
  line-height: 1.28;
  margin: 1.05em 0 0.42em;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h1 { font-size: 1.38em; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h2 { font-size: 1.2em; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h3 { font-size: 1.08em; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h4,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h5,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root h6 {
  font-weight: 600;
  margin: 0.9em 0 0.32em;
  font-size: 1em;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root p { margin: 0.55em 0; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root ul,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root ol {
  margin: 0.55em 0;
  padding-left: 1.45em;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root li { margin: 0.22em 0; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root li > p { margin: 0.35em 0; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root blockquote {
  margin: 0.65em 0;
  padding: 0.35em 0 0.35em 0.85em;
  border-left: 3px solid var(--sb-color-border, #ccc);
  opacity: 0.94;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root table {
  border-collapse: collapse;
  width: max-content;
  max-width: 100%;
  margin: 0.85em 0;
  font-size: 0.95em;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root th,
.cleverboy-adr-md-wrap .cleverboy-adr-md-root td {
  border: 1px solid var(--sb-color-border, #ccc);
  padding: 0.42em 0.68em;
  text-align: left;
  vertical-align: top;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root thead th {
  background: var(--sb-color-secondary, #eaeaea);
  font-weight: 600;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root tbody tr:nth-child(even) td {
  background: rgba(127, 127, 127, 0.07);
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root tbody tr:hover td {
  background: rgba(127, 127, 127, 0.11);
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root pre {
  margin: 0.65em 0;
  padding: 0.75em 0.85em;
  overflow: auto;
  border-radius: 6px;
  background: var(--sb-color-secondary, #eaeaea);
  font-size: 0.88em;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92em;
  padding: 0.12em 0.35em;
  border-radius: 4px;
  background: var(--sb-color-secondary, #eaeaea);
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root pre code {
  padding: 0;
  background: transparent;
  font-size: inherit;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root hr {
  border: none;
  border-top: 1px solid var(--sb-color-border, #ccc);
  margin: 1.1em 0;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root a {
  color: var(--sb-color-secondary-text, #1a73e8);
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-root a:hover { text-decoration: underline; }
.cleverboy-adr-md-wrap .cleverboy-adr-md-root img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.cleverboy-adr-md-wrap .cleverboy-adr-md-error {
  color: #b00020;
  white-space: pre-wrap;
}
`
