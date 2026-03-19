import { useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FolderZipIcon from '@mui/icons-material/FolderZip'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import EditIcon from '@mui/icons-material/Edit'
import { ProjectFile, ProjectState } from '../types'
import GroupSortEditor from '../components/GroupSortEditor'

export default function ProjectPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const locationState = location.state as {
    filePath: string
    projectDir: string
    data: ProjectFile
  } | null

  const [project, setProject] = useState<ProjectState | null>(() => {
    if (!locationState) return null
    return {
      filePath: locationState.filePath,
      projectDir: locationState.projectDir,
      isDirty: false,
      data: locationState.data,
    }
  })

  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' | 'info' } | null>(null)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [backConfirmOpen, setBackConfirmOpen] = useState(false)

  const showSnack = (msg: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnack({ msg, severity })
  }

  const updateAppData = useCallback(
    (appData: ProjectFile['appData']) => {
      setProject(prev => {
        if (!prev) return prev
        return {
          ...prev,
          isDirty: true,
          data: {
            ...prev.data,
            appData,
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },
    []
  )

  const handleSave = async () => {
    if (!project) return
    try {
      await window.electronAPI.saveProject(project.data, project.filePath)
      setProject(prev => prev ? { ...prev, isDirty: false } : prev)
      showSnack('Project saved!')
    } catch (e) {
      showSnack(`Save failed: ${e}`, 'error')
    }
  }

  const handleExport = async (mode: 'folder' | 'zip') => {
    setExportMenuAnchor(null)
    if (!project) return
    try {
      const result = await window.electronAPI.exportProject({
        templateId: project.data.templateId,
        appData: project.data.appData,
        projectDir: project.projectDir,
        mode,
      })
      if (result.canceled) return
      showSnack(`Exported successfully to: ${result.path}`)
    } catch (e) {
      showSnack(`Export failed: ${e}`, 'error')
    }
  }

  const handleRename = async () => {
    if (!project || !renameValue.trim()) return
    const updated = {
      ...project,
      isDirty: true,
      data: { ...project.data, name: renameValue.trim() },
    }
    setProject(updated)
    setRenameOpen(false)
    try {
      await window.electronAPI.saveProject(updated.data, updated.filePath)
      setProject(p => p ? { ...p, isDirty: false } : p)
    } catch {
      // saved on next manual save
    }
  }

  const handleBack = () => {
    if (project?.isDirty) {
      setBackConfirmOpen(true)
    } else {
      navigate('/')
    }
  }

  if (!project || !templateId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">No project data found. Please go back and try again.</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Go Home</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Top bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          background: '#13161f',
        }}
      >
        <Tooltip title="Back to home">
          <IconButton size="small" onClick={handleBack}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            // sx={{ fontSize: '0.95rem', fontWeight: 600, truncate: true , overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            sx={{ fontSize: '0.95rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {project.data.name}
          </Typography>
          <Tooltip title="Rename project">
            <IconButton
              size="small"
              sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              onClick={() => { setRenameValue(project.data.name); setRenameOpen(true) }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          {project.isDirty && (
            <Chip label="unsaved" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<SaveIcon />}
            variant={project.isDirty ? 'contained' : 'outlined'}
            color={project.isDirty ? 'primary' : 'inherit'}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={e => setExportMenuAnchor(e.currentTarget)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* ── Editor area ── */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {templateId === 'group-sort' && (
          <GroupSortEditor
            appData={project.data.appData as any}
            projectDir={project.projectDir}
            onChange={updateAppData}
          />
        )}
      </Box>

      {/* ── Export menu ── */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('folder')}>
          <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Export to folder" secondary="Copies index.html + assets" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExport('zip')}>
          <ListItemIcon><FolderZipIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Export as ZIP" secondary="Single archive file" />
        </MenuItem>
      </Menu>

      {/* ── Rename dialog ── */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Project name"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button onClick={handleRename} variant="contained" disabled={!renameValue.trim()}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Back confirm dialog ── */}
      <Dialog open={backConfirmOpen} onClose={() => setBackConfirmOpen(false)}>
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Save before leaving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBackConfirmOpen(false); navigate('/') }} color="error">
            Discard & leave
          </Button>
          <Button onClick={async () => { setBackConfirmOpen(false); await handleSave(); navigate('/') }} variant="contained">
            Save & leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity ?? 'success'} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
