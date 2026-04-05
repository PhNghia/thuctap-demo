import AddIcon from '@mui/icons-material/Add'
import QuizIcon from '@mui/icons-material/Quiz'
import { Alert, Box, Button, Collapse } from '@mui/material'
import React from 'react'
import { EmptyState, FileDropTarget, StickyHeader } from '../../../components/editors'
import { JumpingFrogAnswer, JumpingFrogQuestion } from '../../../types'
import { QuestionCard } from './QuestionCard'

export interface QuestionsTabProps {
  questions: JumpingFrogQuestion[]
  projectDir: string
  onAddQuestion: (initialImage?: string) => void
  onAddQuestionFromDrop: (filePath: string) => void
  onUpdateQuestion: (id: string, patch: Partial<JumpingFrogQuestion>) => void
  onDeleteQuestion: (id: string) => void
  onAddAnswer: (qid: string, initialImage?: string) => void
  onUpdateAnswer: (qid: string, aid: string, patch: Partial<JumpingFrogAnswer>) => void
  onDeleteAnswer: (qid: string, aid: string) => void
}

export function QuestionsTab({
  questions,
  projectDir,
  onAddQuestion,
  onAddQuestionFromDrop,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer
}: QuestionsTabProps): React.ReactElement {
  // Validation
  const noText = questions.filter((q) => !q.question.trim())
  const noCorrect = questions.filter((q) => !q.answers.some((a) => a.isCorrect))
  const emptyAnswers = questions.filter((q) => q.answers.some((a) => !a.text.trim()))
  const tooFewAns = questions.filter((q) => q.answers.length < 2)
  const hasIssues =
    noText.length > 0 || noCorrect.length > 0 || emptyAnswers.length > 0 || tooFewAns.length > 0

  return (
    <Box>
      <Collapse in={hasIssues}>
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
          {[
            noText.length > 0 && `${noText.length} question(s) have no text`,
            noCorrect.length > 0 && `${noCorrect.length} question(s) have no correct answer marked`,
            emptyAnswers.length > 0 && `${emptyAnswers.length} question(s) have blank option text`,
            tooFewAns.length > 0 && `${tooFewAns.length} question(s) need at least 2 options`
          ]
            .filter(Boolean)
            .join(' · ')}
        </Alert>
      </Collapse>

      <StickyHeader
        title="Questions"
        description="Each question has options. Mark which option is correct."
        actions={
          <FileDropTarget onFileDrop={onAddQuestionFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAddQuestion()}
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
              question={q}
              index={idx}
              projectDir={projectDir}
              autoFocus={idx === questions.length - 1}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              onAddAnswer={onAddAnswer}
              onUpdateAnswer={onUpdateAnswer}
              onDeleteAnswer={onDeleteAnswer}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
