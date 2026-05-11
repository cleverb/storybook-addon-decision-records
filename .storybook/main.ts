import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    {
      name: import.meta.resolve('./local-preset.ts'),
      options: {
        adrRoot: './docs/decisions',
        categories: ['frontend', 'tooling'],
        indexReadmePath: './docs/decisions/README.md',
        panelLabel: 'Decision Records',
      },
    },
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Overview',
  },
}

export default config
