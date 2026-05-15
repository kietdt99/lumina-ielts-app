import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProgressInsightsWorkspace } from '@/app/(app)/progress-insights/_components/progress-insights-workspace'
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

describe('ProgressInsightsWorkspace', () => {
  beforeEach(() => {
    state.entries = []
    hydrateWritingHistoryMock.mockClear()
  })

  it('renders an empty progress state before saved feedback exists', () => {
    render(<ProgressInsightsWorkspace learnerGoals={createLearnerGoals()} />)

    expect(
      screen.getByRole('heading', { name: 'Build your first progress signal' })
    ).toBeInTheDocument()
    expect(screen.getByText('No progress pattern yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
    expect(screen.getByRole('link', { name: 'View study plan' })).toHaveAttribute(
      'href',
      '/study-plan'
    )
  })

  it('hydrates server-backed history and renders rubric insights', () => {
    const initialEntries = [
      createHistoryEntry({
        id: 'entry-progress-1',
        promptTitle: 'Progress insight session',
        estimatedBand: 6.5,
        priorities: ['Improve paragraph progression.', 'Add specific support.'],
        rubric: [
          {
            label: 'Task Response',
            score: 6.5,
            summary: 'Task response summary.',
          },
          {
            label: 'Coherence and Cohesion',
            score: 6,
            summary: 'Coherence summary.',
          },
          {
            label: 'Lexical Resource',
            score: 7,
            summary: 'Lexical summary.',
          },
          {
            label: 'Grammatical Range and Accuracy',
            score: 6.5,
            summary: 'Grammar summary.',
          },
        ],
      }),
    ]
    state.entries = initialEntries

    render(
      <ProgressInsightsWorkspace
        learnerGoals={createLearnerGoals({ targetBand: 7.5 })}
        initialEntries={initialEntries}
      />
    )

    expect(hydrateWritingHistoryMock).toHaveBeenCalledWith(initialEntries)
    expect(
      screen.getByRole('heading', { name: 'Close a 1.0 band gap with focused practice' })
    ).toBeInTheDocument()
    expect(screen.getByText('Rubric heatmap')).toBeInTheDocument()
    expect(screen.getAllByText('Coherence and Cohesion').length).toBeGreaterThan(0)
    expect(screen.getByText('Improve paragraph progression.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open tracker' })).toHaveAttribute(
      'href',
      '/tracker'
    )
    expect(screen.getAllByRole('link', { name: 'Start action' })[0]).toHaveAttribute(
      'href',
      '/outline-builder'
    )
  })
})
