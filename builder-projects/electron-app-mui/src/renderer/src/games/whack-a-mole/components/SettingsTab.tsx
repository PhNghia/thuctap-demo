import { Box, Paper, TextField, Typography } from '@mui/material'
import React from 'react'
import { StickyHeader } from '../../../components'
import { WhackAMoleAppData } from '../../../types'

export interface SettingsTabProps {
  data: WhackAMoleAppData
  projectDir: string
  onChange: (data: WhackAMoleAppData) => void
}

/**
 * Settings tab component for WhackAMoleEditor.
 * Handles global game configuration.
 */
export function SettingsTab({ data, onChange }: SettingsTabProps): React.ReactElement {
  return (
    <Box>
      <StickyHeader
        title="Settings"
        description="Global configurations for the whack-a-mole game."
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
        {/* Game Info */}
        <Paper
          elevation={0}
          sx={{ p: 3, background: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Game Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              size="small"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              fullWidth
              placeholder="Enter game title"
              helperText="The title displayed for this game."
            />
            <TextField
              label="Grade"
              size="small"
              type="number"
              value={data.grade}
              onChange={(e) => onChange({ ...data, grade: e.target.value })}
              fullWidth
              placeholder="e.g., 1, 2, 3, 4, 5"
              helperText="The grade level this game is for (1-5)."
              inputProps={{
                min: 1,
                max: 5
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
