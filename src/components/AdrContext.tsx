import type { FC, PropsWithChildren } from 'react'
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { useAddonState, useParameter } from 'storybook/manager-api'
// import {
//   STORY_CHANGED,
//   STORY_FINISHED,
//   STORY_HOT_UPDATED,
//   STORY_RENDER_PHASE_CHANGED,
//   type StoryFinishedPayload,
// } from 'storybook/internal/core-events';

// import type { ClickEventDetails, HighlightMenuItem } from 'storybook/highlight';
// import { HIGHLIGHT, REMOVE_HIGHLIGHT, SCROLL_INTO_VIEW } from 'storybook/highlight';
// import {
//   experimental_getStatusStore,
//   experimental_useStatusStore,
//   useAddonState,
//   useChannel,
//   useGlobals,
//   useParameter,
//   useStorybookApi,
//   useStorybookState,
// } from 'storybook/manager-api';
// import type { Report } from 'storybook/preview-api';
// import { convert, themes } from 'storybook/theming';

import { ADDON_ID } from '../constants'
import type {
  AdrParameters,
  AdrUiStatus,
  EnhancedResult,
  EnhancedResults,
  TestDiscrepancy,
} from '../types'
import { EMPTY_ADR_RESULTS, RuleType } from '../types'

export interface AdrContextStore {
  parameters: AdrParameters
  results: EnhancedResults | undefined
  highlighted: boolean
  toggleHighlight: () => void
  tab: RuleType
  handleCopyLink: (key: string) => void
  setTab: (type: RuleType) => void
  status: AdrUiStatus
  setStatus: (status: AdrUiStatus) => void
  error: unknown
  handleManual: () => void
  discrepancy: TestDiscrepancy
  selectedItems: Map<string, string>
  toggleOpen: (
    event: React.SyntheticEvent<Element>,
    type: RuleType,
    item: EnhancedResult,
  ) => void
  handleCollapseAll: () => void
  handleExpandAll: () => void
  handleJumpToElement: (target: string) => void
  handleSelectionChange: (key: string) => void
  allExpanded: boolean
}

export const AdrContext = createContext<AdrContextStore>({
  parameters: {},
  results: undefined,
  highlighted: false,
  toggleHighlight: () => {},
  tab: RuleType.VIOLATION,
  handleCopyLink: () => {},
  setTab: () => {},
  setStatus: () => {},
  status: 'initial',
  error: undefined,
  handleManual: () => {},
  discrepancy: null,
  selectedItems: new Map(),
  toggleOpen: () => {},
  handleCollapseAll: () => {},
  handleExpandAll: () => {},
  handleJumpToElement: () => {},
  handleSelectionChange: () => {},
  allExpanded: false,
})

type AddonUiState = {
  ui: { highlighted: boolean; tab: RuleType }
  results: EnhancedResults | undefined
  error: unknown
  status: AdrUiStatus
}

export const AdrContextProvider: FC<
  PropsWithChildren<{ onManual?: () => void }>
> = ({ children, onManual }) => {
  const parameters = useParameter<AdrParameters>('adr', {})

  const [state, setState] = useAddonState<AddonUiState>(ADDON_ID, {
    ui: {
      highlighted: false,
      tab: RuleType.VIOLATION,
    },
    results: EMPTY_ADR_RESULTS,
    error: undefined,
    status: 'initial',
  })

  const { ui, results, error, status } = state
  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(
    () => new Map(),
  )

  const handleToggleHighlight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, highlighted: !prev.ui.highlighted },
    }))
  }, [setState])

  const handleCollapseAll = useCallback(() => {
    setSelectedItems(new Map())
  }, [])

  const handleExpandAll = useCallback(() => {
    const list = results?.[ui.tab] ?? []
    setSelectedItems(
      (prev) =>
        new Map(
          list.map((result) => {
            const key = `${ui.tab}.${result.id}`
            return [key, prev.get(key) ?? `${key}.1`]
          }),
        ),
    )
  }, [results, ui.tab])

  const handleSelectionChange = useCallback((key: string) => {
    const [type, id] = key.split('.')
    setSelectedItems((prev) => new Map(prev.set(`${type}.${id}`, key)))
  }, [])

  const toggleOpen = useCallback(
    (
      event: React.SyntheticEvent<Element>,
      type: RuleType,
      item: EnhancedResult,
    ) => {
      event.stopPropagation()
      const key = `${type}.${item.id}`
      setSelectedItems(
        (prev) => new Map(prev.delete(key) ? prev : prev.set(key, `${key}.1`)),
      )
    },
    [],
  )

  const allExpanded = useMemo(() => {
    const list = results?.[ui.tab] ?? []
    if (list.length === 0) return false
    return list.every((result) => selectedItems.has(`${ui.tab}.${result.id}`))
  }, [results, selectedItems, ui.tab])

  const handleManual = useCallback(() => {
    onManual?.()
  }, [onManual])

  const handleCopyLink = useCallback(async (linkPath: string) => {
    void linkPath
  }, [])

  const handleJumpToElement = useCallback((target: string) => {
    void target
  }, [])

  const setTab = useCallback(
    (type: RuleType) =>
      setState((prev) => ({ ...prev, ui: { ...prev.ui, tab: type } })),
    [setState],
  )

  const setStatus = useCallback(
    (next: AdrUiStatus) => setState((prev) => ({ ...prev, status: next })),
    [setState],
  )

  const discrepancy: TestDiscrepancy = null

  return (
    <AdrContext.Provider
      value={{
        parameters,
        results,
        highlighted: ui.highlighted,
        toggleHighlight: handleToggleHighlight,
        tab: ui.tab,
        setTab,
        handleCopyLink,
        status,
        setStatus,
        error,
        handleManual,
        discrepancy,
        selectedItems,
        toggleOpen,
        handleCollapseAll,
        handleExpandAll,
        handleJumpToElement,
        handleSelectionChange,
        allExpanded,
      }}
    >
      {children}
    </AdrContext.Provider>
  )
}

export const useAdrContext = () => useContext(AdrContext)
