import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import { MyEditorProps } from '@renderer/types/editor'
import { JSX, useCallback } from 'react'
import {
  AtoZWordField,
  EmptyState,
  FileDropTarget,
  IndexBadge,
  SidebarTab,
  StickyHeader
} from '../../components/EditorShared'
import ImagePicker from '../../components/ImagePicker'
import { BalloonLetterPickerAppData, BalloonWord } from '../../types'
import { getExcelName } from '../../utils/stringUtils'

interface Props extends MyEditorProps<BalloonLetterPickerAppData> {}

export default function BalloonLetterPickerEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values as BalloonLetterPickerAppData
  const { resolved } = useSettings()
  const { words } = data

  // ── CRUD Helpers ──────────────────────────────────────────────────────────
  const nextWordId = useCallback(() => {
    const c = (data._wordCounter ?? 0) + 1
    return { id: `word-${c}`, counter: c }
  }, [data._wordCounter])

  const addWord = useCallback(
    (initialImagePath?: string) => {
      const { id, counter } = nextWordId()
      const w: BalloonWord = {
        id,
        word: resolved.prefillNames ? `WORD${getExcelName(counter)}` : '',
        imagePath: initialImagePath ?? '',
        hint: ''
      }
      form.setFieldValue('_wordCounter', counter)
      form.insertListItem('words', w)
    },
    [form, data, resolved.prefillNames, nextWordId]
  )

  const addWordFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextWordId()
      const relativePath = await window.electronAPI.importImage(filePath, projectDir, id)
      // Convert to the ./images/... style relative path the template expects
      const imagePath = `./${relativePath.replace(/\\/g, '/')}`
      const w: BalloonWord = {
        id,
        word: resolved.prefillNames ? `WORD${getExcelName(counter)}` : '',
        imagePath,
        hint: ''
      }
      form.setFieldValue('_wordCounter', counter)
      form.insertListItem('words', w)
    },
    [form, data, projectDir, resolved.prefillNames, nextWordId]
  )

  const deleteWord = useCallback(
    (index: number) => {
      form.removeListItem('words', index)
    },
    [form]
  )

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addWord
  })

  // ── Validation ────────────────────────────────────────────────────────────
  const missingWordCount = words.filter((w) => !w.word.trim()).length
  const invalidWordCount = words.filter(
    (w) => w.word.trim() && !/^[A-Za-z]+$/.test(w.word.trim())
  ).length
  const missingHintCount = words.filter((w) => !w.hint.trim()).length
  const hasIssues = missingWordCount > 0 || invalidWordCount > 0 || missingHintCount > 0

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          background: '#13161f',
          p: 2,
          gap: 1
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
        >
          Words
        </Typography>
        <SidebarTab
          active={true}
          onClick={() => {}}
          icon={<TextFieldsIcon fontSize="small" />}
          label="All Words"
          badge={words.length}
          badgeColor={hasIssues ? 'error' : 'default'}
        />

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
        >
          Summary
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <SummaryRow label="Total words" value={words.length} />
          <SummaryRow label="With images" value={words.filter((w) => !!w.imagePath).length} />
          <SummaryRow label="With hints" value={words.filter((w) => !!w.hint.trim()).length} />
          {missingWordCount > 0 && (
            <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>
              {missingWordCount} missing word text
            </Typography>
          )}
          {invalidWordCount > 0 && (
            <Typography variant="caption" color="warning.main">
              {invalidWordCount} contain non-letters
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {[
              missingWordCount > 0 && `${missingWordCount} word(s) have no text`,
              invalidWordCount > 0 && `${invalidWordCount} word(s) contain non-letter characters`,
              missingHintCount > 0 && `${missingHintCount} word(s) are missing a hint`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        <StickyHeader
          title="Words"
          description="Each word will be spelled by picking letters from balloons. Add a hint to help students."
          actions={
            <FileDropTarget onFileDrop={addWordFromDrop}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={() => addWord()}
              >
                Add Word
              </Button>
            </FileDropTarget>
          }
        />

        {words.length === 0 ? (
          <EmptyState
            icon={<TextFieldsIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
            title="No words yet"
            description='Click "Add Word" or drop an image on the button to create your first word.'
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {words.map((w, idx) => (
              <WordCard
                key={w.id}
                form={form}
                word={w}
                index={idx}
                projectDir={projectDir}
                autoFocus={idx === words.length - 1}
                onDelete={() => deleteWord(idx)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Chip
        label={value}
        size="small"
        sx={{ height: 16, fontSize: '0.65rem', minWidth: 24 }}
        color={value === 0 ? 'default' : 'primary'}
      />
    </Box>
  )
}

function WordCard({
  form,
  word,
  index,
  projectDir,
  autoFocus,
  onDelete
}: {
  form: Props['form']
  word: BalloonWord
  index: number
  projectDir: string
  autoFocus?: boolean
  onDelete: () => void
}): JSX.Element {
  const wordText = word.word.trim().toUpperCase()
  const isInvalid = wordText && !/^[A-Z]+$/.test(wordText)
  const path = `words[${index}]`

  // imagePath is like './images/words/jump.png', relativePath is 'images/words/jump.png'
  const imageRelative = word.imagePath ? word.imagePath.replace(/^\.\//, '') : null

  return (
    <FileDropTarget
      onFileDrop={async (fp) => {
        const rel = await window.electronAPI.importImage(fp, projectDir, word.id)
        const imagePath = rel ? `./${rel.replace(/\\/g, '/')}` : ''
        form.setFieldValue(`${path}.imagePath`, imagePath)
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: isInvalid ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27',
          transition: 'border-color 0.15s',
          '&:hover': {
            borderColor: isInvalid ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.12)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <IndexBadge index={index} color="primary" />

          <form.Field name={`${path}.imagePath`}>
            {(field) => (
              <ImagePicker
                projectDir={projectDir}
                desiredNamePrefix={word.id}
                value={imageRelative}
                onChange={(p) => {
                  const imagePath = p ? `./${p.replace(/\\/g, '/')}` : ''
                  field.handleChange(imagePath)
                }}
                label="Word image"
                size={80}
              />
            )}
          </form.Field>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <form.Field name={`${path}.word`}>
              {(field) => (
                <AtoZWordField
                  label="Word (uppercase letters only)"
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. JUMP"
                  autoFocus={autoFocus}
                />
              )}
            </form.Field>

            <form.Field name={`${path}.hint`}>
              {(field) => (
                <TextField
                  label="Hint"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. He pushes his body off the ground and rises into the air."
                  size="small"
                  multiline
                  minRows={2}
                  fullWidth
                  error={!field.state.value.trim()}
                  helperText={
                    !field.state.value.trim() ? 'Required — helps students guess the word' : ''
                  }
                />
              )}
            </form.Field>
          </Box>

          <Tooltip title="Delete word">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </FileDropTarget>
  )
}
