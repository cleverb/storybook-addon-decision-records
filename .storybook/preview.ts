import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    adr: {
      disable: true,
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
