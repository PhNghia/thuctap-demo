import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'
import { travel } from 'zustand-travel'
import { AnyAppData } from '../types'

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_HISTORY_LENGTH = 50

// ── Store Type ────────────────────────────────────────────────────────────────
export type HistoryStore = ReturnType<typeof createHistoryStore>

// ── Store Factory ─────────────────────────────────────────────────────────────
/**
 * Creates a scoped history store with time-travel capabilities.
 * Uses zustand-travel middleware for automatic undo/redo management.
 *
 * Note: We use a custom `setPresent` action instead of directly exposing `setState`
 * to maintain a clear API and ensure the travel middleware properly tracks changes.
 */
const createHistoryStore = (initialState: AnyAppData) => {
  return createStore<{ data: AnyAppData; setPresent: (newState: AnyAppData) => void }>()(
    travel(
      (set) => ({
        data: { ...initialState },
        setPresent: (newState: AnyAppData) => {
          set((state) => {
            state.data = newState
          })
        }
      }),
      {
        maxHistory: MAX_HISTORY_LENGTH,
        autoArchive: true,
        strict: process.env.NODE_ENV === 'development'
      }
    )
  )
}

// ── Context ───────────────────────────────────────────────────────────────────
const ProjectHistoryContext = createContext<HistoryStore | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
interface ProjectHistoryProviderProps {
  children: ReactNode
  initialState: AnyAppData
}

export function ProjectHistoryProvider({ children, initialState }: ProjectHistoryProviderProps) {
  const [store] = useState(() => createHistoryStore(initialState))

  return <ProjectHistoryContext.Provider value={store}>{children}</ProjectHistoryContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * Direct access to the scoped travel store.
 * Each ProjectHistoryProvider instance has its own isolated history state.
 *
 * @example
 * const { state, setPresent, controls, canBack, canForward } = useProjectHistory()
 * controls.back()   // undo
 * controls.forward() // redo
 */
export function useProjectHistory() {
  const store = useContext(ProjectHistoryContext)
  if (store === null) {
    throw new Error('useProjectHistory must be used within a ProjectHistoryProvider')
  }

  // Subscribe to store changes - triggers re-renders when state changes
  const present = useStore(store, (s) => s.data)
  const setPresent = useStore(store, (s) => s.setPresent)

  // Get travel controls (stable reference)
  const controls = store.getControls()

  // Subscribe to control state changes for reactive UI
  const canBack = useStore(store, () => controls.canBack())
  const canForward = useStore(store, () => controls.canForward())
  const position = useStore(store, () => controls.position)

  return {
    present,
    setPresent,
    controls,
    store,
    canBack,
    canForward,
    position
  }
}

// ── Helper: Get full history array ────────────────────────────────────────────
/**
 * Get the full history array from travel controls.
 * Returns deep copies to prevent accidental mutation of history state.
 * Useful for saving/exporting the complete undo/redo stack.
 */
export function getHistoryArray(store: HistoryStore): AnyAppData[] {
  const controls = store.getControls()
  const history = controls.getHistory() as unknown as Array<{ data: AnyAppData }>
  // Deep copy each entry to prevent mutation of history state
  return history.map((entry) => structuredClone(entry.data))
}
