---
status: accepted
date: 2026-05-03
decision-makers: Dudley Bryan
---

# ADR-0006: Storybook configuration and addons (Example adaptation)

## Context and Problem Statement

This repository uses [Storybook](https://storybook.js.org/) for isolated component development and documentation. We maintain a static build alongside the main application, and our Storybook configuration, versioning, and addon usage are centrally documented for upgrade traceability and regression debugging.

**Note:** Storybook maintainers deprecated Yarn Plug'n'Play (PnP) support starting v10. If your monorepo still relies on Yarn PnP, expect warnings and some workarounds until a migration to `nodeLinker: node-modules` (or another supported linker) is feasible.

## Decision

### Version Management

All core Storybook and addon packages should be kept on a **single, aligned version** in your main Storybook package manifest (e.g. `package.json`). Example versions used when this was written:

| Package                        | Version |
| ------------------------------ | ------- |
| `storybook`                    | 10.3.6  |
| `@storybook/react-vite`        | 10.3.6  |
| `@storybook/react`             | 10.3.6  |
| `@storybook/builder-vite`      | 10.3.6  |
| `@storybook/addon-docs`        | 10.3.6  |
| `@storybook/addon-a11y`        | 10.3.6  |
| `@storybook/addon-themes`      | 10.3.6  |
| `@storybook/addon-vitest`      | 10.3.6  |
| `@vueless/storybook-dark-mode` | 10.0.8  |

**Peer Chain Note:** List `@storybook/react` directly to ensure the CLI’s peer dependencies resolve under strict PnP; listing via transitive only (`react-vite`) may fail.

**Upgrade Policy:** Always upgrade all listed Storybook-related packages together and follow a **one-major-at-a-time** upgrade path (e.g. 8 → 9, then 9 → 10, not 8 → 10 directly).

### Framework / Stories

- **Framework:** Prefer `@storybook/react-vite` for React + Vite projects.
- **Stories glob:** Place stories in `../src/**/*.stories.@(ts|tsx|js|jsx|mjs)` (relative to your `.storybook/` directory).

### Addons Used (as an example)

| Add-on                         | Role                                                                                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@storybook/addon-docs`        | Allows MDX and automatic documentation rendering.                                                                                                                                                                       |
| `@storybook/addon-a11y`        | Adds a panel for accessibility checks.                                                                                                                                                                                  |
| `@storybook/addon-themes`      | Provides a global toolbar theme selector for things like brand/palette. For example, pick a brand and set `<html data-brand="foo">`; doesn’t control light/dark directly.                                               |
| `@vueless/storybook-dark-mode` | Toolbar button to toggle dark mode. Emits a channel event in the preview so both manager and preview can sync dark/light mode. If you use tokens/variables for themes, listen for these events to update appropriately. |
| `@cleverb/storybook-addon-adr` | (If using) Adds an ADRs tab to Storybook manager, can browse/search markdown decision records with styling that matches light/dark mode (if provided).                                                                  |

### Notable Storybook configuration patterns

- **Absolute path resolution:** If using PnP (Yarn Berry), use a custom `getAbsolutePath` helper in `main.ts` for resolving framework/addon package roots. Do _not_ use a root-scoped `const require = ...`; instead, use `nodeRequire` only where appropriate (`createRequire(import.meta.url)`), to avoid ESM/cjs collisions.
- **Static assets:** Add `"staticDirs": ["../public"]` to `main.ts` to serve both your app’s static files and custom data (like ADR search manifests etc).
- **Disable React Docgen:** Use `typescript.reactDocgen: false` if auto-props generation is slow or incompatible. Document if/when you enable it later.
- **Vite config:** Use `viteFinal` to merge custom aliases, Tailwind postcss plugin, etc. Example: load `@tailwindcss/postcss` dynamically via `await import()` to avoid workspace graph issues during Storybook CLI or tooling runs. Set aliases (`@` to app root), stub out env vars as needed, and use your app’s Tailwind PostCSS plugin so styles match.

### Monorepo / PnP Workarounds

- Use `.yarnrc.yml` `packageExtensions` to manually declare peer dependencies between Storybook and frameworks/builders/plugins as needed.
- Mark Storybook and Vitest packages as unplugged in `dependenciesMeta` (e.g. to fix issues reading ESM chunks or preset files from inside a zip).
- If you maintain custom Storybook addons, make sure to export `./package.json` in their `exports` field so upgrade tooling can resolve them, and always align their `peerDependencies.storybook` field with the Storybook version range in the app.

### recommended preview UI practices

- Import your token/theme CSS before app global styles, so CSS variables are available to both stories and the preview.
- For palette/brand selection via Theme addon, map `globals.theme` to a data attribute, e.g. `data-brand`.
- Use dark mode addon to synchronize dark/light state between manager and preview, ideally setting the initial state from a user/local storage setting and keeping preview and docs containers in sync.
- Add a global decorator for a consistent preview chrome or floating control if dark mode toggle isn’t clear.
- Explicitly set `parameters.layout: 'fullscreen'` for story canvas defaults.

### Exclusions

This ADR does not enforce a particular visual regression tool (like Chromatic) or mocking library (like per-story MSW); those should be covered in downstream policies or per-app ADRs.

## Consequences

- **👍 Single Vite pipeline** means fewer environmental differences between main app and Storybook for things like Tailwind and module aliases.
- **👍 Pinned versions** and strict peer alignment prevent unpredictable breakage during upgrades.
- **👎 Disabling reactDocgen** may reduce automatic Storybook docs out-of-the-box.
- **👎 PnP and Storybook 10**: Official support is limited/fragile; expect some maintenance overhead until switching away from PnP.
- **⚠️ All `@storybook/*` packages must always be on the same major version or CI should fail fast.**

## Implementation Plan

- Edit and maintain: `.storybook/main.ts`, `.storybook/preview.tsx`, your app and root `package.json`, and `.yarnrc.yml`.
- **Bump all Storybook packages in lockstep**.
- Always run `yarn build-storybook` after upgrades.
- Align custom Storybook addon's `peerDependencies.storybook` with the app’s Storybook range.
- Avoid top-level imports of build-time plugins (`@tailwindcss/postcss`), improper `require` shims in ESM, and version skew across Storybook packages.

### Verification (Checklist)

- [ ] Local dev: `yarn storybook` starts without errors.
- [ ] Static build: `yarn build-storybook` completes, output assets render as expected.
- [ ] At least one story using aliases/tailwind (like `@/`) renders correctly.

## Alternatives Considered

- **Webpack builder:** Not pursued; Vite matches app tooling and is faster for most modern React setups.
- **Enable reactDocgen by default:** Deferred due to type system/tooling complexity; revisit if automated doc tables become more important.
- **Switch from Yarn PnP:** Not yet, but planned as soon as upstream Storybook fully drops PnP support.

## Implementation History (Example)

- Initial Storybook setup for component development.
- Implemented static build and app integration.
- Added dark mode, custom ADR addons, and PnP-specific workarounds.
- Upgraded through Storybook major versions with documented lock-step policy.

## Example Commit Evidence

To audit changes or see approach in action, view the history of the following paths in this repo:

- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `package.json` (and other workspace package manifests)
- `.yarnrc.yml`

Example:

```sh
git log --oneline -- .storybook/ package.json .yarnrc.yml
```

## Where to Verify in this Repo

| Task                                   | Command / Location                                                 |
| -------------------------------------- | ------------------------------------------------------------------ |
| Storybook dev                          | `yarn storybook` and open http://localhost:6006/                   |
| Static build                           | `yarn build-storybook` and inspect storybook-static/ or output dir |
| Configuration review                   | `.storybook/main.ts`, `.storybook/preview.tsx`                     |
| PnP/peer fixes                         | Root `package.json`, `.yarnrc.yml`, custom addon peerDeps          |
| Custom Storybook Data (e.g. ADR panel) | `<your-static-dir>/sb-adr-data.json` (if using)                    |

## For More Information

- For custom Storybook addon patterns, see ADR-0009 (if maintained in this repo).
- For overlay/embedding/Netlify static deploy, see related app ADRs (e.g. ADR-0005).
