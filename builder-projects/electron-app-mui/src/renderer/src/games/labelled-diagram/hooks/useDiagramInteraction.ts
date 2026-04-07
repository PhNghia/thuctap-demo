import { LabelledDiagramAppData, LabelledDiagramPoint } from '@renderer/types'
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { DIAGRAM_PADDING } from '../styles'

interface UseDiagramInteractionProps {
  appData: LabelledDiagramAppData
  localPoints: LabelledDiagramPoint[]
  imgSize: { width: number; height: number } | null
  selectedPointId: string | null
  setSelectedPointId: (id: string | null) => void
  draggingPointId: string | null
  setDraggingPointId: (id: string | null) => void
  addPoint: (xPercent: number, yPercent: number, onComplete: (id: string) => void) => void
  updatePoint: (id: string, patch: Partial<LabelledDiagramPoint>, commit?: boolean) => void
  onChange: (data: LabelledDiagramAppData) => void
}

export interface UseDiagramInteractionReturn {
  transform: { scale: number; positionX: number; positionY: number } | null
  setTransform: (transform: { scale: number; positionX: number; positionY: number } | null) => void
  hoveredPointId: string | null
  transformRef: React.RefObject<ReactZoomPanPinchRef | null>
  imgRef: React.RefObject<HTMLImageElement | null>
  wrapperRef: React.RefObject<HTMLDivElement | null>
  moveToPoint: (point: LabelledDiagramPoint) => void
  handleInteraction: (e: MouseEvent, type: 'click' | 'doubleClick' | 'mouseDown') => void
}

/**
 * Hook to manage complex canvas interactions like dragging, selecting, and hovering.
 * Now takes state and setters from the parent to avoid circular dependencies.
 */
