import { Box } from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import React, { useCallback } from 'react'
import { JumpingFrogAnswer, JumpingFrogAppData, JumpingFrogQuestion } from '../../types'
import { QuestionsTab, SummarySidebar } from './components'

interface Props {
  appData: JumpingFrogAppData
  projectDir: string
  onChange: (data: JumpingFrogAppData) => void
}

function normalize(d: JumpingFrogAppData): JumpingFrogAppData {
  return {
    ...d,
    _questionCounter: d._questionCounter ?? 0,
    _answerCounter: d._answerCounter ?? 0,
    questions: d.questions ?? []
  }
}

export default function JumpingFrogEditor({
  appData: raw,
  projectDir: _projectDir,
  onChange
}: Props): React.ReactElement {
  const data = normalize(raw)
  const { resolved } = useSettings()
  const { questions } = data

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addQuestion = useCallback(
    (_initialImage?: string) => {
      const qc = data._questionCounter + 1
      const qid = `q-${qc}`
      const ac = data._answerCounter

      const answers: JumpingFrogAnswer[] = [
        {
          id: `${qid}-a-${ac + 1}`,
          text: resolved.prefillNames ? `Option ${ac + 1}` : '',
          imagePath: null,
          isCorrect: true
        },
        {
          id: `${qid}-a-${ac + 2}`,
          text: resolved.prefillNames ? `Option ${ac + 2}` : '',
          imagePath: null,
          isCorrect: false
        }
      ]

      const q: JumpingFrogQuestion = {
        id: qid,
        question: resolved.prefillNames ? `Question ${qc}` : '',
        answers
      }

      onChange({
        ...data,
        _questionCounter: qc,
        _answerCounter: ac + 2,
        questions: [...questions, q]
      })
    },
    [data, questions, resolved.prefillNames, onChange]
  )

  const addQuestionFromDrop = useCallback(
    async (filePath: string) => {
      const qc = data._questionCounter + 1
      const qid = `q-${qc}`
      const ac = data._answerCounter
      const imagePath = await window.electronAPI.importImage(filePath, _projectDir, qid)

      const answers: JumpingFrogAnswer[] = [
        {
          id: `${qid}-a-${ac + 1}`,
          text: resolved.prefillNames ? `Option ${ac + 1}` : '',
          imagePath,
          isCorrect: true
        },
        {
          id: `${qid}-a-${ac + 2}`,
          text: resolved.prefillNames ? `Option ${ac + 2}` : '',
          imagePath: null,
          isCorrect: false
        }
      ]

      const q: JumpingFrogQuestion = {
        id: qid,
        question: resolved.prefillNames ? `Question ${qc}` : '',
        answers
      }

      onChange({
        ...data,
        _questionCounter: qc,
        _answerCounter: ac + 2,
        questions: [...questions, q]
      })
    },
    [data, questions, _projectDir, resolved.prefillNames, onChange]
  )

  const updateQuestion = useCallback(
    (id: string, patch: Partial<JumpingFrogQuestion>) => {
      onChange({ ...data, questions: questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) })
    },
    [data, questions, onChange]
  )

  const deleteQuestion = useCallback(
    (id: string) => {
      onChange({ ...data, questions: questions.filter((q) => q.id !== id) })
    },
    [data, questions, onChange]
  )

  const addAnswer = useCallback(
    (qid: string, initialImage?: string) => {
      onChange({
        ...data,
        questions: questions.map((q) => {
          if (q.id !== qid) return q
          const ac = data._answerCounter + 1
          const newAnswer: JumpingFrogAnswer = {
            id: `${qid}-a-${ac}`,
            text: resolved.prefillNames ? `Option ${ac}` : '',
            imagePath: initialImage ?? null,
            isCorrect: false
          }
          return { ...q, answers: [...q.answers, newAnswer] }
        }),
        _answerCounter: data._answerCounter + 1
      })
    },
    [data, questions, resolved.prefillNames, onChange]
  )

  const updateAnswer = useCallback(
    (qid: string, aid: string, patch: Partial<JumpingFrogAnswer>) => {
      onChange({
        ...data,
        questions: questions.map((q) => {
          if (q.id !== qid) return q
          let answers = q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a))

          // Marking as correct → uncheck others (single-correct mode)
          if (patch.isCorrect) {
            answers = answers.map((a) =>
              a.id === aid ? { ...a, isCorrect: true } : { ...a, isCorrect: false }
            )
          }

          return { ...q, answers }
        })
      })
    },
    [data, questions, onChange]
  )

  const deleteAnswer = useCallback(
    (qid: string, aid: string) => {
      onChange({
        ...data,
        questions: questions.map((q) =>
          q.id !== qid ? q : { ...q, answers: q.answers.filter((a) => a.id !== aid) }
        )
      })
    },
    [data, questions, onChange]
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEntityCreateShortcut({
    onTier1: addQuestion
  })

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <SummarySidebar questions={questions} />

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <QuestionsTab
          questions={questions}
          projectDir={_projectDir}
          onAddQuestion={addQuestion}
          onAddQuestionFromDrop={addQuestionFromDrop}
          onUpdateQuestion={updateQuestion}
          onDeleteQuestion={deleteQuestion}
          onAddAnswer={addAnswer}
          onUpdateAnswer={updateAnswer}
          onDeleteAnswer={deleteAnswer}
        />
      </Box>
    </Box>
  )
}
