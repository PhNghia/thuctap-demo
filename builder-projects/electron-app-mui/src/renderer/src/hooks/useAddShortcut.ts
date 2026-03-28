import { useHotkeys } from 'react-hotkeys-hook'

export interface AddShortcutOptions {
  /** Callback for tier 1: Ctrl+N (add smallest unit - e.g., item) */
  onTier1?: () => void
  /** Callback for tier 2: Ctrl+Shift+N (add medium unit - e.g., group) */
  onTier2?: () => void
  /** Callback for tier 3: Ctrl+Alt+N (add large unit - e.g., section) */
  onTier3?: () => void
  /** Callback for tier 4: Ctrl+Shift+Alt+N (add complex unit - e.g., category) */
  onTier4?: () => void
}

/**
 * Registers keyboard shortcuts for adding entities at different tiers.
 * - Tier 1: Ctrl+N (smallest unit - e.g., item, word, question)
 * - Tier 2: Ctrl+Shift+N (medium unit - e.g., group, category)
 * - Tier 3: Ctrl+Alt+N (large unit - e.g., section, block)
 * - Tier 4: Ctrl+Shift+Alt+N (complex unit - e.g., complex category)
 *
 * Only registers hotkeys for tiers that have callbacks.
 */
export function useAddShortcut(options: AddShortcutOptions): void {
  const { onTier1, onTier2, onTier3, onTier4 } = options

  // Tier 1: Ctrl+N
  useHotkeys(
    'ctrl+n',
    (e) => {
      if (!onTier1) return
      e.preventDefault()
      onTier1()
    },
    { enableOnFormTags: false }
  )

  // Tier 2: Ctrl+Shift+N
  useHotkeys(
    'ctrl+shift+n',
    (e) => {
      if (!onTier2) return
      e.preventDefault()
      onTier2()
    },
    { enableOnFormTags: false }
  )

  // Tier 3: Ctrl+Alt+N
  useHotkeys(
    'ctrl+alt+n',
    (e) => {
      if (!onTier3) return
      e.preventDefault()
      onTier3()
    },
    { enableOnFormTags: false }
  )

  // Tier 4: Ctrl+Shift+Alt+N
  useHotkeys(
    'ctrl+shift+alt+n',
    (e) => {
      if (!onTier4) return
      e.preventDefault()
      onTier4()
    },
    { enableOnFormTags: false }
  )
}
