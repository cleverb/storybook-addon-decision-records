import { parsePanelLabel } from './adrTagConfig'

type Listener = () => void

const listeners = new Set<Listener>()

let panelLabelDisplay = parsePanelLabel(undefined)

export function getPanelLabel(): string {
  return panelLabelDisplay
}

/** Called after manifest load (or when options-derived label changes). */
export function setPanelLabelFromManifest(raw: unknown): void {
  const next = parsePanelLabel(raw)
  if (next === panelLabelDisplay) return
  panelLabelDisplay = next
  for (const l of listeners) l()
}

export function subscribePanelLabel(listener: Listener): () => void {
  listeners.add(listener)
  listener()
  return () => {
    listeners.delete(listener)
  }
}
