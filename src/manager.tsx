import React, { useEffect, useState } from 'react'

import { addons, StoryIndexEntry, types } from 'storybook/manager-api'
import { addons as previewAddons } from 'storybook/preview-api'

import { ADDON_ID, PANEL_ID, PARAM_KEY } from './constants'

import {
  DEFAULT_TAG_MATCH_REGEX
} from './adrTagConfig'
import { AdrAddonPanel } from './components/AdrAddonPanel'
import { getPanelLabel, subscribePanelLabel } from './panelLabelSync'
import type { AdrEntry } from './types'
import { useAdrContext } from './components/AdrContext'

type PanelVisibilityConfig = {
  hidePanelWhenNotTagged: boolean
  tagMatchRegex: string
  entries: AdrEntry[]
}

const panelVisibilityConfig: PanelVisibilityConfig = {
  hidePanelWhenNotTagged: false,
  tagMatchRegex: DEFAULT_TAG_MATCH_REGEX,
  entries: [],
}

const addOnChannel = previewAddons.getChannel();
addOnChannel.on('adr-panel-active', () => {
  console.log(':: SET ADDON STATE active::')
})

function PanelTabTitle() {
  const [label, setLabel] = useState(() => getPanelLabel())
  useEffect(() => subscribePanelLabel(() => setLabel(getPanelLabel())), [])
  return label
}

/** Storybook can evaluate the manager entry more than once (e.g. duplicate paths under PnP); guard `addons.register`. */

// Same registration shape as @storybook/addon-a11y (Storybook 10): `register(id, (api) => { … })`.
addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: () => <PanelTabTitle />,
    paramKey: PARAM_KEY,
    render: ({ active = true }) => {

      const { active: addonActive, setActive } = useAdrContext()

      console.log('api', api)
      console.log('api.getAddonState("adr")', (api as any).getAddonState?.('adr'))
      const currentStoryData = api.getCurrentStoryData?.()
      console.log('api.getCurrentStoryData?.()', api.getCurrentStoryData?.())
      console.log('api.getParameters?.()', currentStoryData)
      console.log('active', active)
      //@cleverb/storybook-addon-adr/panel
      function isAdrPanelActive(storyData: StoryIndexEntry | undefined) {
        if (!storyData) return false
        const addonParams = storyData?.parameters?.[PARAM_KEY] as
          | { disable?: boolean; disabled?: boolean }
          | undefined
        if (addonParams?.disable === true || addonParams?.disabled === true) {
          return false
        }
        const tags = Array.isArray(storyData?.tags)
          ? storyData.tags.filter((t): t is string => typeof t === 'string')
          : []

        let re: RegExp
        try {
          re = new RegExp(panelVisibilityConfig.tagMatchRegex)
        } catch {
          re = new RegExp(DEFAULT_TAG_MATCH_REGEX)
        }
        const filteredTags = tags.filter((t) => {
          return re.test(t)
        })

        return filteredTags.length > 0 ? true : false
        return false
      }

      const isPanelActive = isAdrPanelActive(currentStoryData)
      return (isPanelActive ? <AdrAddonPanel active={isPanelActive} /> : null)
    },
  })
})
