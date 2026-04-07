import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PreviewIcon from '@mui/icons-material/Preview'
import RedoIcon from '@mui/icons-material/Redo'
import SaveIcon from '@mui/icons-material/Save'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import UndoIcon from '@mui/icons-material/Undo'
import { Box, Button, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import React from 'react'

export interface ProjectToolbarProps {
  templateName: string
  projectName: string
  isDirty: boolean
  autoSaveLabel: string | null
  canUndo: boolean
  canRedo: boolean
  onBack: () => void
  onRename: () => void
  onSave: () => void
  onSaveAs: () => void
  onPreview: () => void
  onExport: (event: React.MouseEvent<HTMLElement>) => void
  onUndo: () => void
  onRedo: () => void
  /** Render prop for the More Actions menu (three dots) */
  renderMoreActions: () => React.ReactElement
}

export function ProjectToolbar({
  templateName,
  projectName,
  isDirty,
  autoSaveLabel,
  canUndo,
  canRedo,
  onBack,
  onRename,
  onSave,
  onSaveAs,
  onPreview,
  onExport,
  onUndo,
  onRedo,
  renderMoreActions
}: ProjectToolbarProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        background: '#13161f'
      }}
    >
      <Tooltip title="Back to home">
        <IconButton size="small" onClick={onBack}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Game type badge */}
      <Chip
        label={templateName}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0 }}
      />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.95rem',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {projectName}
        </Typography>
        <Tooltip title="Rename project">
          <IconButton
            size="small"
            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
            onClick={onRename}
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        {isDirty && (
          <Chip
            label="unsaved"
            size="small"
            color="warning"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        )}
        {autoSaveLabel && !isDirty && (
          <Chip
            label={autoSaveLabel}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem', opacity: 0.4 }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton size="small" onClick={onUndo} disabled={!canUndo}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <span>
            <IconButton size="small" onClick={onRedo} disabled={!canRedo}>
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Save (Ctrl+S)">
          <Button
            size="small"
            startIcon={<SaveIcon />}
            variant={isDirty ? 'contained' : 'outlined'}
            color={isDirty ? 'primary' : 'inherit'}
            onClick={onSave}
          >
            Save
          </Button>
        </Tooltip>
        <Tooltip title="Save As (Ctrl+Shift+S)">
          <IconButton size="small" onClick={onSaveAs}>
            <SaveAsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Preview (Ctrl+P)">
          <IconButton size="small" onClick={onPreview}>
            <PreviewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export">
          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={onExport}
          >
            Export
          </Button>
        </Tooltip>
        {renderMoreActions()}
      </Box>
    </Box>
  )
}
