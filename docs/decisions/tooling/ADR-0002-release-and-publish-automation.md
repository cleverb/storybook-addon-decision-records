---
status: accepted
date: 2026-05-11
title: ADR-0002: Automate npm releases with semantic-release
---

# ADR-0002: Automate npm releases with semantic-release

## Context

Manual versioning leads to drift and delayed releases.

## Decision

Use semantic-release and GitHub Actions to produce npm releases from conventional commits.

## Consequences

Releases become consistent, auditable, and less error-prone.
