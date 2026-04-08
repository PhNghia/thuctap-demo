import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
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
  ClickAwayListener,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Tooltip,
  Typography
} from '@mui/material'
import { timeRelative } from '@renderer/utils/stringUtils'
import type { GameTemplate, RecentProject } from '@shared/types'
import React, { useState } from 'react'

// ── Enriched Recent Project (with runtime icon inference) ─────────────────────
export interface EnrichedRecentProject extends RecentProject {
  iconUrl: string | null
}

// ── Recent Projects Section ───────────────────────────────────────────────────
export interface RecentProjectsSectionProps {
  recent: EnrichedRecentProject[]
  allTemplates: GameTemplate[]
  showRecent: boolean
  onToggleShow: () => void
  onBrowse: () => void
  onOpenRecent: (entry: EnrichedRecentProject) => void
  onRemoveRecent: (filePath: string) => void
  onOpenInExplorer: (filePath: string) => void
  filterTemplateId: string | null
  onFilterTemplate: (templateId: string | null) => void
}

export function RecentProjectsSection({
  recent,
  allTemplates,
  showRecent,
  onToggleShow,
  onBrowse,
  onOpenRecent,
  onRemoveRecent,
  onOpenInExplorer,
  filterTemplateId,
  onFilterTemplate
}: RecentProjectsSectionProps): React.ReactElement {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)

  const filteredRecent = filterTemplateId
    ? recent.filter((rp) => rp.templateId === filterTemplateId)
    : recent

  const activeFilterTemplate = filterTemplateId
    ? allTemplates.find((t) => t.id === filterTemplateId)
    : null

  const handleFilterClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setFilterAnchorEl(e.currentTarget as HTMLElement)
  }

  const handleFilterClose = (): void => {
    setFilterAnchorEl(null)
  }

  const handleSelectFilter = (templateId: string | null): void => {
    onFilterTemplate(templateId)
    handleFilterClose()
  }

  const handleClearFilter = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onFilterTemplate(null)
  }

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
          {activeFilterTemplate && ` · ${activeFilterTemplate.name}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={activeFilterTemplate ? 'Change filter' : 'Filter by template'}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{
                borderStyle: 'dashed',
                fontSize: '0.75rem',
                ...(activeFilterTemplate && {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  background: 'rgba(110,231,183,0.08)'
                })
              }}
            >
              {activeFilterTemplate ? 'Filtered' : 'Filter'}
            </Button>
          </Tooltip>
          {activeFilterTemplate && (
            <Chip
              label={activeFilterTemplate.name}
              size="small"
              onDelete={handleClearFilter}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                '& .MuiChip-deleteIcon': {
                  fontSize: '0.9rem',
                  '&:hover': { color: 'error.main' }
                }
              }}
            />
          )}
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

      {/* Filter Menu */}
      <ClickAwayListener onClickAway={handleFilterClose}>
        <Collapse in={filterAnchorEl !== null} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'absolute',
              right: 0,
              zIndex: 1000,
              mt: 1,
              maxWidth: 320,
              maxHeight: 400,
              overflow: 'auto',
              background: '#1a1d27',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <MenuItem
              selected={filterTemplateId === null}
              onClick={() => handleSelectFilter(null)}
              sx={{
                fontSize: '0.85rem',
                py: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <SportsEsportsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography>All templates</Typography>
              </Box>
            </MenuItem>
            {allTemplates.map((template) => (
              <MenuItem
                key={template.id}
                selected={filterTemplateId === template.id}
                onClick={() => handleSelectFilter(template.id)}
                sx={{
                  fontSize: '0.85rem',
                  py: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {template.iconUrl ? (
                    <Box
                      component="img"
                      src={template.iconUrl}
                      alt={template.name}
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: 0.5,
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <SportsEsportsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                  <Typography
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {template.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                    {recent.filter((rp) => rp.templateId === template.id).length}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Paper>
        </Collapse>
      </ClickAwayListener>

      <Collapse in={showRecent}>
        {filteredRecent.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            {filterTemplateId
              ? `No recent projects for "${activeFilterTemplate?.name ?? 'this template'}".`
              : 'No recently opened projects yet.'}
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 1.5
            }}
          >
            {filteredRecent.map((r) => (
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
  entry: EnrichedRecentProject
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
  const iconSrc = entry.iconUrl || null

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
      {iconSrc ? (
        <Box
          component="img"
          src={iconSrc}
          alt={entry.templateName}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            objectFit: 'cover',
            flexShrink: 0
          }}
        />
      ) : (
        <SportsEsportsIcon
          sx={{ fontSize: 28, color: 'primary.main', opacity: 0.6, flexShrink: 0 }}
        />
      )}
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
  onShowRecentForTemplate?: (templateId: string) => void
}

export function TemplateGrid({
  templates,
  onSelect,
  onShowRecentForTemplate
}: TemplateGridProps): React.ReactElement {
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
          <GameTemplateCard
            key={t.id}
            template={t}
            onSelect={onSelect}
            onShowRecentForTemplate={onShowRecentForTemplate}
          />
        ))}
      </Box>
    </Box>
  )
}

// ── Game Template Card ────────────────────────────────────────────────────────
export interface GameTemplateCardProps {
  template: GameTemplate
  onSelect: (template: GameTemplate) => void
  onShowRecentForTemplate?: (templateId: string) => void
}

export function GameTemplateCard({
  template,
  onSelect,
  onShowRecentForTemplate
}: GameTemplateCardProps): React.ReactElement {
  const iconSrc = template.iconUrl || null

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
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: 0 }}>
              {iconSrc ? (
                <Box
                  component="img"
                  src={iconSrc}
                  alt={template.name}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    objectFit: 'cover',
                    flexShrink: 0,
                    mt: 0.15
                  }}
                />
              ) : null}
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.3
                }}
              >
                {template.name}
              </Typography>
            </Box>
            <Chip
              label={`v${template.version}`}
              size="small"
              sx={{ fontSize: '0.65rem', height: 18, flexShrink: 0 }}
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
              gap: 1,
              marginTop: 'auto'
            }}
          >
            <AddIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
              Create Project
            </Typography>
            {onShowRecentForTemplate && (
              <Tooltip title={`Show recent "${template.name}" projects`}>
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowRecentForTemplate(template.id)
                  }}
                  sx={{
                    ml: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: 'text.secondary',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                      background: 'rgba(110,231,183,0.08)'
                    },
                    '&:active': {
                      transform: 'scale(0.97)'
                    }
                  }}
                >
                  <HistoryIcon sx={{ fontSize: 14 }} />
                  Show Recent
                </Box>
              </Tooltip>
            )}
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
