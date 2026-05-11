/**
 * Storybook resolves these at manager runtime; keep loose typings so this package typechecks
 * without depending on Storybook’s full published `.d.ts` graph.
 */
declare module 'storybook/internal/components' {
  import type { FC, ReactNode } from 'react'

  export const Badge: FC<{
    compact?: boolean
    status?: string
    children?: ReactNode
  }>

  export const Button: FC<Record<string, unknown>>

  export const P: FC<Record<string, unknown>>

  export const Separator: FC<Record<string, unknown>>

  export const Toolbar: FC<Record<string, unknown>>

  export const TabsView: FC<Record<string, unknown>>
}

declare module 'storybook/theming' {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export const styled: any
  export function useTheme(): any
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
