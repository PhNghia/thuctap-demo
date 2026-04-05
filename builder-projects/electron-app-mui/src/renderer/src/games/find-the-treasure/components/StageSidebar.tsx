import CollectionsIcon from '@mui/icons-material/Collections'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import React, { useCallback, useState } from 'react'
import { FindTheTreasureStage } from '../../../types'
import { MarqueeText } from './MarqueeText'

export type Tab = 'stages' | 'settings'

export interface StageSidebarProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
  stages: FindTheTreasureStage[]
  activeStageId: string | null
  onStageSelect: (stageId: string) => void
  onStageDelete: (stageId: string) => void
}

export function StageSidebar({
  tab,
  onTabChange,
  stages,
  activeStageId,
  onStageSelect,
  onStageDelete
}: StageSidebarProps): React.ReactElement {
  const handleDelete = useCallback(
    (e: React.MouseEvent, stageId: string) => {
      e.stopPropagation()
      onStageDelete(stageId)
    },
    [onStageDelete]
  )

  // ── NEW: Track hovered stage ID ──
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null)

  // Validation counts
  const stagesWithIssues = stages.filter((s) => {
    const hasCorrectAnswer = s.answers.some((a) => a.isCorrect)
    return (
      !s.stageName.trim() ||
      !s.stageText.trim() ||
      !s.question.trim() ||
      !s.stageDescription.trim() ||
      !hasCorrectAnswer ||
      s.answers.some((a) => !a.text.trim()) ||
      s.answers.length < 2
    )
  })

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        background: '#13161f',
        p: 2,
        gap: 1,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* ── Top: Navigation Tabs (static) ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Sections
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5
        }}
      >
        <Box
          role="button"
          onClick={() => onTabChange('stages')}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            cursor: 'pointer',
            background: tab === 'stages' ? 'rgba(99,132,255,0.15)' : 'transparent',
            border: tab === 'stages' ? '1px solid rgba(99,132,255,0.3)' : '1px solid transparent',
            transition: 'all 0.15s ease',
            '&:hover': {
              background: tab === 'stages' ? 'rgba(99,132,255,0.2)' : 'rgba(255,255,255,0.04)'
            }
          }}
        >
          <CollectionsIcon
            fontSize="small"
            sx={{ color: tab === 'stages' ? '#6384ff' : 'text.secondary', fontSize: 18 }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              fontWeight: tab === 'stages' ? 600 : 400,
              color: tab === 'stages' ? '#6384ff' : 'text.secondary'
            }}
          >
            Stages
          </Typography>
          <Chip
            label={stages.length}
            size="small"
            sx={{
              ml: 'auto',
              height: 16,
              fontSize: '0.6rem',
              minWidth: 20,
              background:
                stagesWithIssues.length > 0 ? 'rgba(255,82,82,0.2)' : 'rgba(99,132,255,0.15)',
              color: stagesWithIssues.length > 0 ? '#ff5252' : '#6384ff'
            }}
          />
        </Box>
        <Tooltip title="Settings">
          <Box
            role="button"
            onClick={() => onTabChange('settings')}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              cursor: 'pointer',
              background: tab === 'settings' ? 'rgba(99,132,255,0.15)' : 'transparent',
              border:
                tab === 'settings' ? '1px solid rgba(99,132,255,0.3)' : '1px solid transparent',
              transition: 'all 0.15s ease',
              '&:hover': {
                background: tab === 'settings' ? 'rgba(99,132,255,0.2)' : 'rgba(255,255,255,0.04)'
              }
            }}
          >
            <SettingsIcon
              sx={{ color: tab === 'settings' ? '#6384ff' : 'text.secondary', fontSize: 18 }}
            />
          </Box>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* ── Middle: Scrollable Stage List ── */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Stages
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          minHeight: 0
        }}
      >
        {stages.length === 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
            No stages yet
          </Typography>
        ) : (
          stages.map((s, idx) => {
            const hasCorrectAnswer = s.answers.some((a) => a.isCorrect)
            const hasIssue =
              !s.stageName.trim() ||
              !s.stageText.trim() ||
              !s.question.trim() ||
              !s.stageDescription.trim() ||
              !hasCorrectAnswer ||
              s.answers.some((a) => !a.text.trim()) ||
              s.answers.length < 2
            const isActive = s.id === activeStageId
            // ── NEW: Check if this stage is hovered ──
            const isHovered = hoveredStageId === s.id

            return (
              <Box
                key={s.id}
                onClick={() => onStageSelect(s.id)}
                // ── NEW: Add hover handlers ──
                onMouseEnter={() => setHoveredStageId(s.id)}
                onMouseLeave={() => setHoveredStageId(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(99,132,255,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,132,255,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: isActive ? 'rgba(99,132,255,0.18)' : 'rgba(255,255,255,0.04)'
                  },
                  minHeight: 36
                }}
              >
                {/* Badge on left */}
                <Chip
                  label={idx + 1}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    minWidth: 22,
                    flexShrink: 0,
                    background: hasIssue ? 'rgba(255,82,82,0.2)' : 'rgba(99,132,255,0.15)',
                    color: hasIssue ? '#ff5252' : '#6384ff',
                    fontWeight: 600
                  }}
                />

                {/* Stage name (with marquee if active) */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    minWidth: 0 // CRITICAL: allows the box to be smaller than the text
                  }}
                >
                  <MarqueeText
                    text={s.stageName || `Stage ${idx + 1}`}
                    isActive={isActive}
                    isHovered={isHovered} // ← Pass hovered state
                  />
                </Box>

                {/* Delete button on right */}
                <Tooltip title="Delete stage">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(e, s.id)}
                    sx={{
                      color: 'error.main',
                      opacity: 0.4,
                      '&:hover': { opacity: 1 },
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      '& .MuiSvgIcon-root': { fontSize: 14 }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          })
        )}
      </Box>

      {/* ── Bottom: Summary (pinned, always visible) ── */}
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <SummaryRow label="Total stages" value={stages.length} />
        <SummaryRow
          label="Total options"
          value={stages.reduce((sum, s) => sum + s.answers.length, 0)}
        />
        {stagesWithIssues.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              {stagesWithIssues.length} stage(s) with issues
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Chip
        label={value}
        size="small"
        sx={{ height: 16, fontSize: '0.65rem', minWidth: 24 }}
        color={value === 0 ? 'default' : 'primary'}
      />
    </Box>
  )
}
