---
status: accepted
date: 2026-05-11
title: ADR-0001: Add a Storybook ADR manager panel
---

# ADR-0001: Add a Storybook ADR manager panel

## Context

Teams need architecture decisions discoverable while reviewing component stories.

## Decision

Use `storybook-addon-decision-records` to index markdown ADR files and render them in a Storybook manager panel.

## Consequences

Decision visibility improves in design and implementation workflows.

## Implementation History

- 2026-05-17: Added a `Tagged` browse filter path for story-tagged ADRs and
  introduced `hidePanelWhenNotTagged` (default `false`) so consumers can hide
  the panel when no story tags resolve via `tagMatchRegex`.
