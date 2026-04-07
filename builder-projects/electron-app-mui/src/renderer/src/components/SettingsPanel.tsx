import CloseIcon from '@mui/icons-material/Close'
import { Box, Divider, Drawer, IconButton, Typography } from '@mui/material'
import { useSettings } from '@renderer/hooks/useSettings'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import React, { useCallback } from 'react'
import {
  GlobalSettingsSection,
  ProjectOverrideSection
} from '../components/settings/SettingsSubcomponents'
import { ProjectSettings } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  /** If provided, show per-project override section */
  hasProject?: boolean
}

export default function SettingsPanel({ open, onClose, hasProject }: Props): React.ReactElement {
  const { globalSettings, projectSettings, resolved, updateProject } = useSettings()
  const updateAutoSaveMode = useSettingsStore((s) => s.updateAutoSaveMode)
  const updateAutoSaveInterval = useSettingsStore((s) => s.updateAutoSaveInterval)
  const updatePrefillNames = useSettingsStore((s) => s.updatePrefillNames)

  const clearProjOverride = useCallback(
    (key: keyof ProjectSettings): void => {
      if (!projectSettings) return
      const next: ProjectSettings = {
        autoSave: key === 'autoSave' ? null : projectSettings.autoSave,
        prefillNames: key === 'prefillNames' ? null : projectSettings.prefillNames
      }
      updateProject(next)
    },
    [projectSettings, updateProject]
  )

  const setProjOverride = useCallback(
    (patch: ProjectSettings): void => {
      updateProject({ ...projectSettings, ...patch })
    },
    [projectSettings, updateProject]
  )

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          background: '#13161f',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          p: 0
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <Typography variant="h6" sx={{ flex: 1, fontSize: '1rem' }}>
          Settings
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* ── Global settings ── */}
        <GlobalSettingsSection
          mode={globalSettings.autoSave.mode}
          intervalSec={globalSettings.autoSave.intervalSeconds}
          prefillNames={globalSettings.prefillNames}
          onModeChange={updateAutoSaveMode}
          onIntervalChange={updateAutoSaveInterval}
          onPrefillChange={updatePrefillNames}
        />

        {/* ── Per-project overrides ── */}
        {hasProject && (
          <>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />
            <ProjectOverrideSection
              projectSettings={projectSettings}
              globalMode={globalSettings.autoSave.mode}
              globalIntervalSec={globalSettings.autoSave.intervalSeconds}
              globalPrefillNames={globalSettings.prefillNames}
              resolvedMode={resolved.autoSave.mode}
              resolvedPrefillNames={resolved.prefillNames}
              onModeChange={(mode) =>
                setProjOverride({
                  autoSave: {
                    mode,
                    intervalSeconds:
                      projectSettings?.autoSave?.intervalSeconds ??
                      globalSettings.autoSave.intervalSeconds
                  }
                })
              }
              onIntervalChange={(s) =>
                setProjOverride({
                  autoSave: {
                    mode: projectSettings?.autoSave?.mode ?? globalSettings.autoSave.mode,
                    intervalSeconds: s
                  }
                })
              }
              onPrefillChange={(v) => setProjOverride({ prefillNames: v })}
              onEnableAutoSaveOverride={() =>
                setProjOverride({
                  autoSave: {
                    mode: globalSettings.autoSave.mode,
                    intervalSeconds: globalSettings.autoSave.intervalSeconds
                  }
                })
              }
              onDisableAutoSaveOverride={() => clearProjOverride('autoSave')}
              onEnablePrefillOverride={() =>
                setProjOverride({ prefillNames: globalSettings.prefillNames })
              }
              onDisablePrefillOverride={() => clearProjOverride('prefillNames')}
            />
          </>
        )}
      </Box>
    </Drawer>
  )
}
