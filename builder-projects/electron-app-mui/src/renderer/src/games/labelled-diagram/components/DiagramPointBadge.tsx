import { Box, IconButton, InputBase, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { motion, useMotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Delete, FilterCenterFocus } from '@mui/icons-material'
import { LabelledDiagramPoint } from '../../../types'
import { POINT_COLORS } from './PointsSidebar'

interface Props {
  point: LabelledDiagramPoint
  index: number
  isFocused: boolean
  imgSize: { width: number; height: number }
  transform: { x: number; y: number; scale: number }
  onMove: (id: string, x: number, y: number) => void
  onFocus: (id: string) => void
  onUpdateText: (text: string) => void
  onDelete: () => void
  onScrollToSidebar: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export default function DiagramPointBadge({ 
  point,
  index, 
  isFocused, 
  imgSize,
  transform,
  onMove, 
  onFocus,
  onUpdateText,
  onDelete,
  onScrollToSidebar,
  onDragStart,
  onDragEnd
}: Props) {
  const [popoverPos, setPopoverPos] = useState<'top' | 'bottom'>('top')
  const [popoverAlign, setPopoverAlign] = useState<'center' | 'left' | 'right'>('center')
  const badgeRef = useRef<HTMLDivElement>(null)

  const color = POINT_COLORS[index % POINT_COLORS.length]

  // Calculate pixel position relative to editor container
  const posX = (point.x / 100) * imgSize.width * transform.scale + transform.x
  const posY = (point.y / 100) * imgSize.height * transform.scale + transform.y

  const mX = useMotionValue(0)
  const mY = useMotionValue(0)

  useEffect(() => {
    mX.set(0)
    mY.set(0)
  }, [point.x, point.y, transform.x, transform.y, transform.scale, mX, mY])

  // Flip logic
  useEffect(() => {
    if (isFocused && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      const parent = badgeRef.current.closest('.labelled-diagram-editor')
      if (!parent) return
      
      const pRect = parent.getBoundingClientRect()
      
      // Vertical flip
      if (rect.top - 120 < pRect.top) {
        setPopoverPos('bottom')
      } else {
        setPopoverPos('top')
      }

      // Horizontal align
      if (rect.left - 100 < pRect.left) {
        setPopoverAlign('left')
      } else if (rect.right + 100 > pRect.right) {
        setPopoverAlign('right')
      } else {
        setPopoverAlign('center')
      }
    }
  }, [isFocused, posX, posY])

  const handleDragEnd = (_event: any, info: any) => {
    const parent = badgeRef.current?.closest('.labelled-diagram-editor')
    if (!parent) return
    
    const rect = parent.querySelector('.labelled-diagram-editor-canvas img')?.getBoundingClientRect()
    if (!rect) return
    
    const dropX = info.point.x - rect.left
    const dropY = info.point.y - rect.top
    
    const nextX = (dropX / rect.width) * 100
    const nextY = (dropY / rect.height) * 100
    
    onMove(point.id, Math.max(0, Math.min(100, nextX)), Math.max(0, Math.min(100, nextY)))
    onDragEnd()
    mX.set(0)
    mY.set(0)
  }

  const TargetLock = useMemo(() => (
    <Box
      sx={{
        position: 'absolute',
        inset: -14,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'rotateLock 15s linear infinite',
        '@keyframes rotateLock': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      }}
    >
      {[
        { t: 0, l: 0, r: 'auto', b: 'auto', rot: 0, br: '0 0 3px 0' },
        { t: 0, r: 0, l: 'auto', b: 'auto', rot: 90, br: '0 0 3px 0' },
        { b: 0, r: 0, t: 'auto', l: 'auto', rot: 180, br: '0 0 3px 0' },
        { b: 0, l: 0, t: 'auto', r: 'auto', rot: 270, br: '0 0 3px 0' }
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: pos.t,
            left: pos.l,
            right: pos.r,
            bottom: pos.b,
            width: 8,
            height: 8,
            borderRight: `3px solid ${color}`,
            borderBottom: `3px solid ${color}`,
            borderRadius: pos.br,
            transform: `rotate(${pos.rot}deg)`,
            animation: 'lockPulse 3s ease-in-out infinite',
            '@keyframes lockPulse': {
              '0%, 100%': { opacity: 0.7, transform: `rotate(${pos.rot}deg) translate(0, 0)` },
              '50%': { opacity: 1, transform: `rotate(${pos.rot}deg) translate(-3px, -3px)` }
            }
          }}
        />
      ))}
    </Box>
  ), [color])

  if (point.isHidden) return null

  return (
    <Box
      ref={badgeRef}
      sx={{
        position: 'absolute',
        left: posX,
        top: posY,
        transform: 'translate(-50%, -50%)',
        zIndex: isFocused ? 10 : 5,
        pointerEvents: 'auto'
      }}
      className="labelled-diagram-point-badge"
    >
      <motion.div
        drag={isFocused}
        dragMomentum={false}
        onDragStart={() => {
          onFocus(point.id)
          onDragStart()
        }}
        onDragEnd={handleDragEnd}
        style={{ x: mX, y: mY, position: 'relative' }}
        onPointerDown={(e) => {
          e.stopPropagation()
          onFocus(point.id)
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: isFocused ? `0 0 15px ${color}80` : '0 4px 8px rgba(0,0,0,0.3)',
            border: '2px solid white',
            cursor: isFocused ? 'grab' : 'pointer',
            userSelect: 'none',
            zIndex: 2,
            position: 'relative'
          }}
        >
          {index + 1}
        </Box>
        
        {isFocused && TargetLock}

        {isFocused && (
          <Paper
            elevation={12}
            sx={{
              position: 'absolute',
              ...(popoverPos === 'top' ? { bottom: 'calc(100% + 18px)' } : { top: 'calc(100% + 18px)' }),
              ...(popoverAlign === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : 
                  popoverAlign === 'left' ? { left: 0 } : { right: 0 }),
              p: '6px 10px',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              whiteSpace: 'nowrap',
              zIndex: 20
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <InputBase
              autoFocus
              size="small"
              value={point.text}
              onChange={(e) => onUpdateText(e.target.value)}
              sx={{ color: '#fff', fontSize: '0.85rem', width: 120 }}
              placeholder="Label..."
            />
            <Stack direction="row" spacing={0.25}>
              <Tooltip title="Scroll to in sidebar">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onScrollToSidebar(); }}>
                  <FilterCenterFocus sx={{ fontSize: 18, color: 'primary.main' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <Delete sx={{ fontSize: 18, color: 'error.main' }} />
                </IconButton>
              </Tooltip>
            </Stack>
            
            <Box
              sx={{
                position: 'absolute',
                ...(popoverPos === 'top' ? { top: '100%', borderTop: '8px solid rgba(30,30,30,0.95)' } : { bottom: '100%', borderBottom: '8px solid rgba(30,30,30,0.95)' }),
                ...(popoverAlign === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : 
                    popoverAlign === 'left' ? { left: 16 } : { right: 16 }),
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent'
              }}
            />
          </Paper>
        )}
      </motion.div>
    </Box>
  )
}
