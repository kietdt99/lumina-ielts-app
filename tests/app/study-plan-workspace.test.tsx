import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyPlanWorkspace } from '@/app/(app)/study-plan/_components/study-plan-workspace'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { createHistoryEntry, createLearnerGoals } from '../helpers/fixtures'

const state = {
  entries: [] as WritingHistoryEntry[],
}

const hydrateWritingHistoryMock = vi.fn()

vi.mock('@/lib/ielts/writing-history', () => ({
  hydrateWritingHistory: (entries: WritingHistoryEntry[]) =>
    hydrateWritingHistoryMock(entries),
  getServerWritingHistorySnapshot: () => [],
  getWritingHistorySnapshot: () => state.entries,
  subscribeToWritingHistory: () => () => undefined,
}))

describe('StudyPlanWorkspace', () => {
  beforeEach(() => {
    state.entries = []
    hydrateWritingHistoryMock.mockClear()
  })

  it('renders starter practice sessions for a new learner', () => {
    render(
      <StudyPlanWorkspace
        learnerGoals={createLearnerGoals({
          studyFrequency: '2 sessions/week',
          focusSkill: 'Writing',
        })}
      />
    )

    expect(screen.getByRole('heading', { name: /sessions left this week/i })).toBeInTheDocument()
    expect(screen.getByText('Weekly target')).toBeInTheDocument()
    expect(screen.getByText('This Week\'s Practice Blocks')).toBeInTheDocument()
    expect(screen.getByText('Session 1')).toBeInTheDocument()
  })

  it('hydrates server-backed history and personalizes the plan', () => {
    const initialEntries = [
      createHistoryEntry({
        id: 'entry-1',
        estimatedBand: 7,
        createdAt: new Date().toISOString(),
        priorities: ['Clarify the thesis in the introduction.'],
      }),
    ]
    state.entries = initialEntries

    render(
      <StudyPlanWorkspace
        learnerGoals={createLearnerGoals({
          targetBand: 8,
          studyFrequency: '4 sessions/week',
        })}
        initialEntries={initialEntries}
      />
    )

    expect(hydrateWritingHistoryMock).toHaveBeenCalledWith(initialEntries)
    expect(screen.getByText('Priority Focus')).toBeInTheDocument()
    expect(
      screen.getAllByText('Clarify the thesis in the introduction.').length
    ).toBeGreaterThan(0)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
