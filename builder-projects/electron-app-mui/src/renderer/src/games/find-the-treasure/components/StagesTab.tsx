import AddIcon from '@mui/icons-material/Add'
import IslandsIcon from '@mui/icons-material/Terrain'
import { Alert, Box, Button, Collapse } from '@mui/material'
import React from 'react'
import { EmptyState, FileDropTarget, StickyHeader } from '../../../components/editors'
import { FindTheTreasureAnswer, FindTheTreasureStage } from '../../../types'
import { StageCard } from './StageCard'

export interface StagesTabProps {
  stages: FindTheTreasureStage[]
  selectedStageId: string | null
  onAddStage: () => void
  onAddStageFromDrop: (filePath: string) => void
  onUpdateStage: (id: string, patch: Partial<FindTheTreasureStage>) => void
  onDeleteStage: (id: string) => void
  onAddAnswer: (stageId: string) => void
  onUpdateAnswer: (stageId: string, answerId: string, patch: Partial<FindTheTreasureAnswer>) => void
  onDeleteAnswer: (stageId: string, answerId: string) => void
  onSelectStage: (id: string) => void
}

export function StagesTab({
  stages,
  selectedStageId,
  onAddStage,
  onAddStageFromDrop,
  onUpdateStage,
  onDeleteStage,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onSelectStage
}: StagesTabProps): React.ReactElement {
  // Validation
  const noName = stages.filter((s) => !s.stageName.trim())
  const noStory = stages.filter((s) => !s.stageText.trim())
  const noPrompt = stages.filter((s) => !s.question.trim())
  const noCorrect = stages.filter((s) => !s.answers.some((a) => a.isCorrect))
  const emptyOptions = stages.filter((s) => s.answers.some((a) => !a.text.trim()))
  const tooFewOptions = stages.filter((s) => s.answers.length < 2)
  const noExplanation = stages.filter((s) => !s.stageDescription.trim())
  const hasIssues =
    noName.length > 0 ||
    noStory.length > 0 ||
    noPrompt.length > 0 ||
    noCorrect.length > 0 ||
    emptyOptions.length > 0 ||
    tooFewOptions.length > 0 ||
    noExplanation.length > 0

  // Determine which stage to show
  const selectedStage = selectedStageId
    ? (stages.find((s) => s.id === selectedStageId) ?? null)
    : null
  const selectedStageIndex = selectedStage ? stages.indexOf(selectedStage) : -1

  // Auto-select first stage if none selected and stages exist
  React.useEffect(() => {
    if (!selectedStageId && stages.length > 0) {
      onSelectStage(stages[0].id)
    }
  }, [selectedStageId, stages.length, stages, onSelectStage])

  return (
    <Box>
      <Collapse in={hasIssues}>
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
          {[
            noName.length > 0 && `${noName.length} stage(s) missing a location`,
            noStory.length > 0 && `${noStory.length} stage(s) missing a story`,
            noPrompt.length > 0 && `${noPrompt.length} stage(s) missing a prompt`,
            noCorrect.length > 0 && `${noCorrect.length} stage(s) have no correct answer marked`,
            emptyOptions.length > 0 && `${emptyOptions.length} stage(s) have blank option text`,
            tooFewOptions.length > 0 && `${tooFewOptions.length} stage(s) need at least 2 options`,
            noExplanation.length > 0 && `${noExplanation.length} stage(s) missing an explanation`
          ]
            .filter(Boolean)
            .join(' · ')}
        </Alert>
      </Collapse>

      <StickyHeader
        title="Stages"
        description="Each stage has a location, story, prompt with options, and explanation."
        actions={
          <FileDropTarget onFileDrop={onAddStageFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAddStage()}
            >
              Add Stage
            </Button>
          </FileDropTarget>
        }
      />

      {stages.length === 0 ? (
        <EmptyState
          icon={<IslandsIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No stages yet"
          description='Click "Add Stage" to create your first island stage.'
        />
      ) : selectedStage ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StageCard
            stage={selectedStage}
            stageIndex={selectedStageIndex}
            autoFocus={false}
            onUpdateStage={onUpdateStage}
            onDeleteStage={onDeleteStage}
            onAddAnswer={onAddAnswer}
            onUpdateAnswer={onUpdateAnswer}
            onDeleteAnswer={onDeleteAnswer}
          />
        </Box>
      ) : null}
    </Box>
  )
}
