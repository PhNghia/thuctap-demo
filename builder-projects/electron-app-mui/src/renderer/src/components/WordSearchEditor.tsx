import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import TextureIcon from '@mui/icons-material/Texture'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
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
  Typography
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { WordSearchAppData, WordSearchItem } from '../types'
import { DroppableZone, EmptyState, IndexBadge, NameField, SidebarTab } from './EditorShared'
import ImagePicker from './ImagePicker'

interface Props {
  appData: WordSearchAppData
  projectDir: string
  onChange: (data: WordSearchAppData) => void
}

type Tab = 'setup' | 'words' | 'overview'

const DEFAULT_HELPER = 'Find every hidden word in the puzzle.'

function normalizeWordInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function clampGridSize(value: number): number {
  if (!Number.isFinite(value)) return 12
  return Math.max(8, Math.min(20, Math.round(value)))
}

function normalize(data: WordSearchAppData): WordSearchAppData {
  return {
    title: data.title ?? 'Word Search Game',
    helperText: data.helperText ?? DEFAULT_HELPER,
    gridSize: clampGridSize(data.gridSize),
    backgroundImagePath: data.backgroundImagePath ?? null,
    items: (data.items ?? []).map((item, index) => ({
      id: item.id ?? `word-${index + 1}`,
      word: typeof item.word === 'string' ? normalizeWordInput(item.word) : '',
      imagePath: item.imagePath ?? null
    })),
    _itemCounter: data._itemCounter ?? 0
  }
}

function nextWordId(data: WordSearchAppData) {
  const counter = data._itemCounter + 1
  return { id: `word-${counter}`, counter }
}

function summarizeDuplicates(items: WordSearchItem[]): string[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const word = normalizeWordInput(item.word)
    if (!word) continue
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([word]) => word)
}

