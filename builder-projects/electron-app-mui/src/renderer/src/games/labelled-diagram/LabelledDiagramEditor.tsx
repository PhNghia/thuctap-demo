import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography
} from '@mui/material'
import { Add, DeleteForever, PhotoSizeSelectActual, Reorder } from '@mui/icons-material'
import { useCallback, useRef, useState } from 'react'
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImagePicker from '../../components/ImagePicker'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { LabelledDiagramAppData, LabelledDiagramPoint } from '../../types'
import { DiagramPointBadge, PointsSidebar } from './components'

interface Props {
  appData: LabelledDiagramAppData
  projectDir: string
  onChange: (data: LabelledDiagramAppData) => void
}

function normalize(d: LabelledDiagramAppData): LabelledDiagramAppData {
  return {
    ...d,
    _pointCounter: d._pointCounter ?? 0,
    points: d.points ?? []
  }
}

export default function LabelledDiagramEditor({
  appData: raw,
  projectDir,
  onChange
}: Props): React.ReactElement {
  const data = normalize(raw)
  const { imagePath, points } = data
  const { data: imageUrl } = useAssetUrl(projectDir, imagePath)
  
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const [focusedPointId, setFocusedPointId] = useState<string | undefined>(undefined)
  const [isDraggingPoint, setIsDraggingPoint] = useState(false)

  const [isConfirmingImageChange, setIsConfirmingImageChange] = useState(false)
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null)
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false)
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const updatePoint = useCallback((id: string, patch: Partial<LabelledDiagramPoint>) => {
    onChange({
      ...data,
      points: points.map(p => p.id === id ? { ...p, ...patch } : p)
    })
  }, [data, points, onChange])

  const deletePoint = useCallback((id: string) => {
    onChange({
      ...data,
      points: points.filter(p => p.id !== id)
    })
    if (focusedPointId === id) setFocusedPointId(undefined)
    setSnackbar({ open: true, message: 'Point deleted' })
  }, [data, points, focusedPointId, onChange])

  const handleAddPoint = useCallback(() => {
    const id = `pt_${Date.now()}`
    const newPoint: LabelledDiagramPoint = {
      id,
      text: `Point ${data._pointCounter + 1}`,
      x: 50,
      y: 50
    }
    onChange({
      ...data,
      _pointCounter: data._pointCounter + 1,
      points: [...points, newPoint]
    })
    setFocusedPointId(id)
    setSnackbar({ open: true, message: 'New point added' })
  }, [data, points, onChange])

  const handleTransform = useCallback(() => {
    // Force re-render of points with new transform
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.labelled-diagram-point-badge')) return
    setFocusedPointId(undefined)
  }, [])

  const handleImageSelected = useCallback((path: string | null) => {
    if (!path) return
    if (imagePath && points.length > 0) {
      setPendingImagePath(path)
      setIsConfirmingImageChange(true)
    } else {
      onChange({ ...data, imagePath: path })
    }
  }, [imagePath, points, data, onChange])

  const confirmImageChange = () => {
    if (pendingImagePath) {
      onChange({ ...data, imagePath: pendingImagePath })
      setPendingImagePath(null)
    }
    setIsConfirmingImageChange(false)
  }

  const handleDeleteAll = () => {
    onChange({ ...data, points: [] })
    setIsConfirmingDeleteAll(false)
    setFocusedPointId(undefined)
    setSnackbar({ open: true, message: 'All points cleared' })
  }

  const handlePanning = useCallback((ref: ReactZoomPanPinchRef) => {
    if (!contentRef.current) return
    const { positionX, positionY, scale } = ref.instance.transformState
    const viewport = contentRef.current.closest('.labelled-diagram-editor-canvas')
    if (!viewport) return
    
    const vW = viewport.clientWidth
    const vH = viewport.clientHeight
    const imgW = imgSize.width * scale
    const imgH = imgSize.height * scale
    
    let newX = positionX
    let newY = positionY
    
    const minX = (vW / 2) - imgW
    const maxX = vW / 2
    const minY = (vH / 2) - imgH
    const maxY = vH / 2
    
    if (newX < minX) newX = minX
    if (newX > maxX) newX = maxX
    if (newY < minY) newY = minY
    if (newY > maxY) newY = maxY
    
    if (newX !== positionX || newY !== positionY) {
      ref.setTransform(newX, newY, scale, 0)
    }
  }, [imgSize])

  return (
    <Box 
      sx={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}
      onContextMenu={(e) => e.preventDefault()}
      className="labelled-diagram-editor"
    >
      <PointsSidebar
        points={points}
        focusedPointId={focusedPointId}
        onAddPoint={handleAddPoint}
        onUpdatePoint={updatePoint}
        onDeletePoint={deletePoint}
        onFocusPoint={(p) => setFocusedPointId(p.id)}
        viewablePointIds={[]}
        imgSize={imgSize}
      />

      <Box
        className="labelled-diagram-editor-canvas"
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1a1a1a',
          backgroundImage: `
            linear-gradient(45deg, #222 25%, transparent 25%),
            linear-gradient(-45deg, #222 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #222 75%),
            linear-gradient(-45deg, transparent 75%, #222 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
      >
        {!imageUrl ? (
          <Box sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
            <PhotoSizeSelectActual sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
              Select an image to begin
            </Typography>
            <ImagePicker
              value={imagePath}
              onChange={handleImageSelected}
              projectDir={projectDir}
              desiredNamePrefix="diagram"
            />
          </Box>
        ) : (
          <>
            <TransformWrapper 
              ref={transformRef}
              centerOnInit 
              minScale={0.1} 
              maxScale={5}
              doubleClick={{ disabled: true }}
              panning={{ 
                disabled: isDraggingPoint,
                velocityDisabled: true
              }}
              limitToBounds={false}
              onPanning={handlePanning}
              onTransformed={handleTransform}
              onInit={handleTransform}
            >
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <Box 
                  ref={contentRef}
                  sx={{ position: 'relative', display: 'inline-block' }}
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Diagram"
                    style={{ display: 'block', maxWidth: 'none' }}
                    onLoad={(e) => {
                      const img = e.currentTarget
                      setImgSize({ width: img.naturalWidth, height: img.naturalHeight })
                    }}
                  />
                </Box>
              </TransformComponent>
            </TransformWrapper>

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 100
              }}
            >
              {points.map((p, index) => (
                <DiagramPointBadge
                  key={p.id}
                  point={p}
                  index={index}
                  isFocused={p.id === focusedPointId}
                  imgSize={imgSize}
                  transform={{
                    x: transformRef.current?.instance.transformState.positionX ?? 0,
                    y: transformRef.current?.instance.transformState.positionY ?? 0,
                    scale: transformRef.current?.instance.transformState.scale ?? 1
                  }}
                  onMove={(id, x, y) => updatePoint(id, { x, y })}
                  onFocus={(id) => setFocusedPointId(id)}
                  onUpdateText={(text) => updatePoint(p.id, { text })}
                  onDelete={() => deletePoint(p.id)}
                  onScrollToSidebar={() => {
                    const el = document.getElementById(`point-entry-${p.id}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  onDragStart={() => setIsDraggingPoint(true)}
                  onDragEnd={() => setIsDraggingPoint(false)}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 200 }}>
        <SpeedDial
          ariaLabel="Editor Controls"
          icon={<SpeedDialIcon />}
          sx={{ '& .MuiFab-primary': { bgcolor: 'primary.main' } }}
        >
          <SpeedDialAction
            icon={<Add />}
            tooltipTitle="Add Point"
            onClick={handleAddPoint}
          />
          <SpeedDialAction
            icon={<PhotoSizeSelectActual />}
            tooltipTitle="Change Image"
            onClick={() => setSnackbar({ open: true, message: 'Use the left panel to change image' })}
          />
           <SpeedDialAction
            icon={<DeleteForever color="error" />}
            tooltipTitle="Clear All Points"
            onClick={() => setIsConfirmingDeleteAll(true)}
          />
          <SpeedDialAction
            icon={<Reorder />}
            tooltipTitle="Reset View"
            onClick={() => transformRef.current?.resetTransform()}
          />
        </SpeedDial>
      </Box>

      <Dialog open={isConfirmingImageChange} onClose={() => setIsConfirmingImageChange(false)}>
        <DialogTitle>Change Background Image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Points are positioned using relative percentages. Changing the image will keep these percentages.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmingImageChange(false)}>Cancel</Button>
          <Button onClick={confirmImageChange} color="primary" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmingDeleteAll} onClose={() => setIsConfirmingDeleteAll(false)}>
        <DialogTitle>Clear all points?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmingDeleteAll(false)}>Cancel</Button>
          <Button onClick={handleDeleteAll} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  )
}
