import { useCallback, useReducer } from 'react'

const MAX_HISTORY = 50

export interface HistoryState<T> {
  present: T
  past: T[]
  future: T[]
  canUndo: boolean
  canRedo: boolean
  push: (next: T) => void
  undo: () => void
  redo: () => void
  /** Replace present without recording an undo step (e.g. initial load) */
  reset: (next: T) => void
}

// ── Internal state shape ──────────────────────────────────────────────────────
interface State<T> {
  past: T[]
  present: T
  future: T[]
}

type Action<T> =
  | { type: 'PUSH'; next: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; next: T }

function historyReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'PUSH':
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: action.next,
        future: []
      }

    case 'UNDO': {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future]
      }
    }

    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1)
      }
    }

    case 'RESET':
      return { past: [], present: action.next, future: [] }

    default:
      return state
  }
}

/**
 * Atomic snapshot-based undo/redo using a single useReducer.
 * All three slices (past/present/future) update in one dispatch, so there are
 * no intermediate renders with inconsistent state and no stale-closure issues.
 */
export function useProjectHistory<T>(initial: T): HistoryState<T> {
  const [state, dispatch] = useReducer(historyReducer as (s: State<T>, a: Action<T>) => State<T>, {
    past: [],
    present: initial,
    future: []
  })

  const push = useCallback((next: T) => dispatch({ type: 'PUSH', next }), [])
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])
  const reset = useCallback((next: T) => dispatch({ type: 'RESET', next }), [])

  return {
    present: state.present,
    past: state.past,
    future: state.future,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    push,
    undo,
    redo,
    reset
  }
}
