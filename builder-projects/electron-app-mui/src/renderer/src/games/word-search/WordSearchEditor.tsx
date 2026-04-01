import AddIcon from '@mui/icons-material/Add'
import CollectionsIcon from '@mui/icons-material/Collections'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import { Alert, Box, Button, Collapse, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import { MyEditorProps } from '@renderer/types/editor'
import { JSX, useCallback, useState } from 'react'
import {
  AtoZWordField,
  EmptyState,
  FileDropTarget,
  IndexBadge,
  SidebarTab,
  StickyHeader
} from '../../components/EditorShared'
import ImagePicker from '../../components/ImagePicker'
import { WordSearchAppData, WordSearchItem } from '../../types'
import { getExcelName } from '../../utils/stringUtils'

interface Props extends MyEditorProps<WordSearchAppData> {}

type Tab = 'words' | 'settings'

export default function WordSearchEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values as WordSearchAppData
  const [tab, setTab] = useState<Tab>('words')
  const { resolved } = useSettings()
  const { items } = data

  const nextItemId = useCallback(() => {
    const c = (data._itemCounter ?? 0) + 1
    return { id: `item-${c}`, counter: c }
  }, [data._itemCounter])

  const addItem = useCallback(
    (initialImage?: string) => {
      const { id, counter } = nextItemId()
      const i: WordSearchItem = {
        id,
        word: resolved.prefillNames ? `WORD${getExcelName(counter)}` : '',
        imagePath: initialImage ?? null
      }
      form.setFieldValue('_itemCounter', counter)
      form.insertListItem('items', i)
    },
    [form, data, resolved.prefillNames, nextItemId]
  )

  const addItemFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextItemId()
      const imagePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const i: WordSearchItem = {
        id,
        word: resolved.prefillNames ? `WORD${getExcelName(counter)}` : '',
        imagePath
      }
      form.setFieldValue('_itemCounter', counter)
      form.insertListItem('items', i)
    },
    [form, data, projectDir, resolved.prefillNames, nextItemId]
  )

  const deleteItem = useCallback(
    (index: number) => {
      form.removeListItem('items', index)
    },
    [form]
  )

  useEntityCreateShortcut({
    onTier1: addItem
  })

  // Basic validation
  const unnamedCount = items.filter((i) => !i.word.trim()).length
  const invalidCount = items.filter((i) => i.word.trim() && !/^[A-Z]+$/.test(i.word.trim())).length
  const hasIssues = unnamedCount > 0 || invalidCount > 0

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
          Sections
        </Typography>
        <SidebarTab
          active={tab === 'words'}
          onClick={() => setTab('words')}
          icon={<CollectionsIcon fontSize="small" />}
          label="Words"
          badge={items.length}
          badgeColor={hasIssues ? 'error' : 'default'}
        />
        <SidebarTab
          active={tab === 'settings'}
          onClick={() => setTab('settings')}
          icon={<SettingsIcon fontSize="small" />}
          label="Settings"
          badge={0}
          badgeColor="default"
        />
      </Box>

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {[
              unnamedCount > 0 && `${unnamedCount} item(s) missing a word`,
              invalidCount > 0 && `${invalidCount} item(s) with invalid characters (A-Z only)`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        {tab === 'words' && (
          <WordsTab
            form={form}
            items={items}
            projectDir={projectDir}
            onAdd={addItem}
            onAddFromDrop={addItemFromDrop}
            onDelete={deleteItem}
          />
        )}
        {tab === 'settings' && <SettingsTab form={form} projectDir={projectDir} />}
      </Box>
    </Box>
  )
}

function WordsTab({
  form,
  items,
  projectDir,
  onAdd,
  onAddFromDrop,
  onDelete
}: {
  form: Props['form']
  items: WordSearchItem[]
  projectDir: string
  onAdd: () => void
  onAddFromDrop: (fp: string) => void
  onDelete: (idx: number) => void
}): JSX.Element {
  return (
    <Box>
      <StickyHeader
        title="Words"
        description="Add words and corresponding images for the word search."
        actions={
          <FileDropTarget onFileDrop={onAddFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAdd()}
            >
              Add Word
            </Button>
          </FileDropTarget>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<CollectionsIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No words yet"
          description='Click "Add Word" or drop an image here to create one.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, idx) => (
            <WordCard
              key={item.id}
              form={form}
              item={item}
              index={idx}
              projectDir={projectDir}
              onDelete={() => onDelete(idx)}
              autoFocus={idx === items.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function WordCard({
  form,
  item,
  index,
  projectDir,
  onDelete,
  autoFocus
}: {
  form: Props['form']
  item: WordSearchItem
  index: number
  projectDir: string
  autoFocus?: boolean
  onDelete: () => void
}): JSX.Element {
  const path = `items[${index}]`

  return (
    <FileDropTarget
      onFileDrop={async (fp) => {
        const rel = await window.electronAPI.importImage(fp, projectDir, item.id)
        form.setFieldValue(`${path}.imagePath`, rel)
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27',
          transition: 'border-color 0.15s',
          '&:hover': { borderColor: 'rgba(255,255,255,0.12)' }
        }}
      >
        <IndexBadge index={index} color="primary" />

        <form.Field name={`${path}.imagePath`}>
          {(field) => (
            <ImagePicker
              projectDir={projectDir}
              desiredNamePrefix={item.id}
              value={field.state.value}
              onChange={(p) => field.handleChange(p)}
              label="Image"
              size={72}
            />
          )}
        </form.Field>

        <form.Field name={`${path}.word`}>
          {(field) => (
            <AtoZWordField
              label="Word"
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              placeholder="e.g. APPLE, DOG…"
              autoFocus={autoFocus}
            />
          )}
        </form.Field>

        <Tooltip title="Delete word">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    </FileDropTarget>
  )
}

function SettingsTab({
  form,
  projectDir
}: {
  form: Props['form']
  projectDir: string
}): JSX.Element {
  return (
    <Box>
      <StickyHeader
        title="Settings"
        description="Global configurations for the word search game."
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
        <Paper
          elevation={0}
          sx={{ p: 3, background: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Background Appearance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Game Background Image
              </Typography>
              <form.Field name="backgroundImagePath">
                {(field) => (
                  <ImagePicker
                    projectDir={projectDir}
                    desiredNamePrefix="global-background"
                    value={field.state.value ?? null}
                    onChange={(p) => field.handleChange(p)}
                    label="Select Background"
                    size={160}
                  />
                )}
              </form.Field>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