export default function WordSearchEditor({ appData: raw, projectDir, onChange }: Props) {
  const data = normalize(raw)
  const { resolved } = useSettings()
  const [tab, setTab] = useState<Tab>('setup')
  const { items } = data

  const validItems = items.filter((item) => item.word.trim())
  const duplicateWords = summarizeDuplicates(items)
  const longestWord = validItems.reduce((max, item) => Math.max(max, item.word.length), 0)
  const effectiveGridSize = Math.max(data.gridSize, longestWord, 8)
  const hasBlankWords = items.some((item) => !item.word)
  const hasIssues = validItems.length === 0 || duplicateWords.length > 0 || hasBlankWords

  const addItem = useCallback(
    (initialImage?: string) => {
      const { id, counter } = nextWordId(data)
      const item: WordSearchItem = {
        id,
        word: resolved.prefillNames ? `WORD${counter}` : '',
        imagePath: initialImage ?? null
      }
      onChange({ ...data, _itemCounter: counter, items: [...items, item] })
      setTab('words')
    },
    [data, items, onChange, resolved.prefillNames]
  )

  const addItemFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextWordId(data)
      const imagePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const item: WordSearchItem = {
        id,
        word: resolved.prefillNames ? `WORD${counter}` : '',
        imagePath
      }
      onChange({ ...data, _itemCounter: counter, items: [...items, item] })
      setTab('words')
    },
    [data, items, onChange, projectDir, resolved.prefillNames]
  )

  const updateItem = useCallback(
    (id: string, patch: Partial<WordSearchItem>) => {
      onChange({
        ...data,
        items: items.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            ...patch,
            word:
              patch.word !== undefined
                ? normalizeWordInput(patch.word)
                : normalizeWordInput(item.word)
          }
        })
      })
    },
    [data, items, onChange]
  )

  const deleteItem = useCallback(
    (id: string) => {
      onChange({ ...data, items: items.filter((item) => item.id !== id) })
    },
    [data, items, onChange]
  )

  const updateData = useCallback(
    (patch: Partial<WordSearchAppData>) => {
      onChange({ ...data, ...patch })
    },
    [data, onChange]
  )

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
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
          active={tab === 'setup'}
          onClick={() => setTab('setup')}
          icon={<TextureIcon fontSize="small" />}
          label="Setup"
          badge={data.backgroundImagePath ? 1 : 0}
          badgeColor="default"
        />
        <SidebarTab
          active={tab === 'words'}
          onClick={() => setTab('words')}
          icon={<ImageSearchIcon fontSize="small" />}
          label="Words"
          badge={items.length}
          badgeColor={hasIssues ? 'error' : 'default'}
        />
        <SidebarTab
          active={tab === 'overview'}
          onClick={() => setTab('overview')}
          icon={<ViewAgendaIcon fontSize="small" />}
          label="Overview"
          badge={validItems.length}
          badgeColor={duplicateWords.length > 0 ? 'error' : 'default'}
        />

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
        >
          Summary
        </Typography>
        <SummaryRow label="Valid words" value={validItems.length} />
        <SummaryRow label="Grid size" value={effectiveGridSize} />
        <SummaryRow label="Longest word" value={longestWord} />
        {duplicateWords.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              Duplicate words found
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {[
              validItems.length === 0 && 'Add at least one word before exporting',
              hasBlankWords && 'Some word cards are still blank',
              duplicateWords.length > 0 &&
                `Duplicate words: ${duplicateWords.slice(0, 4).join(', ')}${duplicateWords.length > 4 ? '…' : ''}`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        {tab === 'setup' && (
          <SetupTab
            data={data}
            projectDir={projectDir}
            effectiveGridSize={effectiveGridSize}
            onChange={updateData}
          />
        )}
        {tab === 'words' && (
          <WordsTab
            items={items}
            projectDir={projectDir}
            onAdd={addItem}
            onAddFromDrop={addItemFromDrop}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {tab === 'overview' && (
          <OverviewTab
            data={data}
            items={items}
            validItems={validItems}
            duplicateWords={duplicateWords}
            effectiveGridSize={effectiveGridSize}
            longestWord={longestWord}
            onAddWord={addItem}
            onAddWordFromDrop={addItemFromDrop}
            onOpenWords={() => setTab('words')}
            onOpenSetup={() => setTab('setup')}
            onUpdateWord={updateItem}
            onDeleteWord={deleteItem}
            projectDir={projectDir}
          />
        )}
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
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

function SetupTab({
  data,
  projectDir,
  effectiveGridSize,
  onChange
}: {
  data: WordSearchAppData
  projectDir: string
  effectiveGridSize: number
  onChange: (patch: Partial<WordSearchAppData>) => void
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 900 }}>
      <Box>
        <Typography variant="h6">Game setup</Typography>
        <Typography variant="caption" color="text.secondary">
          Configure the exported word search page and its background image.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27'
        }}
      >
        <ImagePicker
          projectDir={projectDir}
          entityId="word-search-background"
          value={data.backgroundImagePath}
          onChange={(backgroundImagePath) => onChange({ backgroundImagePath })}
          label="Background"
          size={132}
        />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            fullWidth
            label="Game title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Word Search Game"
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Helper text"
            value={data.helperText}
            onChange={(e) => onChange({ helperText: e.target.value })}
            placeholder={DEFAULT_HELPER}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label="Preferred grid size"
              value={data.gridSize}
              onChange={(e) => onChange({ gridSize: clampGridSize(Number(e.target.value)) })}
              inputProps={{ min: 8, max: 20 }}
              sx={{ width: 180 }}
            />
            <Alert severity="info" sx={{ flex: 1, minWidth: 280 }}>
              Export will use at least <strong>{effectiveGridSize}</strong> cells per side so the
              longest word always fits.
            </Alert>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

function WordsTab({
  items,
  projectDir,
  onAdd,
  onAddFromDrop,
  onUpdate,
  onDelete
}: {
  items: WordSearchItem[]
  projectDir: string
  onAdd: () => void
  onAddFromDrop: (filePath: string) => void
  onUpdate: (id: string, patch: Partial<WordSearchItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6">Words</Typography>
          <Typography variant="caption" color="text.secondary">
            Add the words students need to find. Images are optional clue cards.
          </Typography>
        </Box>
        <DroppableZone onFileDrop={onAddFromDrop}>
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => onAdd()}>
            Add Word
          </Button>
        </DroppableZone>
      </Box>

      {items.length === 0 ? (
        <EmptyState
          icon={<SquareFootIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No words yet"
          description='Click "Add Word" or drop an image onto the button to create your first clue card.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, index) => (
            <WordCard
              key={item.id}
              item={item}
              index={index}
              projectDir={projectDir}
              onUpdate={onUpdate}
              onDelete={onDelete}
              autoFocus={index === items.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function WordCard({
  item,
  index,
  projectDir,
  autoFocus,
  onUpdate,
  onDelete
}: {
  item: WordSearchItem
  index: number
  projectDir: string
  autoFocus?: boolean
  onUpdate: (id: string, patch: Partial<WordSearchItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: '#1a1d27'
      }}
    >
      <IndexBadge index={index} color="primary" />
      <ImagePicker
        projectDir={projectDir}
        entityId={item.id}
        value={item.imagePath}
        onChange={(imagePath) => onUpdate(item.id, { imagePath })}
        label="Clue image"
        size={72}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <NameField
          label="Word"
          value={item.word}
          onChange={(word) => onUpdate(item.id, { word })}
          placeholder="e.g. TIGER"
          autoFocus={autoFocus}
        />
        <Typography variant="caption" color="text.secondary">
          Letters and numbers only. Spaces and symbols are removed automatically.
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={() => onDelete(item.id)}
        sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  )
}

function OverviewTab({
  data,
  items,
  validItems,
  duplicateWords,
  effectiveGridSize,
  longestWord,
  onAddWord,
  onAddWordFromDrop,
  onOpenWords,
  onOpenSetup,
  onUpdateWord,
  onDeleteWord,
  projectDir
}: {
  data: WordSearchAppData
  items: WordSearchItem[]
  validItems: WordSearchItem[]
  duplicateWords: string[]
  effectiveGridSize: number
  longestWord: number
  onAddWord: () => void
  onAddWordFromDrop: (filePath: string) => void
  onOpenWords: () => void
  onOpenSetup: () => void
  onUpdateWord: (id: string, patch: Partial<WordSearchItem>) => void
  onDeleteWord: (id: string) => void
  projectDir: string
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">Overview</Typography>
          <Typography variant="caption" color="text.secondary">
            Quick check before you save or export this game.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={onOpenSetup}>
            Edit setup
          </Button>
          <DroppableZone onFileDrop={onAddWordFromDrop}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddWord}>
              Add word
            </Button>
          </DroppableZone>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1.5
        }}
      >
        <StatCard label="Title" value={data.title.trim() || 'Untitled'} />
        <StatCard label="Playable words" value={String(validItems.length)} />
        <StatCard label="Grid" value={`${effectiveGridSize} × ${effectiveGridSize}`} />
        <StatCard label="Longest word" value={String(longestWord || 0)} />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27'
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Export behavior
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            The exported HTML generates the puzzle automatically from your word list.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Background and clue images are copied from the project assets folder during export.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If a word is longer than the preferred size, the grid expands so it still fits.
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle2">Word cards</Typography>
          <Button size="small" onClick={onOpenWords}>
            Open full editor
          </Button>
        </Box>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No word cards yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item, index) => (
              <CompactWordCard
                key={item.id}
                item={item}
                index={index}
                projectDir={projectDir}
                onUpdate={onUpdateWord}
                onDelete={onDeleteWord}
              />
            ))}
          </Box>
        )}
      </Paper>

      {duplicateWords.length > 0 && (
        <Alert severity="warning">
          Duplicate words can make the puzzle ambiguous. Go back to the{' '}
          <Button color="inherit" size="small" onClick={onOpenWords}>
            Words tab
          </Button>
          .
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27'
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Word list
        </Typography>
        {validItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No valid words yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {validItems.map((item) => (
              <Chip key={item.id} label={item.word} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

function CompactWordCard({
  item,
  index,
  projectDir,
  onUpdate,
  onDelete
}: {
  item: WordSearchItem
  index: number
  projectDir: string
  onUpdate: (id: string, patch: Partial<WordSearchItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      <IndexBadge index={index} color="secondary" />
      <ImagePicker
        projectDir={projectDir}
        entityId={item.id}
        value={item.imagePath}
        onChange={(imagePath) => onUpdate(item.id, { imagePath })}
        label="Image"
        size={52}
      />
      <NameField
        label="Word"
        value={item.word}
        onChange={(word) => onUpdate(item.id, { word })}
        placeholder="WORD"
      />
      <IconButton
        size="small"
        onClick={() => onDelete(item.id)}
        sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: '#1a1d27'
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontSize: '0.65rem', letterSpacing: 1.5 }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Paper>
  )
}
