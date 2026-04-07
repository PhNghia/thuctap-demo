import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FolderOffIcon from '@mui/icons-material/FolderOff'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import HistoryIcon from '@mui/icons-material/History'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material'
import React from 'react'
import { GameTemplate, RecentProject } from '../../types'
import { timeRelative } from '../../utils/stringUtils'

// ── Recent Projects Section ───────────────────────────────────────────────────
export interface RecentProjectsSectionProps {
  recent: RecentProject[]
  showRecent: boolean
  onToggleShow: () => void
  onBrowse: () => void
  onOpenRecent: (entry: RecentProject) => void
  onRemoveRecent: (filePath: string) => void
  onOpenInExplorer: (filePath: string) => void
}

export function RecentProjectsSection({
  recent,
  showRecent,
  onToggleShow,
  onBrowse,
  onOpenRecent,
  onRemoveRecent,
  onOpenInExplorer
}: RecentProjectsSectionProps): React.ReactElement {
  return (
    <Box>
      <Box
        onClick={onToggleShow}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          userSelect: 'none',
          mb: showRecent ? 1.5 : 0
        }}
      >
        <HistoryIcon
          sx={{ fontSize: 18, color: recent.length > 0 ? 'primary.main' : 'text.disabled' }}
        />
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 2,
            color: recent.length > 0 ? 'text.secondary' : 'text.disabled',
            flex: 1
          }}
        >
          Continue working {recent.length > 0 && `(${recent.length})`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderOpenIcon />}
            onClick={(e) => {
              e.stopPropagation()
              onBrowse()
            }}
            sx={{ borderStyle: 'dashed', fontSize: '0.75rem' }}
          >
            Browse…
          </Button>
          {showRecent ? (
            <Box component={ExpandLessIcon} fontSize="small" sx={{ color: 'text.disabled' }} />
          ) : (
            <Box component={ExpandMoreIcon} fontSize="small" sx={{ color: 'text.disabled' }} />
          )}
        </Box>
      </Box>

      <Collapse in={showRecent}>
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            No recently opened projects yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 1.5
            }}
          >
            {recent.map((r) => (
              <RecentProjectItem
                key={r.filePath}
                entry={r}
                onClick={() => onOpenRecent(r)}
                onRemove={(e) => {
                  e.stopPropagation()
                  onRemoveRecent(r.filePath)
                }}
                onOpenInExplorer={(e) => {
                  e.stopPropagation()
                  onOpenInExplorer(r.filePath)
                }}
              />
            ))}
          </Box>
        )}
      </Collapse>
    </Box>
  )
}

// ── Recent Project Item ───────────────────────────────────────────────────────
interface RecentProjectItemProps {
  entry: RecentProject
  onClick: () => void
  onRemove: (e: React.MouseEvent) => void
  onOpenInExplorer: (e: React.MouseEvent) => void
}

function RecentProjectItem({
  entry,
  onClick,
  onRemove,
  onOpenInExplorer
}: RecentProjectItemProps): React.ReactElement {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        background: '#1a1d27',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.14)', background: '#1e2130' }
      }}
    >
      <SportsEsportsIcon
        sx={{ fontSize: 28, color: 'primary.main', opacity: 0.6, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {entry.projectName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
          <Chip label={entry.templateName} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
            Opened {timeRelative(entry.lastOpened)}
          </Typography>
        </Box>
        <Tooltip title={entry.filePath}>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              fontSize: '0.65rem',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mt: 0.25
            }}
          >
            📁 {entry.projectDir}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Open in Explorer">
          <IconButton
            size="small"
            onClick={onOpenInExplorer}
            sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}
          >
            <FolderOpenIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove from list">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

// ── Template Grid ─────────────────────────────────────────────────────────────
export interface TemplateGridProps {
  templates: GameTemplate[]
  onSelect: (template: GameTemplate) => void
}

export function TemplateGrid({ templates, onSelect }: TemplateGridProps): React.ReactElement {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
        Start a new project
      </Typography>
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2
        }}
      >
        {templates.map((t) => (
          <GameTemplateCard key={t.id} template={t} onSelect={onSelect} />
        ))}
      </Box>
    </Box>
  )
}

// ── Game Template Card ────────────────────────────────────────────────────────
export interface GameTemplateCardProps {
  template: GameTemplate
  onSelect: (template: GameTemplate) => void
}

export function GameTemplateCard({
  template,
  onSelect
}: GameTemplateCardProps): React.ReactElement {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background:
          'linear-gradient(135deg, rgba(110,231,183,0.05) 0%, rgba(167,139,250,0.05) 100%)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(110,231,183,0.12)'
        }
      }}
    >
      <CardActionArea
        onClick={() => onSelect(template)}
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'stretch',
          height: '100%'
        }}
      >
        <Box
          sx={{
            height: 140,
            borderRadius: 1.5,
            mb: 1,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(110,231,183,0.12) 0%, rgba(167,139,250,0.12) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {template.thumbnailUrl ? (
            <Box
              component="img"
              src={template.thumbnailUrl}
              alt={template.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <SportsEsportsIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.6 }} />
          )}
        </Box>

        <CardContent
          sx={{
            pt: 0.5,
            pb: '12px !important',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            minHeight: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
              {template.name}
            </Typography>
            <Chip
              label={`v${template.version}`}
              size="small"
              sx={{ fontSize: '0.65rem', height: 18 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            {template.description}
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              marginTop: 'auto'
            }}
          >
            <AddIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
              Create new project
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

// ── Folder Conflict Dialogs ───────────────────────────────────────────────────
export interface HasProjectDialogProps {
  open: boolean
  folder: string
  onClose: () => void
  onOpen: () => void
}

export function HasProjectDialog({
  open,
  folder,
  onClose,
  onOpen
}: HasProjectDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Project already exists here</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This folder already has a project file. Would you like to open it?
        </DialogContentText>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 1, display: 'block', wordBreak: 'break-all' }}
        >
          {folder}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<FolderOpenIcon />} onClick={onOpen}>
          Open existing
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export interface NonEmptyFolderDialogProps {
  open: boolean
  folder: string
  onClose: () => void
  onChooseAnother: () => void
}

export function NonEmptyFolderDialog({
  open,
  folder,
  onClose,
  onChooseAnother
}: NonEmptyFolderDialogProps): React.ReactElement {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FolderOffIcon color="warning" /> Folder is not empty
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please choose an empty folder so your project files don&apos;t get mixed up with other
          things.
        </DialogContentText>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 1, display: 'block', wordBreak: 'break-all' }}
        >
          {folder}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onChooseAnother}>
          Choose another folder
        </Button>
      </DialogActions>
    </Dialog>
  )
}
