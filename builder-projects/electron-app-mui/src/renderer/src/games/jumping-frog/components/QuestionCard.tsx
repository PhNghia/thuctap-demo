import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { FileDropTarget, ImagePicker } from '../../../components'
import { JumpingFrogAnswer, JumpingFrogQuestion } from '../../../types'

export interface QuestionCardProps {
  question: JumpingFrogQuestion
  index: number
  projectDir: string
  autoFocus: boolean
  onUpdate: (id: string, patch: Partial<JumpingFrogQuestion>) => void
  onDelete: (id: string) => void
  onAddAnswer: (qid: string, initialImage?: string) => void
  onUpdateAnswer: (qid: string, aid: string, patch: Partial<JumpingFrogAnswer>) => void
  onDeleteAnswer: (qid: string, aid: string) => void
}

export function QuestionCard({
  question,
  index,
  projectDir,
  autoFocus,
  onUpdate,
  onDelete,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer
}: QuestionCardProps): React.ReactElement {
  const hasCorrectAnswer = question.answers.some((a) => a.isCorrect)

  const handleDropToAddAnswer = async (filePath: string): Promise<void> => {
    const rel = await window.electronAPI.importImage(filePath, projectDir, `${question.id}-answer`)
    onAddAnswer(question.id, rel)
  }

  return (
    <FileDropTarget onFileDrop={handleDropToAddAnswer}>
      <Box
        sx={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* ── Card Header ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)'
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}
          >
            Question {index + 1}
          </Typography>
          <Tooltip title="Delete question">
            <IconButton
              size="small"
              onClick={() => onDelete(question.id)}
              sx={{ color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Question Text ── */}
        <Box sx={{ p: 2, pb: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Question"
            size="small"
            fullWidth
            value={question.question}
            onChange={(e) => onUpdate(question.id, { question: e.target.value })}
            placeholder="e.g. What is 2 + 2?"
            error={!question.question.trim()}
            helperText={!question.question.trim() ? 'Required' : ''}
            autoFocus={autoFocus}
          />
        </Box>

        {/* ── Answers ── */}
        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            variant="overline"
            sx={{ fontSize: '0.6rem', letterSpacing: 2, color: 'text.disabled' }}
          >
            Options
          </Typography>

          {question.answers.map((answer, aIdx) => {
            const isCorrect = answer.isCorrect
            const Icon = isCorrect ? CheckCircleIcon : RadioButtonUncheckedIcon

            return (
              <FileDropTarget
                key={answer.id}
                onFileDrop={async (fp) => {
                  const rel = await window.electronAPI.importImage(fp, projectDir, answer.id)
                  onUpdateAnswer(question.id, answer.id, { imagePath: rel })
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    border: '1px dashed rgba(255,255,255,0.06)',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  {/* Correct marker */}
                  <Tooltip title={isCorrect ? 'Correct (click to toggle)' : 'Mark as correct'}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        onUpdateAnswer(question.id, answer.id, { isCorrect: !isCorrect })
                      }
                      sx={{
                        color: isCorrect ? 'success.main' : 'text.disabled',
                        flexShrink: 0
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Answer image picker */}
                  <ImagePicker
                    projectDir={projectDir}
                    desiredNamePrefix={answer.id}
                    value={answer.imagePath}
                    onChange={(p) => onUpdateAnswer(question.id, answer.id, { imagePath: p })}
                    label={`Option ${String.fromCharCode(64 + aIdx + 1)} image`}
                    size={56}
                  />

                  {/* Answer text */}
                  <TextField
                    size="small"
                    fullWidth
                    value={answer.text}
                    onChange={(e) =>
                      onUpdateAnswer(question.id, answer.id, { text: e.target.value })
                    }
                    placeholder={`Option ${String.fromCharCode(64 + aIdx + 1)}…`}
                    error={!answer.text.trim()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderColor: isCorrect ? 'success.main' : undefined,
                        '& fieldset': {
                          borderColor: isCorrect ? 'rgba(52,211,153,0.4)' : undefined
                        }
                      }
                    }}
                  />

                  {/* Delete */}
                  <Tooltip title="Remove option">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteAnswer(question.id, answer.id)}
                        disabled={question.answers.length <= 2}
                        sx={{
                          color: 'error.main',
                          opacity: 0.5,
                          '&:hover': { opacity: 1 },
                          '&.Mui-disabled': { opacity: 0.2 },
                          flexShrink: 0
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </FileDropTarget>
            )
          })}

          {/* Add answer button with drop support */}
          <FileDropTarget onFileDrop={handleDropToAddAnswer}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddAnswer(question.id)}
              sx={{ alignSelf: 'flex-start', mt: 0.5, opacity: 0.7 }}
            >
              Add option
            </Button>
          </FileDropTarget>

          {!hasCorrectAnswer && question.answers.length > 0 && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.25 }}>
              ⚠ No correct answer marked
            </Typography>
          )}
        </Box>
      </Box>
    </FileDropTarget>
  )
}
