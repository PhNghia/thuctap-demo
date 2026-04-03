import { Box } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { LabelledDiagramPoint } from '../../../types'

interface ImageViewerProps {
  imagePath: string
  projectDir: string
  points: LabelledDiagramPoint[]
  selectedPointId: string | null
  onImageClick: (xPercent: number, yPercent: number) => void
  onPointDrag: (id: string, xPercent: number, yPercent: number) => void
  getPointColor: (index: number) => { bg: string; text: string }
}

interface DraggablePointProps {
  point: LabelledDiagramPoint
  index: number
  isSelected: boolean
  getPointColor: (index: number) => { bg: string; text: string }
  onDrag: (id: string, xPercent: number, yPercent: number) => void
  onSelect: (id: string) => void
}

function DraggablePoint({
  point,
  index,
  isSelected,
  getPointColor,
  onDrag,
  onSelect
}: DraggablePointProps): React.ReactElement {
  const pointRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ screenX: 0, screenY: 0, pointX: 0, pointY: 0 })
  const pointColor = getPointColor(index)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      
      setIsDragging(true)
      dragStartRef.current = {
        screenX: e.clientX,
        screenY: e.clientY,
        pointX: point.xPercent,
        pointY: point.yPercent
      }
      onSelect(point.id)
    },
    [point.id, point.xPercent, point.yPercent, onSelect]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      
      // Get the transform wrapper element to calculate percentages
      const wrapper = pointRef.current?.closest('.react-transform-wrapper')
      if (!wrapper) return

      const contentRect = wrapper.querySelector('.react-transform-component')?.getBoundingClientRect()
      if (!contentRect) return

      // Calculate the position within the scaled/panned content
      const relativeX = (e.clientX - contentRect.left) / contentRect.width
      const relativeY = (e.clientY - contentRect.top) / contentRect.height

      // Convert to percentage (0-100)
      const newPercentX = Math.max(0, Math.min(100, relativeX * 100))
      const newPercentY = Math.max(0, Math.min(100, relativeY * 100))

      onDrag(point.id, newPercentX, newPercentY)
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleMouseUp, { passive: false })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, point.id, onDrag])

  return (
    <div
      ref={pointRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${point.xPercent}%`,
        top: `${point.yPercent}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging || isSelected ? 1000 : 100,
        transition: isDragging ? 'none' : 'box-shadow 0.2s'
      }}
    >
      {/* Point Badge */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: pointColor.bg,
          color: pointColor.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: isDragging || isSelected
            ? '0 0 0 3px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.4)'
            : '0 2px 6px rgba(0,0,0,0.4)',
          border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)',
          userSelect: 'none',
          position: 'relative'
        }}
      >
        {index + 1}
      </Box>

      {/* Label tooltip */}
      {point.text && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            mt: 0.5,
            px: 1,
            py: 0.5,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: '#fff',
            borderRadius: 1,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {point.text}
        </Box>
      )}
    </div>
  )
}

export function ImageViewer({
  imagePath,
  projectDir,
  points,
  selectedPointId,
  onImageClick,
  onPointDrag,
  getPointColor
}: ImageViewerProps): React.ReactElement {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState<string>('')

  // Resolve the asset URL
  useEffect(() => {
    let mounted = true
    const loadUrl = async () => {
      try {
        const url = await window.electronAPI.resolveAssetUrl(projectDir, imagePath)
        if (mounted) {
          setImageUrl(url)
        }
      } catch (error) {
        console.error('Failed to resolve asset URL:', error)
      }
    }
    loadUrl()
    return () => {
      mounted = false
    }
  }, [projectDir, imagePath])

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    // Image loaded successfully
  }, [])

  // Handle click on the image to add a new point
  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't add point if clicking on an existing point
      if ((e.target as HTMLElement).closest('.draggable-point')) {
        return
      }

      const wrapper = e.currentTarget.closest('.react-transform-wrapper')
      if (!wrapper) return

      const content = wrapper.querySelector('.react-transform-component')
      if (!content) return

      const contentRect = content.getBoundingClientRect()

      // Calculate the position within the scaled/panned content
      const relativeX = (e.clientX - contentRect.left) / contentRect.width
      const relativeY = (e.clientY - contentRect.top) / contentRect.height

      // Convert to percentage (0-100)
      const xPercent = Math.max(0, Math.min(100, relativeX * 100))
      const yPercent = Math.max(0, Math.min(100, relativeY * 100))

      onImageClick(xPercent, yPercent)
    },
    [onImageClick]
  )

  return (
    <TransformWrapper
      ref={transformComponentRef}
      initialScale={1}
      minScale={0.1}
      maxScale={5}
      centerOnInit
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      panning={{
        excluded: ['input', 'textarea'],
        velocityDisabled: true
      }}
      wheel={{
        step: 0.1,
        disabled: false
      }}
    >
      <TransformComponent
        wrapperStyle={{
          width: '100%',
          height: '100%',
          cursor: 'default'
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block'
          }}
        >
          {/* The Image */}
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Diagram"
              onLoad={handleImageLoad}
              onClick={handleImageClick}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'auto'
              }}
            />
          )}

          {/* Points Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {points.map((point, index) => (
              <div
                key={point.id}
                className="draggable-point"
                style={{ pointerEvents: 'auto' }}
              >
                <DraggablePoint
                  point={point}
                  index={index}
                  isSelected={point.id === selectedPointId}
                  getPointColor={getPointColor}
                  onDrag={onPointDrag}
                  onSelect={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}
