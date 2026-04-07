import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import React from 'react'

export interface MoreActionsMenuProps {
  /** The project directory or file path to open in explorer */
  pathToOpen: string
  /** Callback to open settings panel */
  onOpenSettings: () => void
}

/**
 * More Actions menu component (three dots icon).
 * Opens a dropdown with project-related actions.
 */
export function MoreActionsMenu({
  pathToOpen,
  onOpenSettings
}: MoreActionsMenuProps): React.ReactElement {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const handleOpenInExplorer = (): void => {
    window.electronAPI.openPathInExplorer(pathToOpen)
    handleClose()
  }

  const handleOpenSettings = (): void => {
    onOpenSettings()
    handleClose()
  }

  return (
    <>
      <Tooltip title="More actions">
        <IconButton size="small" onClick={handleOpenMenu}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenInExplorer}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open in Explorer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
