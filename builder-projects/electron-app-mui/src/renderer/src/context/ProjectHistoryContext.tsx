import { rawReturn } from 'mutative'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'
import { travel } from 'zustand-travel'
import { AnyAppData } from '../types'

// ── Store Type ────────────────────────────────────────────────────────────────
export type HistoryStore = ReturnType<typeof createHistoryStore>

// ── Store Factory ─────────────────────────────────────────────────────────────
/**
 * Creates a scoped history store with time-travel capabilities.
 * Uses zustand-travel middleware for automatic undo/redo management.
 *
 * The `set` function from travel middleware tracks state changes for history.
 * We expose a custom setState action that uses this `set` function.
 */
const createHistoryStore = (initialState: AnyAppData) => {
  return createStore<{ data: AnyAppData; setPresent: (newState: AnyAppData) => void }>()(
    travel(
      (set) => ({
        data: { ...initialState },
        setPresent: (newState: AnyAppData) => {
          set(() => rawReturn({ data: newState }))
        }
      }),
      {
        maxHistory: 50,
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
  const state = useStore(store, (s) => s)
  const present = useStore(store, (s) => s.data)

  // Get travel controls (stable reference)
  const controls = store.getControls()

  // Subscribe to control state changes for reactive UI
  const canBack = useStore(store, () => controls.canBack())
  const canForward = useStore(store, () => controls.canForward())
  const position = useStore(store, () => controls.position)

  return {
    present,
    setPresent: state.setPresent,
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
 * Useful for saving/exporting the complete undo/redo stack.
 */
export function getHistoryArray(store: HistoryStore): AnyAppData[] {
  const controls = store.getControls()
  return controls.getHistory() as unknown as AnyAppData[]
}
