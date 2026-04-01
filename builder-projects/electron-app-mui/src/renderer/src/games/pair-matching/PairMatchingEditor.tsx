import AddIcon from '@mui/icons-material/Add'
import CollectionsIcon from '@mui/icons-material/Collections'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Alert,
  Box,
  Button,
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
import { JSX, useCallback, useState } from 'react'
import {
  EmptyState,
  FileDropTarget,
  IndexBadge,
  NameField,
  SidebarTab,
  StickyHeader
} from '../../components/EditorShared'
import ImagePicker from '../../components/ImagePicker'
import { PairMatchingAppData, PairMatchingItem } from '../../types'

interface Props extends MyEditorProps<PairMatchingAppData> {}

type Tab = 'pairs' | 'settings'

export default function PairMatchingEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values as PairMatchingAppData
  const [tab, setTab] = useState<Tab>('pairs')
  const { resolved } = useSettings()
  const { items } = data

  // ── CRUD Helpers ──────────────────────────────────────────────────────────
  const nextItemId = useCallback(() => {
    const c = (data._itemCounter ?? 0) + 1
    return { id: `item-${c}`, counter: c }
  }, [data._itemCounter])

  const addItem = useCallback(
    (initialImage?: string) => {
      const { id, counter } = nextItemId()
      const i: PairMatchingItem = {
        id,
        keyword: resolved.prefillNames ? `Pair ${counter}` : '',
        imagePath: initialImage ?? null,
        minPairs: 1
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
      const i: PairMatchingItem = {
        id,
        keyword: resolved.prefillNames ? `Pair ${counter}` : '',
        imagePath,
        minPairs: 1
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

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addItem
  })

  // ── Validation ────────────────────────────────────────────────────────────
  const unnamedCount = items.filter((i) => !i.keyword.trim()).length
  const hasIssues = unnamedCount > 0

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
          active={tab === 'pairs'}
          onClick={() => setTab('pairs')}
          icon={<CollectionsIcon fontSize="small" />}
          label="Pairs"
          badge={items.length}
          badgeColor={unnamedCount > 0 ? 'error' : 'default'}
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
            {unnamedCount > 0 && `${unnamedCount} pair(s) missing a keyword`}
          </Alert>
        </Collapse>

        {tab === 'pairs' && (
          <PairsTab
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

function PairsTab({
  form,
  items,
  projectDir,
  onAdd,
  onAddFromDrop,
  onDelete
}: {
  form: Props['form']
  items: PairMatchingItem[]
  projectDir: string
  onAdd: () => void
  onAddFromDrop: (fp: string) => void
  onDelete: (idx: number) => void
}): JSX.Element {
  return (
    <Box>
      <StickyHeader
        title="Pairs"
        description="Add pairs of images and keywords for students to match."
        actions={
          <FileDropTarget onFileDrop={onAddFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAdd()}
            >
              Add Pair
            </Button>
          </FileDropTarget>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<CollectionsIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No pairs yet"
          description='Click "Add Pair" or drop an image here to create one.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, idx) => (
            <PairCard
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

function PairCard({
  form,
  item,
  index,
  projectDir,
  onDelete,
  autoFocus
}: {
  form: Props['form']
  item: PairMatchingItem
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

        <form.Field name={`${path}.keyword`}>
          {(field) => (
            <NameField
              label="Keyword"
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              onBlur={field.handleBlur}
              placeholder="e.g. Apple, Dog…"
              autoFocus={autoFocus}
            />
          )}
        </form.Field>

        <form.Field name={`${path}.minPairs`}>
          {(field) => (
            <TextField
              label="Min Pairs"
              type="number"
              size="small"
              value={field.state.value ?? ''}
              onChange={(e) =>
                field.handleChange(e.target.value === '' ? null : Number(e.target.value))
              }
              onBlur={field.handleBlur}
              sx={{ width: 100 }}
              placeholder="Default"
            />
          )}
        </form.Field>

        <Tooltip title="Delete pair">
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
        description="Global configurations for the pair-matching game."
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
        <Paper
          elevation={0}
          sx={{ p: 3, background: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Game Rules
          </Typography>
          <form.Field name="minTotalPairs">
            {(field) => (
              <TextField
                label="Minimum Total Pairs"
                type="number"
                size="small"
                value={field.state.value ?? ''}
                onChange={(e) =>
                  field.handleChange(e.target.value === '' ? null : Number(e.target.value))
                }
                onBlur={field.handleBlur}
                fullWidth
                placeholder="No minimum (empty)"
                helperText="Globally ensure this many pairs appear in the game. Leave empty for default."
              />
            )}
          </form.Field>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 3, background: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Card Appearance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <form.Field name="cardBackColor">
                {(field) => (
                  <TextField
                    label="Card Back Color"
                    size="small"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    fullWidth
                    placeholder="e.g. #FF0000 or red"
                    helperText="Color used for the back of cards if no image is provided."
                    sx={{ mb: 2 }}
                  />
                )}
              </form.Field>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Card Back Image
              </Typography>
              <form.Field name="cardBackImage">
                {(field) => (
                  <ImagePicker
                    projectDir={projectDir}
                    desiredNamePrefix="global-card-back"
                    value={field.state.value ?? null}
                    onChange={(p) => field.handleChange(p)}
                    label="Select Background"
                    size={100}
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
