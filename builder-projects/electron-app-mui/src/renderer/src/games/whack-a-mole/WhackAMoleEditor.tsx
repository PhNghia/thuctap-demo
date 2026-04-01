import AddIcon from '@mui/icons-material/Add'
import MoleIcon from '@mui/icons-material/Cookie'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
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
import { WhackAMoleAppData, WhackAMoleQuestion } from '../../types'

interface Props extends MyEditorProps<WhackAMoleAppData> {}

export default function WhackAMoleEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values as WhackAMoleAppData
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
      const q: WhackAMoleQuestion = {
        id,
        question: resolved.prefillNames ? `Question ${counter}` : '',
        questionImage: initialImage ?? null,
        answerText: resolved.prefillNames ? `Answer ${counter}` : '',
        answerImage: null
      }
      form.setFieldValue('_questionCounter', counter)
      form.insertListItem('questions', q)
    },
    [form, data, resolved.prefillNames, nextQuestionId]
  )

  const addQuestionFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextQuestionId()
      const questionImage = await window.electronAPI.importImage(filePath, projectDir, id)
      const q: WhackAMoleQuestion = {
        id,
        question: resolved.prefillNames ? `Question ${counter}` : '',
        questionImage,
        answerText: resolved.prefillNames ? `Answer ${counter}` : '',
        answerImage: null
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

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addQuestion
  })

  // ── Validation ────────────────────────────────────────────────────────────
  const noQuestionCount = questions.filter((q) => !q.question.trim()).length
  const noAnswerCount = questions.filter((q) => !q.answerText.trim()).length
  const hasIssues = noQuestionCount > 0 || noAnswerCount > 0

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
          icon={<MoleIcon fontSize="small" />}
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
            label="With question image"
            value={questions.filter((q) => q.questionImage !== null).length}
          />
          <SummaryRow
            label="With answer image"
            value={questions.filter((q) => q.answerImage !== null).length}
          />
          {noQuestionCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="warning.main">
                {noQuestionCount} missing question text
              </Typography>
            </Box>
          )}
          {noAnswerCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="warning.main">
                {noAnswerCount} missing answer text
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
              noQuestionCount > 0 && `${noQuestionCount} question(s) have no text`,
              noAnswerCount > 0 && `${noAnswerCount} question(s) have no answer text`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        <StickyHeader
          title="Questions"
          description="Each question has a correct answer. All answers will be pooled in the game."
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
            icon={<MoleIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
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
  onDelete
}: {
  form: Props['form']
  question: WhackAMoleQuestion
  index: number
  projectDir: string
  autoFocus?: boolean
  onDelete: () => void
}): JSX.Element {
  const path = `questions[${index}]`
  const subgridStyle = {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    alignItems: 'start',
    gap: 2,
    p: 2
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: '#1a1d27',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'min-content min-content 1fr min-content',
        alignItems: 'start'
      }}
    >
      {/* ── ROW 1: QUESTION ────────────────────────────────────────── */}
      <FileDropTarget
        onFileDrop={async (fp) => {
          const rel = await window.electronAPI.importImage(fp, projectDir, question.id)
          form.setFieldValue(`${path}.questionImage`, rel)
        }}
        sx={[subgridStyle, { borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }]}
      >
        <Box sx={{ mt: 0.5 }}>
          <IndexBadge index={index} color="primary" />
        </Box>

        <form.Field name={`${path}.questionImage`}>
          {(field) => (
            <ImagePicker
              projectDir={projectDir}
              desiredNamePrefix={`${question.id}-question`}
              value={field.state.value}
              onChange={(p) => field.handleChange(p)}
              label="Question"
              size={80}
            />
          )}
        </form.Field>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <form.Field name={`${path}.question`}>
            {(field) => (
              <NameField
                label="Question text"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                placeholder="e.g. Con chuột đang ở vị trí nào?"
                autoFocus={autoFocus}
                multiline
              />
            )}
          </form.Field>
          <Typography variant="caption" color="text.secondary">
            This question will be displayed to students.
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            color: 'error.main',
            opacity: 0.6,
            '&:hover': { opacity: 1 },
            mt: 1,
            justifySelf: 'center'
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </FileDropTarget>

      {/* ── ROW 2: ANSWER ───────────────────────────────────────────── */}
      <FileDropTarget
        onFileDrop={async (fp) => {
          const rel = await window.electronAPI.importImage(fp, projectDir, `${question.id}-answer`)
          form.setFieldValue(`${path}.answerImage`, rel)
        }}
        sx={[
          subgridStyle,
          { borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }
        ]}
      >
        <Typography
          variant="overline"
          sx={{
            gridColumn: '1 / 4',
            color: '#6ee7b7',
            fontWeight: 700,
            letterSpacing: 1.2,
            fontSize: '0.65rem',
            lineHeight: 1,
            mb: 0.5,
            pl: 1
          }}
        >
          Correct Answer (The mole students should whack)
        </Typography>

        <Box />
        <Box />

        <form.Field name={`${path}.answerImage`}>
          {(field) => (
            <ImagePicker
              projectDir={projectDir}
              desiredNamePrefix={`${question.id}-answer`}
              value={field.state.value}
              onChange={(p) => field.handleChange(p)}
              label="Answer"
              size={80}
            />
          )}
        </form.Field>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <form.Field name={`${path}.answerText`}>
            {(field) => (
              <NameField
                label="Answer text"
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                placeholder="e.g. Dưới đất"
                multiline={false}
              />
            )}
          </form.Field>
          <Typography variant="caption" color="text.secondary">
            In the game, this mole will appear among other decoy moles.
          </Typography>
        </Box>

        <Box />
      </FileDropTarget>
    </Paper>
  )
}
