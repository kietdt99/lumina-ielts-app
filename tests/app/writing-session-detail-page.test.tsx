import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { WritingSessionDetailPage } from '@/app/(app)/tracker/_components/writing-session-detail-page'
import { createHistoryEntry } from '../helpers/fixtures'

const state = {
  entries: [] as WritingHistoryEntry[],
}

vi.mock('@/lib/ielts/writing-history', () => ({
  getServerWritingHistorySnapshot: () => [],
  getWritingHistorySnapshot: () => state.entries,
  subscribeToWritingHistory: () => () => undefined,
}))

describe('WritingSessionDetailPage', () => {
  beforeEach(() => {
    state.entries = []
  })

  it('renders a missing-session state when the entry cannot be found', () => {
    render(<WritingSessionDetailPage entryId="missing-entry" />)

    expect(
      screen.getByText('That writing session is no longer available')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to tracker' })).toHaveAttribute(
      'href',
      '/tracker'
    )
  })

  it('renders the full session detail when the entry exists', () => {
    state.entries = [
      createHistoryEntry({
        id: 'entry-1',
        promptTitle: 'Remote work and employee productivity',
        estimatedBand: 7.5,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
    ]

    render(<WritingSessionDetailPage entryId="entry-1" />)

    expect(
      screen.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeInTheDocument()
    expect(screen.getByText('Rubric breakdown')).toBeInTheDocument()
    expect(screen.getByText('Clarify the thesis in the introduction.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open writing workspace' })
    ).toHaveAttribute('href', '/writing')
  })
})
