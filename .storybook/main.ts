import type { StorybookConfig } from "@storybook/react-vite";

// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const nodeRequire = createRequire(import.meta.url);
import fs from "node:fs";
import { dirname, join } from "node:path";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        // Experimental: Use with caution and globally disable in preview for stories that don't have an ADR tag.
        hidePanelWhenNotTagged: true,
        /** Regex (source only) against story tags; first matching tag that maps to an ADR wins. Default ADR-[0-9]+ */
        // tagMatchRegex: String.raw`ADR-\d{4}`,
      },
    },
    getAbsolutePath("@storybook/addon-docs"), 
    getAbsolutePath("@storybook/addon-a11y"), 
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@vueless/storybook-dark-mode"),
  ],
  framework: {
    // name: '@storybook/react-vite',
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Overview',
  },
  typescript: {
    reactDocgen: false,
  },
  async viteFinal(config) {
    // Dynamic import avoids Vite's deprecated CJS Node API when Storybook loads this file
    // (see https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated).
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      resolve: {
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, '../'),
        },
      },
      define: {
        ...config.define,
        // 'process.env.GEMINI_API_KEY': JSON.stringify(''),
      },
      css: {
        postcss: {
          plugins: [],
        },
      },
    });
  },
}

export default config

/**
 * Storybook’s PnP codemod uses absolute dirs for addons/framework. Official packages often omit
 * `./package.json` from `exports`, so `require.resolve(pkg + '/package.json')` fails; we walk up from
 * the package entry when needed. `npx storybook upgrade` evaluates this file without the project’s
 * PnP layout — then resolution fails entirely; return the bare specifier so the CLI can load config.
 */
function getAbsolutePath(specifier: string): string {
  try {
    return dirname(nodeRequire.resolve(join(specifier, 'package.json')));
  } catch {
    try {
      const entry = nodeRequire.resolve(specifier);
      let dir = dirname(entry);
      while (dir !== dirname(dir)) {
        const pkgPath = join(dir, 'package.json');
        try {
          const raw = fs.readFileSync(pkgPath, 'utf8');
          const pkg = JSON.parse(raw) as { name?: string };
          if (pkg.name === specifier) return dir;
        } catch {
          /* keep walking */
        }
        dir = dirname(dir);
      }
      return dirname(entry);
    } catch {
      return specifier;
    }
  }
}
