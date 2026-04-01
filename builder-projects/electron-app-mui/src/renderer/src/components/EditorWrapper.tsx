import { useForm } from '@tanstack/react-form'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { AnyAppData } from '../types'
import { EditorHandle } from '../types/editor'

interface EditorWrapperProps {
  /** The raw game editor component to render */
  Component: React.ComponentType<any>
  /** Initial data for the form (only used on first mount) */
  initialData: AnyAppData
  /** Background assets directory */
  projectDir: string
  /** Called on debounced changes (for history/auto-save) */
  onChange: (data: AnyAppData) => void
}

const DEBOUNCE_MS = 500

/**
 * A standard wrapper for game editors that:
 * 1. Manages internal state via @tanstack/react-form.
 * 2. Exposes the EditorHandle (getValue/setValue) to the parent.
 * 3. Handles debounced synchronization to the parent ProjectHistory.
 */
export const EditorWrapper = forwardRef<EditorHandle, EditorWrapperProps>(
  ({ Component, initialData, projectDir, onChange }, ref) => {
    // 1. Initialize the form
    const form = useMyEditorForm({ initialData })

    // 2. Debounced sync to parent
    useEffect(() => {
      console.log(form.state.values)
      const timeout = setTimeout(() => {
        onChange(form.state.values as AnyAppData)
      }, DEBOUNCE_MS)
      return () => clearTimeout(timeout)
    }, [form.state.values, onChange])

    // 3. Expose the handle to ProjectPage
    useImperativeHandle(ref, () => ({
      getValue: () => form.state.values as AnyAppData,
      setValue: (value: AnyAppData) => {
        form.reset(value)
      }
    }))

    // 3. Render the raw editor with the form context
    return <Component form={form} initialData={initialData} projectDir={projectDir} />
  }
)

export function useMyEditorForm<T extends AnyAppData>({ initialData }: { initialData: T }) {
  return useForm({
    defaultValues: initialData
  })
}
