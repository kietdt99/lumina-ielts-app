import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RevisionStudioWorkspace } from '@/app/(app)/revision-studio/_components/revision-studio-workspace'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { createHistoryEntry } from '../helpers/fixtures'

const state = {
  entries: [] as WritingHistoryEntry[],
}

const hydrateWritingHistoryMock = vi.fn()

vi.mock('@/lib/ielts/writing-history', () => ({
  hydrateWritingHistory: (entries: WritingHistoryEntry[]) =>
    hydrateWritingHistoryMock(entries),
  getServerWritingHistorySnapshot: () => [],
  getWritingHistorySnapshot: () => state.entries,
  getWritingHistoryStorageKey: () => 'lumina-writing-history:test-learner',
  subscribeToWritingHistory: () => () => undefined,
}))

describe('RevisionStudioWorkspace', () => {
  beforeEach(() => {
    state.entries = []
    hydrateWritingHistoryMock.mockClear()
    window.localStorage.clear()
  })

  it('renders an empty state when no saved feedback is available', () => {
    render(<RevisionStudioWorkspace />)

    expect(
      screen.getByRole('heading', { name: 'Start your first revision studio' })
    ).toBeInTheDocument()
    expect(screen.getByText('No saved feedback to revise yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
    expect(screen.getByRole('link', { name: 'View review queue' })).toHaveAttribute(
      'href',
      '/review-queue'
    )
  })

  it('hydrates server-backed history and renders a focused rewrite workspace', () => {
    const initialEntries = [
      createHistoryEntry({
        id: 'entry-server',
        promptTitle: 'Server-backed revision session',
        estimatedBand: 7,
      }),
    ]
    state.entries = initialEntries

    render(<RevisionStudioWorkspace initialEntries={initialEntries} />)

    expect(hydrateWritingHistoryMock).toHaveBeenCalledWith(initialEntries)
    expect(
      screen.getByRole('heading', { name: '1 saved draft is ready for rewrite' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Rewrite one saved draft with a clear revision target',
      })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Server-backed revision session').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Clarify the topic sentence before adding more support.').length
    ).toBeGreaterThan(0)
    expect(screen.getByText('Checklist for this rewrite')).toBeInTheDocument()
    expect(screen.getAllByText('Add one concrete support move').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Open full detail' })).toHaveAttribute(
      'href',
      '/tracker/entry-server'
    )
    expect(screen.getByRole('link', { name: 'Check readiness' })).toHaveAttribute(
      'href',
      '/readiness-lab'
    )
  })

  it('updates rewrite metrics and stores the learner draft locally', () => {
    const initialEntries = [createHistoryEntry({ id: 'entry-draft' })]
    state.entries = initialEntries
    const rewriteDraft = Array.from({ length: 120 }, (_, index) => `word${index}`)
      .join(' ')

    render(<RevisionStudioWorkspace initialEntries={initialEntries} />)

    fireEvent.change(screen.getByLabelText('Rewrite draft'), {
      target: { value: rewriteDraft },
    })

    const metricRow = screen.getByText('Rewrite words').closest('.summary-box')
    expect(metricRow).not.toBeNull()
    expect(within(metricRow as HTMLElement).getByText('120')).toBeInTheDocument()
    expect(screen.getAllByText('Ready for readiness check').length).toBeGreaterThan(0)
    expect(
      JSON.parse(
        window.localStorage.getItem(
          'lumina-revision-studio-drafts:lumina-writing-history:test-learner'
        ) ?? '{}'
      )
    ).toEqual({
      'entry-draft': rewriteDraft,
    })
  })
})
