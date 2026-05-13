import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReviewQueueWorkspace } from '@/app/(app)/review-queue/_components/review-queue-workspace'
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
  subscribeToWritingHistory: () => () => undefined,
}))

describe('ReviewQueueWorkspace', () => {
  beforeEach(() => {
    state.entries = []
    hydrateWritingHistoryMock.mockClear()
  })

  it('renders an empty state for learners without saved feedback', () => {
    render(<ReviewQueueWorkspace />)

    expect(screen.getByRole('heading', { name: 'Start your first review loop' })).toBeInTheDocument()
    expect(screen.getByText('No revision actions yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open writing workspace' })
    ).toHaveAttribute('href', '/writing')
  })

  it('hydrates server-backed history and renders review cards', () => {
    const initialEntries = [
      createHistoryEntry({
        id: 'entry-server',
        promptTitle: 'Server-backed revision session',
        estimatedBand: 7,
      }),
    ]
    state.entries = initialEntries

    render(<ReviewQueueWorkspace initialEntries={initialEntries} />)

    expect(hydrateWritingHistoryMock).toHaveBeenCalledWith(initialEntries)
    expect(screen.getByRole('heading', { name: '3 review actions ready' })).toBeInTheDocument()
    expect(screen.getByText('Review actions')).toBeInTheDocument()
    expect(screen.getByText('Highest Impact')).toBeInTheDocument()
    expect(screen.getByText('Today\'s Revision Queue')).toBeInTheDocument()
    expect(screen.getAllByText('Server-backed revision session').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Clarify the topic sentence before adding more support.').length
    ).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Open full detail' })[0]).toHaveAttribute(
      'href',
      '/tracker/entry-server'
    )
  })
})
