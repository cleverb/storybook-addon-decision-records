import React, { useEffect, useState } from 'react'

import { addons, types } from 'storybook/manager-api'

import { AdrPanel } from './components/AdrPanel'
import { ADDON_ID, PANEL_ID } from './constants'
import { getPanelLabel, subscribePanelLabel } from './panelLabelSync'

const REGISTER_GUARD = '__CLEVERBOY_SB_ADR_ADDON_REGISTERED__' as const

function PanelTabTitle() {
  const [label, setLabel] = useState(() => getPanelLabel())
  useEffect(() => subscribePanelLabel(() => setLabel(getPanelLabel())), [])
  return label
}

/** Storybook can evaluate the manager entry more than once (e.g. duplicate paths under PnP); guard `addons.register`. */
const g = globalThis as typeof globalThis & { [REGISTER_GUARD]?: boolean }
if (!g[REGISTER_GUARD]) {
  g[REGISTER_GUARD] = true

  // Same registration shape as @storybook/addon-a11y (Storybook 10): `register(id, (api) => { … })`.
  addons.register(ADDON_ID, () => {
    addons.add(PANEL_ID, {
      type: types.PANEL,
      title: () => <PanelTabTitle />,
      match: () => true,
      render: ({ active = true }) => (active ? <AdrPanel /> : null),
    })
  })
}
