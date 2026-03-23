/**
 * Shared primitives used by both GroupSortEditor and QuizEditor.
 * Keep this file free of game-specific logic.
 */
import { Badge, Box, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'

// ── SidebarTab ────────────────────────────────────────────────────────────────
export function SidebarTab({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge: number
  badgeColor: 'default' | 'error' | 'primary'
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        background: active ? 'rgba(110,231,183,0.1)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'primary.dark' : 'transparent',
        color: active ? 'primary.main' : 'text.secondary',
        transition: 'all 0.15s',
        '&:hover': {
          background: active ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.04)',
          color: active ? 'primary.main' : 'text.primary'
        }
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ flex: 1, fontWeight: active ? 600 : 400 }}>
        {label}
      </Typography>
      <Badge
        badgeContent={badge}
        color={badgeColor === 'default' ? 'primary' : badgeColor}
        sx={{
          '& .MuiBadge-badge': {
            position: 'static', // Removes the "floating" absolute position
            transform: 'none' // Prevents the offset shift
          }
        }}
        max={99}
      >
        <span />
      </Badge>
    </Box>
  )
}

// ── IndexBadge ────────────────────────────────────────────────────────────────
export function IndexBadge({
  index,
  color
}: {
  index: number
  color: 'primary' | 'secondary' | 'warning'
}) {
  const bg =
    color === 'primary'
      ? 'rgba(110,231,183,0.12)'
      : color === 'secondary'
        ? 'rgba(167,139,250,0.12)'
        : 'rgba(251,191,36,0.12)'
  const fg =
    color === 'primary' ? 'primary.main' : color === 'secondary' ? 'secondary.main' : 'warning.main'
  return (
    <Typography
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.72rem',
        fontWeight: 700,
        flexShrink: 0
      }}
    >
      {index + 1}
    </Typography>
  )
}

// ── NameField ─────────────────────────────────────────────────────────────────
/**
 * Text field that auto-focuses and selects-all when autoFocus=true (newest card).
 * Lets users immediately type over the prefilled name.
 */
export function NameField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  multiline,
  sx
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  multiline?: boolean
  sx?: object
}) {
  const didSelect = useRef(false)
  const handleRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (input && autoFocus && !didSelect.current) {
        didSelect.current = true
        setTimeout(() => {
          input.focus()
          input.select()
        }, 30)
      }
    },
    [autoFocus]
  )

  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      sx={{ flex: 1, ...sx }}
      error={!value.trim()}
      helperText={!value.trim() ? 'Required' : ''}
      inputRef={handleRef}
    />
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 1.5,
        color: 'text.disabled',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 3
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ opacity: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.4, textAlign: 'center', maxWidth: 320 }}>
        {description}
      </Typography>
    </Box>
  )
}

// ── DroppableZone ─────────────────────────────────────────────────────────────
/**
 * Wraps any children with HTML5 drag-over/drop listeners for image files.
 * Highlights when an image is dragged over. Calls onFileDrop with the
 * native file path (Electron adds .path to File objects).
 */
export function DroppableZone({
  onFileDrop,
  children,
  sx
}: {
  onFileDrop: (filePath: string) => void
  children: React.ReactNode
  sx?: object
}) {
  const [over, setOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setOver(true)
    }
  }
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    if (file) onFileDrop((file as File & { path: string }).path)
  }

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        borderRadius: 1.5,
        transition: 'outline 0.1s',
        outline: over ? '2px solid #6ee7b7' : '2px solid transparent',
        ...sx
      }}
    >
      {children}
    </Box>
  )
}

// ── StickyHeader ──────────────────────────────────────────────────────────────
/**
 * A sticky bar pinned to the top of the scrollable content area.
 * Renders a title + description on the left, and action controls on the right.
 */
export function StickyHeader({
  title,
  description,
  actions
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
        py: 1.5,
        px: 2,
        background: 'linear-gradient(to bottom, #181b25 85%, transparent)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  )
}

// ── useEditorShortcuts ────────────────────────────────────────────────────────
/**
 * Registers Ctrl+N / Ctrl+Shift+N / Ctrl+Shift+Alt+N keyboard shortcuts.
 * onTier(1) = Ctrl+N (smallest unit)
 * onTier(2) = Ctrl+Shift+N (mid unit)
 * onTier(3) = Ctrl+Shift+Alt+N (highest unit)
 */
export function useEditorShortcuts(onTier: (tier: 1 | 2 | 3) => void) {
  const cbRef = useRef(onTier)
  cbRef.current = onTier

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl || e.key.toLowerCase() !== 'n') return
      // Skip if focus is inside a text input/textarea to avoid hijacking typing
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      if (e.shiftKey && e.altKey) cbRef.current(3)
      else if (e.shiftKey) cbRef.current(2)
      else cbRef.current(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
