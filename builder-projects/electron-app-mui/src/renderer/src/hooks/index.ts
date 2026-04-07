/**
 * Hooks Barrel Export
 *
 * Centralized exports for all renderer hooks.
 */

// Settings
export type { SettingsContextValue } from '../context/SettingsContext'
export { useSettings } from './useSettings'

// Templates
export {
  TEMPLATES_QUERY_KEY,
  useAllTemplates,
  usePrefetchTemplates,
  useTemplateManager
} from './useTemplates'

// Assets
export { useAssetUrl } from './useAssetUrl'

// Shortcuts
export { useProjectShortcuts } from './useProjectShortcuts'
export type { ProjectShortcutOptions } from './useProjectShortcuts'

export { useEntityCreateShortcut } from './useEntityCreateShortcut'
export type { TieredShortcutOptions } from './useTieredShortcuts'

export { useTieredShortcuts } from './useTieredShortcuts'

export { useAutoSave } from './useAutoSave'
export type { UseAutoSaveOptions } from './useAutoSave'

// UI state (new)
export { useSnackbar } from './useSnackbar'
export type { UseSnackbarReturn } from './useSnackbar'
