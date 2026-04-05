import CollectionsIcon from '@mui/icons-material/Collections'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Chip, Divider, Typography } from '@mui/material'
import React from 'react'
import { SidebarTab } from '../../../components/editors'
import { JumpingFrogQuestion } from '../../../types'

export interface SummarySidebarProps {
  questions: JumpingFrogQuestion[]
}

export function SummarySidebar({ questions }: SummarySidebarProps): React.ReactElement {
  const noCorrect = questions.filter((q) => !q.answers.some((a) => a.isCorrect))
  const hasIssues = noCorrect.length > 0

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
        gap: 1
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Questions
      </Typography>
      <SidebarTab
        active={true}
        onClick={() => {}}
        icon={<CollectionsIcon fontSize="small" />}
        label="All Questions"
        badge={questions.length}
        badgeColor={hasIssues ? 'error' : 'default'}
      />

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
      >
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <SummaryRow label="Total questions" value={questions.length} />
        <SummaryRow
          label="Total options"
          value={questions.reduce((sum, q) => sum + q.answers.length, 0)}
        />
        {noCorrect.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              {noCorrect.length} need a correct answer
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
