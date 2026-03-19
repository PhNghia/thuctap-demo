import { useState } from 'react'
import { Box, Typography, CircularProgress, Tooltip, IconButton } from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ClearIcon from '@mui/icons-material/Clear'
import { useAssetUrl } from '../hooks/useAssetUrl'

interface Props {
  projectDir: string
  value: string | null   // relative asset path stored in data
  onChange: (relativePath: string | null) => void
  label?: string
  size?: number          // px width & height of the square
}

export default function ImagePicker({ projectDir, value, onChange, label, size = 100 }: Props) {
  const [loading, setLoading] = useState(false)
  const url = useAssetUrl(projectDir, value)

  const handleClick = async () => {
    const picked = await window.electronAPI.pickImage()
    if (!picked) return
    setLoading(true)
    try {
      const relativePath = await window.electronAPI.importImage(picked, projectDir)
      onChange(relativePath)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Tooltip title={value ? 'Click to change image' : 'Click to add image'}>
      <Box
        onClick={handleClick}
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          border: '2px dashed',
          borderColor: value ? 'primary.dark' : 'rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          background: value ? 'transparent' : 'rgba(255,255,255,0.02)',
          transition: 'border-color 0.15s, background 0.15s',
          flexShrink: 0,
          '&:hover': {
            borderColor: 'primary.main',
            background: 'rgba(110,231,183,0.04)',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : url ? (
          <>
            <Box
              component="img"
              src={url}
              alt={label ?? 'asset'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Clear button overlay */}
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '2px',
                '&:hover': { background: 'rgba(248,113,113,0.8)' },
              }}
            >
              <ClearIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </>
        ) : (
          <>
            <AddPhotoAlternateIcon sx={{ fontSize: size * 0.32, color: 'rgba(255,255,255,0.25)' }} />
            {label && (
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.65rem',
                  mt: 0.5,
                  textAlign: 'center',
                  px: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {label}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Tooltip>
  )
}
