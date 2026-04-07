import React, { useEffect, useMemo } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { mergeSettings } from '../utils/settingsUtils'
import { SettingsContext } from './SettingsContextTypes'

export { SettingsContext } from './SettingsContextTypes'
export type { SettingsContextValue } from './SettingsContextTypes'

// ── Provider ──────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const globalSettings = useSettingsStore((s) => s.globalSettings)
  const projectSettings = useSettingsStore((s) => s.projectSettings)
  const ready = useSettingsStore((s) => s.ready)
  const loadGlobalSettings = useSettingsStore((s) => s.loadGlobalSettings)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)
  const updateProject = useSettingsStore((s) => s.updateProject)
  const setProjectSettings = useSettingsStore((s) => s.setProjectSettings)

  // Load global settings on mount
  useEffect(() => {
    loadGlobalSettings()
  }, [loadGlobalSettings])

  // Compute resolved settings
  const resolved = useMemo(
    () => mergeSettings(globalSettings, projectSettings),
    [globalSettings, projectSettings]
  )

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        projectSettings,
        resolved,
        ready,
        updateGlobal,
        updateProject,
        setProjectSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
