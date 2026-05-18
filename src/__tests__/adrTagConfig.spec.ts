import { describe, expect, it } from 'vitest'

import {
  DEFAULT_HIDE_PANEL_WHEN_NOT_TAGGED,
  DEFAULT_PANEL_LABEL,
  DEFAULT_TAG_MATCH_REGEX,
  parseHidePanelWhenNotTagged,
  parsePanelLabel,
  parseTagMatchRegex,
} from '../adrTagConfig'

describe('adrTagConfig', () => {
  it('parses tag regex with fallback', () => {
    expect(parseTagMatchRegex('ADR-\\d{4}')).toBe('ADR-\\d{4}')
    expect(parseTagMatchRegex('')).toBe(DEFAULT_TAG_MATCH_REGEX)
    expect(parseTagMatchRegex('[')).toBe(DEFAULT_TAG_MATCH_REGEX)
  })

  it('parses panel label with fallback', () => {
    expect(parsePanelLabel('Decision Records')).toBe('Decision Records')
    expect(parsePanelLabel('  ')).toBe(DEFAULT_PANEL_LABEL)
    expect(parsePanelLabel('ab')).toBe(DEFAULT_PANEL_LABEL)
  })

  it('parses hidePanelWhenNotTagged as strict boolean true', () => {
    expect(DEFAULT_HIDE_PANEL_WHEN_NOT_TAGGED).toBe(false)
    expect(parseHidePanelWhenNotTagged(true)).toBe(true)
    expect(parseHidePanelWhenNotTagged(false)).toBe(false)
    expect(parseHidePanelWhenNotTagged('true')).toBe(false)
    expect(parseHidePanelWhenNotTagged(undefined)).toBe(false)
  })
})
