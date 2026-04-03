import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography
} from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useCallback, useState } from 'react'
import { LabelledDiagramAppData, LabelledDiagramPoint } from '../../types'
import { ImageViewer } from './components/ImageViewer'
import { PointListPanel } from './components/PointListPanel'

interface Props {
  appData: LabelledDiagramAppData
  projectDir: string
  onChange: (data: LabelledDiagramAppData) => void
}

function normalize(d: LabelledDiagramAppData): LabelledDiagramAppData {
  return {
    ...d,
    imagePath: d.imagePath ?? null,
    points: d.points ?? [],
    _pointCounter: d._pointCounter ?? 0
  }
}

// Color palette for point badges - rotates through colors
const POINT_COLORS = [
  { bg: 'rgba(110,231,183,0.9)', text: '#000' },  // Green
  { bg: 'rgba(167,139,250,0.9)', text: '#fff' },  // Purple
  { bg: 'rgba(251,191,36,0.9)', text: '#000' },   // Amber
  { bg: 'rgba(248,113,113,0.9)', text: '#fff' },  // Red
  { bg: 'rgba(96,165,250,0.9)', text: '#fff' },   // Blue
  { bg: 'rgba(251,146,60,0.9)', text: '#fff' },   // Orange
  { bg: 'rgba(163,230,53,0.9)', text: '#000' },   // Lime
  { bg: 'rgba(236,72,153,0.9)', text: '#fff' },   // Pink
]

function getPointColor(index: number) {
  return POINT_COLORS[index % POINT_COLORS.length]
}

export default function LabelledDiagramEditor({
  appData: raw,
  projectDir,
  onChange
}: Props): React.ReactElement {
  const data = normalize(raw)
  const [panelOpen, setPanelOpen] = useState(true)
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)

  // ── Image handling ──────────────────────────────────────────────────────
  const handleSelectImage = useCallback(async () => {
    const filePath = await window.electronAPI.pickImage()
    if (filePath) {
      const relativePath = await window.electronAPI.importImage(
        filePath,
        projectDir,
        'diagram'
      )
      onChange({ ...data, imagePath: relativePath })
    }
  }, [data, projectDir, onChange])

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  const nextPointId = useCallback(() => {
    const c = data._pointCounter + 1
    return { id: `point-${c}`, counter: c }
  }, [data._pointCounter])

  const addPoint = useCallback(
    (xPercent: number = 50, yPercent: number = 50) => {
      const { id, counter } = nextPointId()
      const point: LabelledDiagramPoint = {
        id,
        text: '',
        xPercent,
        yPercent
      }
      onChange({
        ...data,
        _pointCounter: counter,
        points: [...data.points, point]
      })
      // Auto-select the new point
      setSelectedPointId(id)
    },
    [data, onChange, nextPointId]
  )

  const updatePoint = useCallback(
    (id: string, patch: Partial<LabelledDiagramPoint>) => {
      onChange({
        ...data,
        points: data.points.map((p) => (p.id === id ? { ...p, ...patch } : p))
      })
    },
    [data, onChange]
  )

  const deletePoint = useCallback(
    (id: string) => {
      const newPoints = data.points.filter((p) => p.id !== id)
      onChange({ ...data, points: newPoints })
      if (selectedPointId === id) {
        setSelectedPointId(null)
      }
    },
    [data, selectedPointId, onChange]
  )

  const handleImageClick = useCallback(
    (xPercent: number, yPercent: number) => {
      addPoint(xPercent, yPercent)
    },
    [addPoint]
  )

  const handlePointDrag = useCallback(
    (id: string, xPercent: number, yPercent: number) => {
      updatePoint(id, { xPercent, yPercent })
    },
    [updatePoint]
  )

  const scrollToSelectedPoint = useCallback(
    (point: LabelledDiagramPoint) => {
      // The ImageViewer will handle this via a ref or state sync
      // For now, we just update the selectedPointId
      setSelectedPointId(point.id)
    },
    []
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addPoint
  })

  // ── Validation ────────────────────────────────────────────────────────────
  const unnamedPoints = data.points.filter((p) => !p.text.trim())
  const hasIssues = !data.imagePath || unnamedPoints.length > 0

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', bgcolor: '#0f1117' }}>
      {/* ── Left Panel (Point List) ── */}
      <Box
        sx={{
          flexShrink: 0,
          width: panelOpen ? 300 : 0,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          borderRight: panelOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          bgcolor: '#13161f',
          position: 'relative'
        }}
      >
        <PointListPanel
          points={data.points}
          selectedPointId={selectedPointId}
          onSelectPoint={setSelectedPointId}
          onUpdatePoint={updatePoint}
          onDeletePoint={deletePoint}
          onNavigateToPoint={scrollToSelectedPoint}
          getPointColor={getPointColor}
        />

        {/* Collapse/Expand Toggle */}
        <IconButton
          onClick={() => setPanelOpen(!panelOpen)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: -16,
            bgcolor: '#1a1d27',
            border: '1px solid rgba(255,255,255,0.08)',
            '&:hover': { bgcolor: '#232733' },
            zIndex: 10
          }}
        >
          {panelOpen ? (
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* ── Main Image Area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Validation Alert */}
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ m: 2, fontSize: '0.8rem' }}>
            {[
              !data.imagePath && 'No image selected. Click the button below to add an image.',
              unnamedPoints.length > 0 &&
                `${unnamedPoints.length} point(s) missing text`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        {/* Image Viewer */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {data.imagePath ? (
            <ImageViewer
              imagePath={data.imagePath}
              projectDir={projectDir}
              points={data.points}
              selectedPointId={selectedPointId}
              onImageClick={handleImageClick}
              onPointDrag={handlePointDrag}
              getPointColor={getPointColor}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: '#0a0c12'
              }}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No Image Selected
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                Click the button below to select an image for your diagram
              </Typography>
              <Button
                variant="contained"
                onClick={handleSelectImage}
                startIcon={<AddPhotoAlternateIcon />}
                size="large"
              >
                Select Image
              </Button>
            </Box>
          )}
        </Box>

        {/* Image Selection Button (always visible) */}
        {data.imagePath && (
          <Box
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              bgcolor: '#13161f',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectImage}
              startIcon={<AddPhotoAlternateIcon />}
            >
              Change Image
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
