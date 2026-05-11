import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { 'regenerate-manifest': 'src/regenerate-manifest.ts' },
    format: 'cjs',
    platform: 'node',
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.cjs' }),
    treeshake: true,
  },
  {
    entry: { preset: 'src/preset.ts' },
    format: 'esm',
    platform: 'node',
    dts: false,
    outDir: 'dist',
    treeshake: true,
    // `loadEnv` lives in Vite; bundling Vite pulls optional peers (e.g. lightningcss) and breaks tsup.
    external: ['vite'],
  },
  {
    entry: { manager: 'src/manager.tsx' },
    format: 'esm',
    platform: 'browser',
    dts: false,
    outDir: 'dist',
    treeshake: true,
    // Storybook’s manager already provides React; importing `react/jsx-runtime` from a
    // different virtual copy than the manager’s React triggers `recentlyCreatedOwnerStacks`
    // and breaks other addons. Classic JSX keeps a single `import React from 'react'`.
    esbuildOptions(options) {
      options.jsx = 'transform'
      options.jsxFactory = 'React.createElement'
      options.jsxFragment = 'React.Fragment'
      return options
    },
    external: [
      'react',
      'react-dom',
      'storybook/manager-api',
      'storybook/internal/components',
      'storybook/theming',
      '@storybook/icons',
    ],
  },
])