export function useDiagramInteraction({
  appData,
  localPoints,
  imgSize,
  selectedPointId,
  setSelectedPointId,
  draggingPointId,
  setDraggingPointId,
  addPoint,
  updatePoint,
  onChange
}: UseDiagramInteractionProps): UseDiagramInteractionReturn {
  const [transform, setTransform] = useState<{
    scale: number
    positionX: number
    positionY: number
  } | null>(null)

  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)
  const [pendingSelectedPointId, setPendingSelectedPointId] = useState<string | null>(null)
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null)

  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const getMousePosOnImage = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!imgSize || !transform) return null
      const { scale, positionX, positionY } = transform
      const { width: imgWidth, height: imgHeight } = imgSize

      // Local distance from top-left of the padded container
      const containerLocalX = (mouseX - positionX) / scale
      const containerLocalY = (mouseY - positionY) / scale

      // Translate to image surface by subtracting padding
      const imgLocalX = containerLocalX - DIAGRAM_PADDING
      const imgLocalY = containerLocalY - DIAGRAM_PADDING

      let xPercent = (imgLocalX / imgWidth) * 100
      let yPercent = (imgLocalY / imgHeight) * 100

      // Clamp - ensures points added in padding area snap to edges
      xPercent = Math.max(0, Math.min(100, xPercent))
      yPercent = Math.max(0, Math.min(100, yPercent))

      return { xPercent, yPercent }
    },
    [imgSize, transform]
  )

  const moveToPoint = useCallback(
    (point: LabelledDiagramPoint) => {
      if (!transformRef.current || !imgRef.current) return

      const { scale } = transformRef.current.instance.transformState
      const imgWidth = imgRef.current.offsetWidth
      const imgHeight = imgRef.current.offsetHeight

      // Pixels relative to image surface
      const targetXInImage = (point.xPercent / 100) * imgWidth
      const targetYInImage = (point.yPercent / 100) * imgHeight

      // Pixels relative to padded container
      const targetXInContainer = targetXInImage + DIAGRAM_PADDING
      const targetYInContainer = targetYInImage + DIAGRAM_PADDING

      const wrapperWidth = wrapperRef.current?.offsetWidth ?? 0
      const wrapperHeight = wrapperRef.current?.offsetHeight ?? 0

      const posX = wrapperWidth / 2 - targetXInContainer * scale
      const posY = wrapperHeight / 2 - targetYInContainer * scale

      transformRef.current.setTransform(posX, posY, scale)
      setSelectedPointId(point.id)
    },
    [setSelectedPointId]
  )

  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!wrapperRef.current || !imgSize) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const { scale, positionX, positionY } = transform || { scale: 1, positionX: 0, positionY: 0 }
      const { width: imgWidth, height: imgHeight } = imgSize

      let foundHoveredId: string | null = null
      localPoints.forEach((p) => {
        // Point is (xPercent, yPercent) in image context. Translate to container context first.
        const badgeXInContainer = (p.xPercent / 100) * imgWidth + DIAGRAM_PADDING
        const badgeYInContainer = (p.yPercent / 100) * imgHeight + DIAGRAM_PADDING

        // Then translate to absolute viewport context using transform
        const badgeX = badgeXInContainer * scale + positionX
        const badgeY = badgeYInContainer * scale + positionY

        const dist = Math.sqrt((mouseX - badgeX) ** 2 + (mouseY - badgeY) ** 2)
        if (dist < 25) foundHoveredId = p.id
      })
      setHoveredPointId(foundHoveredId)

      if (!draggingPointId) return

      const pos = getMousePosOnImage(mouseX, mouseY)
      if (pos) {
        updatePoint(draggingPointId, pos, false)
      }
    },
    [draggingPointId, transform, localPoints, updatePoint, imgSize, getMousePosOnImage]
  )

  const handleMouseUp = useCallback(
    (e: globalThis.MouseEvent) => {
      if (mouseDownPos) {
        const dx = Math.abs(e.clientX - mouseDownPos.x)
        const dy = Math.abs(e.clientY - mouseDownPos.y)
        if (dx < 5 && dy < 5) {
          setSelectedPointId(pendingSelectedPointId)
        }
      }

      if (draggingPointId) {
        onChange({
          ...appData,
          points: localPoints
        })
      }
      setDraggingPointId(null)
      setMouseDownPos(null)
      setPendingSelectedPointId(null)
    },
    [
      draggingPointId,
      appData,
      localPoints,
      onChange,
      mouseDownPos,
      pendingSelectedPointId,
      setSelectedPointId,
      setDraggingPointId
    ]
  )

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleInteraction = useCallback(
    (e: MouseEvent, type: 'click' | 'doubleClick' | 'mouseDown') => {
      if (!imgRef.current || !wrapperRef.current || !imgSize) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const { scale, positionX, positionY } = transform || { scale: 1, positionX: 0, positionY: 0 }
      const { width: imgWidth, height: imgHeight } = imgSize

      if (type === 'mouseDown') {
        setMouseDownPos({ x: e.clientX, y: e.clientY })

        let foundPointId: string | null = null
        localPoints.forEach((p) => {
          // Translate image coord to container coord
          const badgeXInContainer = (p.xPercent / 100) * imgWidth + DIAGRAM_PADDING
          const badgeYInContainer = (p.yPercent / 100) * imgHeight + DIAGRAM_PADDING

          // Translate to absolute viewport coord
          const badgeX = badgeXInContainer * scale + positionX
          const badgeY = badgeYInContainer * scale + positionY

          const dist = Math.sqrt((clickX - badgeX) ** 2 + (clickY - badgeY) ** 2)
          if (dist < 25) {
            foundPointId = p.id
          }
        })

        if (foundPointId) {
          if (foundPointId === selectedPointId) {
            setDraggingPointId(foundPointId)
            e.preventDefault()
            e.stopPropagation()
          } else {
            setPendingSelectedPointId(foundPointId)
          }
        } else {
          setPendingSelectedPointId(null)
        }
        return
      }

      if (type === 'doubleClick') {
        const pos = getMousePosOnImage(clickX, clickY)
        if (pos) {
          addPoint(pos.xPercent, pos.yPercent, setSelectedPointId)
        }
        return
      }
    },
    [
      imgSize,
      transform,
      localPoints,
      selectedPointId,
      getMousePosOnImage,
      addPoint,
      setSelectedPointId,
      setDraggingPointId
    ]
  )

  return {
    transform,
    setTransform,
    hoveredPointId,
    transformRef,
    imgRef,
    wrapperRef,
    moveToPoint,
    handleInteraction
  }
}
