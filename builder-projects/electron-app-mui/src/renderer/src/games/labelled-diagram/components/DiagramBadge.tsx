import { Box } from '@mui/material'
import React from 'react'
import { LabelledDiagramPoint } from '../../../types'
import { getBadgeColor, hoverBadgePulse, SelectedBadgeOutline, DIAGRAM_PADDING } from '../styles'

interface DiagramBadgeProps {
  point: LabelledDiagramPoint
  index: number
  isSelected: boolean
  isHovered: boolean
  imgWidth: number
  imgHeight: number
  scale: number
  positionX: number
  positionY: number
}

/**
 * Visual badge representing a point on the diagram.
 * Renders at specific coordinates translated from percentage to pixels based on current transform.
 */
export const DiagramBadge: React.FC<DiagramBadgeProps> = ({
  point,
  index,
  isSelected,
  isHovered,
  imgWidth,
  imgHeight,
  scale,
  positionX,
  positionY
}) => {
  const left = ((point.xPercent / 100) * imgWidth + DIAGRAM_PADDING) * scale + positionX
  const top = ((point.yPercent / 100) * imgHeight + DIAGRAM_PADDING) * scale + positionY

  return (
    <Box key={point.id}>
      {isSelected && <SelectedBadgeOutline sx={{ left, top }} />}
      <Box
        sx={{
          position: 'absolute',
          left,
          top,
          animation: isHovered ? `${hoverBadgePulse} 1s ease-in-out infinite` : 'none',
          transform: 'translate(-50%, -50%)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: getBadgeColor(index),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          boxShadow: isSelected ? '0 0 15px white' : '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid white',
          pointerEvents: 'none',
          zIndex: isSelected ? 11 : 10,
          cursor: isSelected ? 'grab' : 'pointer'
        }}
      >
        {index + 1}
      </Box>
    </Box>
  )
}
