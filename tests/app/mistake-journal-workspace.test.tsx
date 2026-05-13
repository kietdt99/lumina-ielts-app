import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MistakeJournalWorkspace } from '@/app/(app)/mistake-journal/_components/mistake-journal-workspace'
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

describe('MistakeJournalWorkspace', () => {
  beforeEach(() => {
    state.entries = []
    hydrateWritingHistoryMock.mockClear()
  })

  it('renders an empty state when no mistake evidence exists', () => {
    render(<MistakeJournalWorkspace />)

    expect(screen.getByRole('heading', { name: 'Build your mistake journal' })).toBeInTheDocument()
    expect(screen.getByText('No mistake patterns yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open writing workspace' })
    ).toHaveAttribute('href', '/writing')
  })

  it('hydrates server-backed history and renders mistake patterns', () => {
    const initialEntries = [
      createHistoryEntry({
        id: 'entry-server',
        promptTitle: 'Server-backed mistake session',
        priorities: ['Add more development and concrete evidence to body paragraph two.'],
      }),
    ]
    state.entries = initialEntries

    render(<MistakeJournalWorkspace initialEntries={initialEntries} />)

    expect(hydrateWritingHistoryMock).toHaveBeenCalledWith(initialEntries)
    expect(
      screen.getByRole('heading', { name: /\d+ mistake patterns found/ })
    ).toBeInTheDocument()
    expect(screen.getByText('Top Pattern')).toBeInTheDocument()
    expect(screen.getByText('Recurring Mistake Patterns')).toBeInTheDocument()
    expect(screen.getAllByText('Underdeveloped supporting ideas').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Server-backed mistake session').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Server-backed mistake session/i })[0]).toHaveAttribute(
      'href',
      '/tracker/entry-server'
    )
  })
})
