import { useMyEditorForm } from '@renderer/components/EditorWrapper'
import { AnyAppData } from './index'

/**
 * Handle exposed by game editors via forwardRef.
 * Allows the parent (ProjectPage) to pull and push state explicitly.
 */
export interface EditorHandle {
  /**
   * Force the editor to return its current internal state.
   * Useful before Save or Undo to capture pending "draft" changes.
   */
  getValue: () => AnyAppData

  /**
   * Force the editor to reset its internal state to a new source of truth.
   * Used after Undo/Redo or manual history navigation.
   */
  setValue: (value: AnyAppData) => void
}

export type MyEditorForm<T extends AnyAppData> = ReturnType<typeof useMyEditorForm<T>>

export interface MyEditorProps<T extends AnyAppData> {
  form: MyEditorForm<T>
  projectDir: string
}
