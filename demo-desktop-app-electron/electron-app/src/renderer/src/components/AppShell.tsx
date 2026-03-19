import React from 'react'
import { Box } from '@mui/material'

interface Props {
  children: React.ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#0f1117',
      }}
    >
      {/* Electron traffic lights spacer (macOS hiddenInset) */}
      <Box
        sx={{
          height: '28px',
          flexShrink: 0,
          WebkitAppRegion: 'drag',
          background: 'transparent',
        }}
      />

      {/* Page content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  )
}
