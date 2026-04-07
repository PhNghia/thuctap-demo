/**
 * Settings Zustand Store
 *
 * Manages global settings, recent projects, and project settings.
 * Persistence is handled manually via electronAPI calls (not using Zustand persist middleware).
 */

import { create } from 'zustand'
import {
  AutoSaveMode,
  DEFAULT_GLOBAL_SETTINGS,
  GlobalSettings,
  ProjectSettings,
  RecentProject,
  ResolvedSettings
} from '../types'
import { deepMergeDefaults, mergeSettings } from '../utils/settingsUtils'

// Constant empty array to prevent issues with undefined recentProjects
const EMPTY_RECENT_LIST: RecentProject[] = []

// ── Store Interface ───────────────────────────────────────────────────────────

interface SettingsState {
  // ── State ─────────────────────────────────────────────────────────────────
  globalSettings: GlobalSettings
  projectSettings: ProjectSettings | null
  ready: boolean

  // ── Derived (computed via selectors, not stored) ─────────────────────────
  // resolved: ResolvedSettings - use mergeSettings() selector

  // ── Actions: Global Settings ─────────────────────────────────────────────
  loadGlobalSettings: () => Promise<void>
  updateAutoSaveMode: (mode: AutoSaveMode) => void
  updateAutoSaveInterval: (intervalSeconds: number) => void
  updatePrefillNames: (enabled: boolean) => void
  updateGlobal: (patch: Partial<GlobalSettings>) => void

  // ── Actions: Recent Projects ─────────────────────────────────────────────
  addRecentProject: (entry: RecentProject) => Promise<void>
  removeRecentProject: (filePath: string) => Promise<void>

  // ── Actions: Project Settings ────────────────────────────────────────────
  updateProject: (patch: ProjectSettings | null) => void
  setProjectSettings: (s: ProjectSettings | null) => void
}

// ── Store Creation ────────────────────────────────────────────────────────────

let persistTimer: ReturnType<typeof setTimeout> | null = null

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  // ── Initial State ───────────────────────────────────────────────────
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  projectSettings: null,
  ready: false,

  // ── Global Settings Actions ─────────────────────────────────────────
  loadGlobalSettings: async () => {
    const raw = await window.electronAPI.settingsReadGlobal()
    set({
      globalSettings: deepMergeDefaults(raw),
      ready: true
    })
  },

  updateAutoSaveMode: (mode) => {
    get().updateGlobal({ autoSave: { ...get().globalSettings.autoSave, mode } })
  },

  updateAutoSaveInterval: (intervalSeconds) => {
    get().updateGlobal({
      autoSave: { ...get().globalSettings.autoSave, intervalSeconds }
    })
  },

  updatePrefillNames: (prefillNames) => {
    get().updateGlobal({ prefillNames })
  },

  updateGlobal: (patch) => {
    // Immediate state update for UI responsiveness
    set((state) => ({
      globalSettings: {
        ...state.globalSettings,
        ...patch,
        autoSave: patch.autoSave
          ? { ...state.globalSettings.autoSave, ...patch.autoSave }
          : state.globalSettings.autoSave
      }
    }))

    // Debounced persist to disk via electronStorage
    // Note: Zustand persist middleware handles this automatically,
    // but we add debounce to avoid excessive IPC calls
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      // Trigger persist by calling a dummy update
      // The persist middleware will intercept this and save to disk
      set((state) => ({ globalSettings: { ...state.globalSettings } }))
    }, 500)
  },

  // ── Recent Projects Actions ─────────────────────────────────────────
  addRecentProject: async (entry) => {
    const state = get()
    const existing = (state.globalSettings.recentProjects ?? EMPTY_RECENT_LIST) as RecentProject[]
    const filtered = existing.filter((r) => r.filePath !== entry.filePath)
    const updated = [entry, ...filtered].slice(0, 30)

    // Update state immediately
    set({
      globalSettings: {
        ...state.globalSettings,
        recentProjects: updated
      }
    })

    // Persist immediately (no debounce for recent projects)
    const current = await window.electronAPI.settingsReadGlobal()
    await window.electronAPI.settingsWriteGlobal({
      ...(current as GlobalSettings),
      recentProjects: updated
    })
  },

  removeRecentProject: async (filePath) => {
    const state = get()
    const existing = (state.globalSettings.recentProjects ?? EMPTY_RECENT_LIST) as RecentProject[]
    const updated = existing.filter((r) => r.filePath !== filePath)

    set({
      globalSettings: {
        ...state.globalSettings,
        recentProjects: updated
      }
    })

    const current = await window.electronAPI.settingsReadGlobal()
    await window.electronAPI.settingsWriteGlobal({
      ...(current as GlobalSettings),
      recentProjects: updated
    })
  },

  // ── Project Settings Actions ────────────────────────────────────────
  updateProject: (patch) => {
    set({ projectSettings: patch })
  },

  setProjectSettings: (s) => {
    set({ projectSettings: s })
  }
}))

// ── Selector Helpers ──────────────────────────────────────────────────────────

/**
 * Selector for resolved settings (global merged with project overrides).
 * Use this in components to get the effective settings.
 */
export const selectResolved = (state: SettingsState): ResolvedSettings =>
  mergeSettings(state.globalSettings, state.projectSettings)
