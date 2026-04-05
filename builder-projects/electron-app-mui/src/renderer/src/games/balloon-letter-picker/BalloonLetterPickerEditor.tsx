import { Box } from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import { JSX, useCallback } from 'react'
import { BalloonLetterPickerAppData, BalloonWord } from '../../types'
import { getExcelName } from '../../utils/stringUtils'
import { SummarySidebar, WordsTab } from './components'

interface Props {
  appData: BalloonLetterPickerAppData
  projectDir: string
  onChange: (data: BalloonLetterPickerAppData) => void
}

function normalize(d: BalloonLetterPickerAppData): BalloonLetterPickerAppData {
  return { ...d, _wordCounter: d._wordCounter ?? 0, words: d.words ?? [] }
}

export default function BalloonLetterPickerEditor({
  appData: raw,
  projectDir,
  onChange
}: Props): JSX.Element {
  const data = normalize(raw)
  const { resolved } = useSettings()
  const { words } = data

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addWord = useCallback(
    (initialImagePath?: string) => {
      const c = data._wordCounter + 1
      const w: BalloonWord = {
        id: `word-${c}`,
        word: resolved.prefillNames ? `WORD${getExcelName(c)}` : '',
        imagePath: initialImagePath ?? '',
        hint: resolved.prefillNames ? `Hint ${c}` : ''
      }
      onChange({ ...data, _wordCounter: c, words: [...words, w] })
    },
    [data, words, resolved.prefillNames, onChange]
  )

  const addWordFromDrop = useCallback(
    async (filePath: string) => {
      const c = data._wordCounter + 1
      const id = `word-${c}`
      const relativePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const imagePath = `${relativePath.replace(/\\/g, '/')}`
      const w: BalloonWord = {
        id,
        word: resolved.prefillNames ? `WORD${getExcelName(c)}` : '',
        imagePath,
        hint: ''
      }
      onChange({ ...data, _wordCounter: c, words: [...words, w] })
    },
    [data, words, projectDir, resolved.prefillNames, onChange]
  )

  const updateWord = useCallback(
    (id: string, patch: Partial<BalloonWord>) => {
      onChange({ ...data, words: words.map((w) => (w.id === id ? { ...w, ...patch } : w)) })
    },
    [data, words, onChange]
  )

  const deleteWord = useCallback(
    (id: string) => {
      onChange({ ...data, words: words.filter((w) => w.id !== id) })
    },
    [data, words, onChange]
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addWord
  })

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <SummarySidebar words={words} />

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <WordsTab
          words={words}
          projectDir={projectDir}
          onAddWord={addWord}
          onAddWordFromDrop={addWordFromDrop}
          onUpdateWord={updateWord}
          onDeleteWord={deleteWord}
        />
      </Box>
    </Box>
  )
}
