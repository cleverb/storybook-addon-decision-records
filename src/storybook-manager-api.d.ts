/**
 * Minimal typings for `storybook/manager-api` (Storybook 10.x), aligned with
 * `@storybook/addon-a11y` manager usage. Storybook resolves this at manager build time.
 */
declare module 'storybook/manager-api' {
  import type { ReactNode } from 'react'

  export interface StoryIndexEntry {
    id?: string
    type?: string
    title?: string
    name?: string
    importPath?: string
    tags?: string[]
    parameters?: Record<string, unknown>
  }

  export interface StorybookState {
    storyId: string
    refId?: string
  }

  export interface API {
    getData(storyId: string, refId?: string): StoryIndexEntry | undefined
    getCurrentStoryData(): StoryIndexEntry | undefined
    getUrlState(): { storyId?: string; refId?: string } | undefined
    openInEditor(location: {
      file: string
      line?: number
      column?: number
    }): void
    [key: string]: unknown
  }

  export const types: {
    readonly PANEL: string
    readonly TOOL: string
  }

  export const addons: {
    register(id: string, registerFn: (api: API) => void): void
    add(
      id: string,
      options: {
        type: string
        title: string | (() => ReactNode)
        match?: (ctx?: unknown) => boolean
        render: (props: { active?: boolean }) => ReactNode
        paramKey?: string
      },
    ): void
  }

  export function useAddonState<T>(
    id: string,
    defaultState: T,
  ): readonly [T, (patch: T | ((prev: T) => T)) => void]

  export function useParameter<T>(key: string, defaultValue?: T): T

  export function useStorybookApi(): API

  export function useStorybookState(): StorybookState
}
