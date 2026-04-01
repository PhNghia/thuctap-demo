import AddIcon from '@mui/icons-material/Add'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import QuizIcon from '@mui/icons-material/Quiz'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import { MyEditorProps } from '@renderer/types/editor'
import { JSX, useCallback } from 'react'
import {
  EmptyState,
  FileDropTarget,
  IndexBadge,
  NameField,
  SidebarTab,
  StickyHeader
} from '../../components/EditorShared'
import ImagePicker from '../../components/ImagePicker'
import { QuizAnswer, QuizAppData, QuizQuestion } from '../../types'

interface Props extends MyEditorProps<QuizAppData> {}

export default function QuizEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values as QuizAppData
  const { resolved } = useSettings()
  const { questions } = data

  // ── CRUD Helpers ──────────────────────────────────────────────────────────
  const nextQuestionId = useCallback(() => {
    const c = (data._questionCounter ?? 0) + 1
    return { id: `q-${c}`, counter: c }
  }, [data._questionCounter])

  const addQuestion = useCallback(
    (initialImage?: string) => {
      const { id, counter } = nextQuestionId()
      const q: QuizQuestion = {
        id,
        question: resolved.prefillNames ? `Question ${counter}` : '',
        imagePath: initialImage ?? null,
        multipleCorrect: false,
        _answerCounter: 2,
        answers: [
          { id: `${id}-a-1`, text: resolved.prefillNames ? 'Answer A' : '', isCorrect: true },
          { id: `${id}-a-2`, text: resolved.prefillNames ? 'Answer B' : '', isCorrect: false }
        ]
      }
      form.setFieldValue('_questionCounter', counter)
      form.insertListItem('questions', q)
    },
    [form, data, resolved.prefillNames, nextQuestionId]
  )

  const addQuestionFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextQuestionId()
      const imagePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const q: QuizQuestion = {
        id,
        question: resolved.prefillNames ? `Question ${counter}` : '',
        imagePath,
        multipleCorrect: false,
        _answerCounter: 2,
        answers: [
          { id: `${id}-a-1`, text: resolved.prefillNames ? 'Answer A' : '', isCorrect: true },
          { id: `${id}-a-2`, text: resolved.prefillNames ? 'Answer B' : '', isCorrect: false }
        ]
      }
      form.setFieldValue('_questionCounter', counter)
      form.insertListItem('questions', q)
    },
    [form, data, projectDir, resolved.prefillNames, nextQuestionId]
  )

  const deleteQuestion = useCallback(
    (index: number) => {
      form.removeListItem('questions', index)
    },
    [form]
  )

  const addAnswer = useCallback(
    (qIndex: number) => {
      const q = questions[qIndex]
      const ac = (q._answerCounter ?? 0) + 1
      const newAnswer: QuizAnswer = {
        id: `${q.id}-a-${ac}`,
        text: resolved.prefillNames ? `Answer ${String.fromCharCode(64 + ac)}` : '',
        isCorrect: false
      }
      form.setFieldValue(`questions[${qIndex}]._answerCounter`, ac)
      form.insertListItem(`questions[${qIndex}].answers`, newAnswer)
    },
    [form, questions, resolved.prefillNames]
  )

  const deleteAnswer = useCallback(
    (qIndex: number, aIndex: number) => {
      form.removeListItem(`questions[${qIndex}].answers`, aIndex)
    },
    [form]
  )

  const setCorrect = useCallback(
    (qIndex: number, aIndex: number, correct: boolean) => {
      const q = questions[qIndex]
      if (!q.multipleCorrect && correct) {
        // Uncheck all others if single choice
        q.answers.forEach((_, idx) => {
          form.setFieldValue(`questions[${qIndex}].answers[${idx}].isCorrect`, idx === aIndex)
        })
      } else {
        form.setFieldValue(`questions[${qIndex}].answers[${aIndex}].isCorrect`, correct)
      }
    },
    [form, questions]
  )

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addQuestion
  })

  // ── Validation (derived from live form state) ─────────────────────────────
  const noTextCount = questions.filter((q) => !q.question.trim()).length
  const noCorrectCount = questions.filter((q) => !q.answers.some((a) => a.isCorrect)).length
  const emptyAnswersCount = questions.filter((q) => q.answers.some((a) => !a.text.trim())).length
  const tooFewAnsCount = questions.filter((q) => q.answers.length < 2).length
  const hasIssues =
    noTextCount > 0 || noCorrectCount > 0 || emptyAnswersCount > 0 || tooFewAnsCount > 0

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
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
          icon={<QuizIcon fontSize="small" />}
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
            label="Single-answer"
            value={questions.filter((q) => !q.multipleCorrect).length}
          />
          <SummaryRow
            label="Multiple-answer"
            value={questions.filter((q) => q.multipleCorrect).length}
          />
          {noCorrectCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="warning.main">
                {noCorrectCount} need correct answer
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {[
              noTextCount > 0 && `${noTextCount} no text`,
              noCorrectCount > 0 && `${noCorrectCount} no correct answer`,
              emptyAnswersCount > 0 && `${emptyAnswersCount} blank answers`,
              tooFewAnsCount > 0 && `${tooFewAnsCount} too few answers`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        <StickyHeader
          title="Questions"
          description="Each question has answer choices. Mark which answers are correct."
          actions={
            <FileDropTarget onFileDrop={addQuestionFromDrop}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={() => addQuestion()}
              >
                Add Question
              </Button>
            </FileDropTarget>
          }
        />

        {questions.length === 0 ? (
          <EmptyState
            icon={<QuizIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
            title="No questions yet"
            description='Click "Add Question" or drop an image to create your first question.'
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                form={form}
                question={q}
                index={idx}
                projectDir={projectDir}
                autoFocus={idx === questions.length - 1}
                onDelete={() => deleteQuestion(idx)}
                onAddAnswer={() => addAnswer(idx)}
                onDeleteAnswer={(aIdx) => deleteAnswer(idx, aIdx)}
                onSetCorrect={(aIdx, correct) => setCorrect(idx, aIdx, correct)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }): JSX.Element {
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

function QuestionCard({
  form,
  question,
  index,
  projectDir,
  autoFocus,
  onDelete,
  onAddAnswer,
  onDeleteAnswer,
  onSetCorrect
}: {
  form: Props['form']
  question: QuizQuestion
  index: number
  projectDir: string
  autoFocus?: boolean
  onDelete: () => void
  onAddAnswer: () => void
  onDeleteAnswer: (aIdx: number) => void
  onSetCorrect: (aIdx: number, correct: boolean) => void
}): JSX.Element {
  const hasNoCorrect = !question.answers.some((a) => a.isCorrect)
  const isSingle = !question.multipleCorrect
  const path = `questions[${index}]`

  return (
    <FileDropTarget
      onFileDrop={async (fp) => {
        const rel = await window.electronAPI.importImage(fp, projectDir, question.id)
        form.setFieldValue(`${path}.imagePath`, rel)
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: hasNoCorrect ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27',
          overflow: 'hidden'
        }}
      >
        {/* Question Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <IndexBadge index={index} color="primary" />

          <form.Field name={`${path}.imagePath`}>
            {(field) => (
              <ImagePicker
                projectDir={projectDir}
                desiredNamePrefix={question.id}
                value={field.state.value}
                onChange={(p) => field.handleChange(p)}
                label="Question image"
                size={80}
              />
            )}
          </form.Field>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <form.Field name={`${path}.question`}>
              {(field) => (
                <NameField
                  label="Question text"
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Which animal is the largest?"
                  autoFocus={autoFocus}
                  multiline
                />
              )}
            </form.Field>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <form.Field name={`${path}.multipleCorrect`}>
                {(field) => (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="caption" color="text.secondary">
                        Multiple correct answers
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                )}
              </form.Field>

              {hasNoCorrect && (
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                  label="No correct answer marked"
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          </Box>

          <Tooltip title="Delete question">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Answers */}
        <Box sx={{ px: 2, pb: 2, pl: '88px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="overline"
            sx={{ fontSize: '0.6rem', letterSpacing: 2, color: 'text.disabled' }}
          >
            Answers — click the icon to mark as correct
          </Typography>

          {question.answers.map((answer, aIdx) => {
            const isCorrect = answer.isCorrect
            const CorrectIcon = isSingle
              ? isCorrect
                ? CheckCircleIcon
                : RadioButtonUncheckedIcon
              : isCorrect
                ? CheckBoxIcon
                : CheckBoxOutlineBlankIcon

            return (
              <Box key={answer.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={isCorrect ? 'Correct answer (click to toggle)' : 'Mark as correct'}>
                  <IconButton
                    size="small"
                    onClick={() => onSetCorrect(aIdx, !isCorrect)}
                    sx={{ color: isCorrect ? 'success.main' : 'text.disabled', flexShrink: 0 }}
                  >
                    <CorrectIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <form.Field name={`${path}.answers[${aIdx}].text`}>
                  {(field) => (
                    <TextField
                      size="small"
                      fullWidth
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={`Answer ${String.fromCharCode(64 + aIdx + 1)}…`}
                      error={!field.state.value.trim()}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderColor: isCorrect ? 'success.main' : undefined,
                          '& fieldset': {
                            borderColor: isCorrect ? 'rgba(52,211,153,0.4)' : undefined
                          }
                        }
                      }}
                    />
                  )}
                </form.Field>

                <Tooltip title="Remove answer">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteAnswer(aIdx)}
                      disabled={question.answers.length <= 2}
                      sx={{
                        color: 'error.main',
                        opacity: 0.5,
                        '&:hover': { opacity: 1 },
                        '&.Mui-disabled': { opacity: 0.2 }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )
          })}

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddAnswer}
            sx={{ alignSelf: 'flex-start', mt: 0.5, opacity: 0.7 }}
          >
            Add answer
          </Button>
        </Box>
      </Paper>
    </FileDropTarget>
  )
}
