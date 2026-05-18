import { fileURLToPath, pathToFileURL } from 'node:url'
import fs from 'node:fs'

const distPresetPath = fileURLToPath(import.meta.resolve('../dist/preset.js'))
const srcPresetPath = fileURLToPath(import.meta.resolve('../src/preset.ts'))
const distManagerPath = fileURLToPath(import.meta.resolve('../dist/manager.js'))
const srcManagerPath = fileURLToPath(import.meta.resolve('../src/manager.tsx'))

export function managerEntries(entry: string[] = []) {
  const manager = fs.existsSync(srcManagerPath)
    ? srcManagerPath
    : distManagerPath
  return [...entry, manager]
}

export async function viteFinal(config: unknown, options: unknown) {
  const presetPath = fs.existsSync(srcPresetPath)
    ? srcPresetPath
    : distPresetPath
  const preset = await import(pathToFileURL(presetPath).href)
  return preset.viteFinal(config, options)
}
