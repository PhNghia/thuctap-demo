import { Add, Delete, EditLocationAlt, FilterCenterFocus, Visibility, VisibilityOff } from '@mui/icons-material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Box,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LabelledDiagramPoint } from '../../../types'

interface Props {
  points: LabelledDiagramPoint[]
  onAddPoint: () => void
  onUpdatePoint: (id: string, patch: Partial<LabelledDiagramPoint>) => void
  onDeletePoint: (id: string) => void
  onFocusPoint: (point: LabelledDiagramPoint) => void
  focusedPointId?: string
  viewablePointIds: string[]
  imgSize: { width: number; height: number }
}

export const POINT_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316'  // orange
]


export default function PointsSidebar({
  points,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onFocusPoint,
  focusedPointId,
  viewablePointIds,
  imgSize
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [absPosAnchor, setAbsPosAnchor] = useState<{ el: HTMLButtonElement; point: LabelledDiagramPoint } | null>(null)

  const handleOpenAbsPos = (e: React.MouseEvent<HTMLButtonElement>, p: LabelledDiagramPoint) => {
    setAbsPosAnchor({ el: e.currentTarget, point: p })
  }

  return (
    <>
      {/* FAB Toggle */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            style={{ position: 'absolute', left: 16, top: 16, zIndex: 100 }}
          >
            <Tooltip title="Open Points Panel" placement="right">
              <Fab color="primary" size="medium" onClick={() => setIsCollapsed(false)}>
                <ChevronRightIcon />
              </Fab>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
              bottom: 16,
              zIndex: 90,
              width: 320,
              pointerEvents: 'auto'
            }}
          >
            <Paper
              elevation={4}
              sx={{
                width: '100%',
                height: '100%',
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 3
              }}
            >
              {/* Header */}
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5, flex: 1 }}>
                  POINTS ({points.length})
                </Typography>
                <Tooltip title="Add New Point">
                   <IconButton color="primary" size="small" onClick={onAddPoint}>
                     <Add />
                   </IconButton>
                </Tooltip>
                <IconButton size="small" onClick={() => setIsCollapsed(true)}>
                  <ChevronLeftIcon />
                </IconButton>
              </Box>

              {/* List */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                <Stack spacing={1.5}>
                  {points.map((p, index) => {
                    const color = POINT_COLORS[index % POINT_COLORS.length]
                    const isFocused = p.id === focusedPointId
                    const isViewable = viewablePointIds.includes(p.id)

                    return (
                      <Box
                        key={p.id}
                        id={`point-entry-${p.id}`}
                        onClick={() => onFocusPoint(p)}
                        sx={{
                          p: 1.25,
                          cursor: 'pointer',
                          borderRadius: 2.5,
                          background: isFocused 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : isViewable 
                              ? 'rgba(255, 255, 255, 0.08)' 
                              : 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid',
                          borderColor: isFocused ? 'primary.main' : 'rgba(255,255,255,0.05)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          animation: isFocused ? 'flashSidebar 1.5s infinite' : 'none',
                          '@keyframes flashSidebar': {
                            '0%, 100%': { boxShadow: '0 0 0px transparent', background: 'rgba(255, 255, 255, 0.15)' },
                            '50%': { boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.25)' }
                          },
                          '&:hover': { background: 'rgba(255, 255, 255, 0.12)', transform: 'translateX(4px)' }
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          {/* Badge */}
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              flexShrink: 0,
                              boxShadow: isFocused ? `0 0 8px ${color}` : 'none'
                            }}
                          >
                            {index + 1}
                          </Box>

                          {/* Info Area (Text and coordinates) */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <InputBase
                              size="small"
                              value={p.text}
                              onChange={(e) => onUpdatePoint(p.id, { text: e.target.value })}
                              onClick={(e) => e.stopPropagation()} // Prevent focus overlap
                              placeholder="Label..."
                              sx={{
                                width: '100%',
                                fontSize: '0.9rem',
                                color: p.isHidden ? 'text.disabled' : 'text.primary',
                                textDecoration: p.isHidden ? 'line-through' : 'none',
                                fontWeight: isFocused ? 600 : 400
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                              {Math.round(p.x)}% / {Math.round(p.y)}%
                            </Typography>
                          </Box>

                          {/* Actions */}
                          <Stack direction="row" spacing={0.25} onClick={(e) => e.stopPropagation()}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onUpdatePoint(p.id, { isHidden: !p.isHidden }); }}>
                              {p.isHidden ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                            <Tooltip title="Absolute Positioning">
                              <IconButton size="small" onClick={(e) => handleOpenAbsPos(e, p)}>
                                <EditLocationAlt sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Follow on image">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAbsPosAnchor(null); /* and other focus logic if needed */ }}>
                                <FilterCenterFocus sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeletePoint(p.id); }}>
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popover for Absolute Position */}
      <Popover
        open={Boolean(absPosAnchor)}
        anchorEl={absPosAnchor?.el}
        onClose={() => setAbsPosAnchor(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              ml: 2,
              p: 2,
              width: 280,
              background: 'rgba(25, 25, 25, 0.98)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }
          }
        }}
      >
        {absPosAnchor && (
          <AbsolutePositionForm 
            point={absPosAnchor.point}
            imgSize={imgSize}
            onUpdatePoint={onUpdatePoint}
          />
        )}
      </Popover>
    </>
  )
}

function AbsolutePositionForm({ 
  point, 
  imgSize, 
  onUpdatePoint 
}: { 
  point: LabelledDiagramPoint, 
  imgSize: { width: number, height: number },
  onUpdatePoint: (id: string, patch: Partial<LabelledDiagramPoint>) => void
}) {
  const [localX, setLocalX] = useState(point.x.toString())
  const [localY, setLocalY] = useState(point.y.toString())
  const [localPxX, setLocalPxX] = useState(Math.round((point.x / 100) * imgSize.width).toString())
  const [localPxY, setLocalPxY] = useState(Math.round((point.y / 100) * imgSize.height).toString())

  useEffect(() => {
    setLocalX(point.x.toFixed(2))
    setLocalY(point.y.toFixed(2))
    setLocalPxX(Math.round((point.x / 100) * imgSize.width).toString())
    setLocalPxY(Math.round((point.y / 100) * imgSize.height).toString())
  }, [point, imgSize])

  const validateAndSave = (type: 'x' | 'y' | 'pxX' | 'pxY', val: string) => {
    const num = parseFloat(val)
    
    if (isNaN(num) || num < 0) {
      // Revert local state to current point values
      if (type === 'x' || type === 'pxX') {
          setLocalX(point.x.toFixed(2))
          setLocalPxX(Math.round((point.x / 100) * imgSize.width).toString())
      } else {
          setLocalY(point.y.toFixed(2))
          setLocalPxY(Math.round((point.y / 100) * imgSize.height).toString())
      }
      return
    }

    if (type === 'x' || type === 'pxX') {
      const finalPct = type === 'x' ? num : (num / imgSize.width) * 100
      onUpdatePoint(point.id, { x: Math.max(0, Math.min(100, finalPct)) })
    } else {
      const finalPct = type === 'y' ? num : (num / imgSize.height) * 100
      onUpdatePoint(point.id, { y: Math.max(0, Math.min(100, finalPct)) })
    }
  }

  const handlePctChange = (axis: 'x' | 'y', val: string) => {
    if (axis === 'x') {
      setLocalX(val)
      const num = parseFloat(val)
      if (!isNaN(num)) setLocalPxX(Math.round((num / 100) * imgSize.width).toString())
    } else {
      setLocalY(val)
      const num = parseFloat(val)
      if (!isNaN(num)) setLocalPxY(Math.round((num / 100) * imgSize.height).toString())
    }
  }

  const handlePxChange = (axis: 'x' | 'y', val: string) => {
    if (axis === 'x') {
      setLocalPxX(val)
      const num = parseFloat(val)
      if (!isNaN(num)) setLocalX(((num / imgSize.width) * 100).toFixed(2))
    } else {
      setLocalPxY(val)
      const num = parseFloat(val)
      if (!isNaN(num)) setLocalY(((num / imgSize.height) * 100).toFixed(2))
    }
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditLocationAlt fontSize="small" /> Manual Adjustment
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 16 }}>X:</Typography>
        <InputBase
          size="small"
          value={localX}
          onChange={(e) => handlePctChange('x', e.target.value)}
          onBlur={(e) => validateAndSave('x', e.target.value)}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.8, py: 0.2, borderRadius: 1, color: '#fff', fontSize: '0.8rem' }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>% or</Typography>
        <InputBase
          size="small"
          value={localPxX}
          onChange={(e) => handlePxChange('x', e.target.value)}
          onBlur={(e) => validateAndSave('pxX', e.target.value)}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.8, py: 0.2, borderRadius: 1, color: '#fff', fontSize: '0.8rem' }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>px</Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 16 }}>Y:</Typography>
        <InputBase
          size="small"
          value={localY}
          onChange={(e) => handlePctChange('y', e.target.value)}
          onBlur={(e) => validateAndSave('y', e.target.value)}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.8, py: 0.2, borderRadius: 1, color: '#fff', fontSize: '0.8rem' }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>% or</Typography>
        <InputBase
          size="small"
          value={localPxY}
          onChange={(e) => handlePxChange('y', e.target.value)}
          onBlur={(e) => validateAndSave('pxY', e.target.value)}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', px: 0.8, py: 0.2, borderRadius: 1, color: '#fff', fontSize: '0.8rem' }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>px</Typography>
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
        Point {point.id} (Image size: {imgSize.width}x{imgSize.height})
      </Typography>
    </Stack>
  )
}
