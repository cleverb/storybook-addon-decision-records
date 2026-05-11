import * as React from 'react'

import { Button, TabsView } from 'storybook/internal/components'

import { SyncIcon } from '@storybook/icons'

import { styled, useTheme } from 'storybook/theming'

import type { RuleType } from '../types'
import { useAdrContext } from './AdrContext'

const Container = styled.div({
  width: '100%',
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
})

const ActionsWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 6,
})

interface TabsProps {
  tabs: {
    label: React.ReactElement
    panel: React.ReactElement
    type: RuleType
  }[]
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const { tab, setTab, handleManual } = useAdrContext()

  const theme = useTheme()

  return (
    <Container>
      <TabsView
        backgroundColor={theme.background.app}
        // Let each tab manage its own scroll regions (e.g. Browse: list vs. document).
        panelProps={{ hasScrollbar: false }}
        tabs={tabs.map((item) => ({
          id: item.type,
          title: item.label,
          children: item.panel,
        }))}
        selected={tab}
        // Safe to cast key to RuleType because we use RuleTypes as IDs above.
        onSelectionChange={(key: string) => setTab(key as RuleType)}
        tools={
          <ActionsWrapper>
            {/* <Button
              variant="ghost"
              padding="small"
              onClick={toggleHighlight}
              ariaLabel={
                highlighted
                  ? 'Hide accessibility test result highlights'
                  : 'Highlight elements with accessibility test results'
              }
            >
              {highlighted ? <EyeCloseIcon /> : <EyeIcon />}
            </Button>
            <Button
              variant="ghost"
              padding="small"
              onClick={allExpanded ? handleCollapseAll : handleExpandAll}
              ariaLabel={allExpanded ? 'Collapse all results' : 'Expand all results'}
              aria-expanded={allExpanded}
            >
              {allExpanded ? <CollapseIcon /> : <ExpandAltIcon />}
            </Button> */}
            <Button
              variant="ghost"
              padding="small"
              onClick={handleManual}
              ariaLabel="Rerun accessibility scan"
            >
              <SyncIcon />
            </Button>
          </ActionsWrapper>
        }
      />
    </Container>
  )
}
