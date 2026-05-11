import React from 'react'

import {
  Button,
  P,
  Separator,
  Toolbar as SharedToolbar,
} from 'storybook/internal/components'

import {
  FastForwardIcon,
  PlayBackIcon,
  PlayNextIcon,
  RewindIcon,
  SyncIcon,
} from '@storybook/icons'

import { type API } from 'storybook/manager-api'
import { styled, useTheme } from 'storybook/theming'

type ThemeLike = {
  appBorderColor?: string
  background: { app?: string }
  textMutedColor?: string
  color: { secondary?: string }
  typography: { weight: { bold?: number | string; regular?: number | string } }
  animation: { rotate360?: string }
}

const ToolbarWrapper = styled.div((p: { theme: ThemeLike }) => ({
  boxShadow: `${p.theme.appBorderColor} 0 -1px 0 0 inset`,
  background: p.theme.background.app,
  position: 'sticky',
  top: 0,
  zIndex: 1,
}))

interface ToolbarProps {
  storyFileName?: string
  onScrollToEnd?: () => void
  importPath?: string
  canOpenInEditor?: boolean
  api: API
}

const StyledButton = styled(Button)((p: { theme: ThemeLike }) => ({
  borderRadius: 4,
  padding: 6,
  color: p.theme.textMutedColor,
  '&:not(:disabled)': {
    '&:hover,&:focus-visible': {
      color: p.theme.color.secondary,
    },
  },
}))

const StyledIconButton = styled(Button)((p: { theme: ThemeLike }) => ({
  color: p.theme.textMutedColor,
}))

const OpenInEditorButton = styled(Button)((p: { theme: ThemeLike }) => ({
  color: p.theme.color.secondary,
  fontWeight: p.theme.typography.weight.bold,
  justifyContent: 'flex-end',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  fontSize: 13,
  lineHeight: 24,
}))

const StyledLocation = styled(P)((p: { theme: ThemeLike }) => ({
  color: p.theme.textMutedColor,
  cursor: 'default',
  fontWeight: p.theme.typography.weight.regular,
  justifyContent: 'flex-end',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  margin: 0,
  fontSize: 13,
}))

const ControlsGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  gap: 6,
})

const RewindButton = styled(StyledIconButton)({
  marginInlineStart: 3,
})

const JumpToEndButton = styled(StyledButton)({
  marginInline: 3,
  lineHeight: '12px',
})

const RerunButton = styled(StyledIconButton)(
  (props: { theme: ThemeLike; animating?: boolean; disabled?: boolean }) => ({
    opacity: props.disabled ? 0.5 : 1,
    svg: {
      animation: props.animating
        ? `${props.theme.animation.rotate360} 200ms ease-out`
        : undefined,
    },
  }),
)

export const Toolbar: React.FC<ToolbarProps> = ({
  storyFileName,
  onScrollToEnd,
  importPath,
  canOpenInEditor,
  api,
}) => {
  const buttonText = 'Scroll to end'
  const theme = useTheme()

  return (
    <ToolbarWrapper>
      <SharedToolbar
        backgroundColor={theme.background.app}
        innerStyle={{ gap: 6, paddingInline: 15 }}
        aria-label="Component test playback controls"
      >
        <ControlsGroup>
          <JumpToEndButton
            ariaLabel={false}
            onClick={onScrollToEnd}
            disabled={!onScrollToEnd}
          >
            {buttonText}
          </JumpToEndButton>

          <Separator />

          <RewindButton
            padding="small"
            variant="ghost"
            ariaLabel="Go to start"
            onClick={() => {}}
            disabled={false}
          >
            <RewindIcon />
          </RewindButton>

          <StyledIconButton
            padding="small"
            variant="ghost"
            ariaLabel="Go back"
            onClick={() => {}}
            disabled={false}
          >
            <PlayBackIcon />
          </StyledIconButton>

          <StyledIconButton
            padding="small"
            variant="ghost"
            ariaLabel="Go forward"
            onClick={() => {}}
            disabled={false}
          >
            <PlayNextIcon />
          </StyledIconButton>

          <StyledIconButton
            padding="small"
            variant="ghost"
            ariaLabel="Go to end"
            onClick={() => {}}
            disabled={false}
          >
            <FastForwardIcon />
          </StyledIconButton>

          <RerunButton
            padding="small"
            variant="ghost"
            ariaLabel="Rerun"
            onClick={() => {}}
          >
            <SyncIcon />
          </RerunButton>
        </ControlsGroup>
        {(importPath || storyFileName) &&
          (canOpenInEditor ? (
            <OpenInEditorButton
              padding="small"
              size="small"
              variant="ghost"
              ariaLabel="Open in editor"
              onClick={() => {
                if (importPath) {
                  api.openInEditor({ file: importPath })
                }
              }}
            >
              {storyFileName}
            </OpenInEditorButton>
          ) : (
            <StyledLocation>{storyFileName}</StyledLocation>
          ))}
      </SharedToolbar>
    </ToolbarWrapper>
  )
}
