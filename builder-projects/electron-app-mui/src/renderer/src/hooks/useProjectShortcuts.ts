import { useHotkeys } from 'react-hotkeys-hook'

export interface ProjectShortcutOptions {
  /** Callback for preview: Ctrl+P */
  onPreview?: () => void
  /** Callback for export to folder: Ctrl+Shift+P */
  onExportFolder?: () => void
  /** Callback for export to ZIP: Ctrl+Alt+P */
  onExportZip?: () => void
}

/**
 * Registers keyboard shortcuts for project-level actions.
 * - Ctrl+P: Preview the game
 * - Ctrl+Shift+P: Export to folder
 * - Ctrl+Alt+P: Export as ZIP
 *
 * Only registers hotkeys for callbacks that are provided.
 */
export function useProjectShortcuts(options: ProjectShortcutOptions): void {
  const { onPreview, onExportFolder, onExportZip } = options

  // Preview: Ctrl+P
  useHotkeys(
    'ctrl+p',
    (e) => {
      if (!onPreview) return
      e.preventDefault()
      onPreview()
    },
    { enableOnFormTags: false }
  )

  // Export to folder: Ctrl+Shift+P
  useHotkeys(
    'ctrl+shift+p',
    (e) => {
      if (!onExportFolder) return
      e.preventDefault()
      onExportFolder()
    },
    { enableOnFormTags: false }
  )

  // Export to ZIP: Ctrl+Alt+P
  useHotkeys(
    'ctrl+alt+p',
    (e) => {
      if (!onExportZip) return
      e.preventDefault()
      onExportZip()
    },
    { enableOnFormTags: false }
  )
}
