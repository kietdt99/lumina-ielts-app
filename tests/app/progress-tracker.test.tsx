import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { ProgressTracker } from '@/app/(app)/tracker/_components/progress-tracker'
import { createHistoryEntry } from '../helpers/fixtures'

const state = {
  entries: [] as WritingHistoryEntry[],
}

const clearWritingHistoryMock = vi.fn()

vi.mock('@/lib/ielts/writing-history', () => ({
  clearWritingHistory: () => clearWritingHistoryMock(),
  getWritingHistorySnapshot: () => state.entries,
  subscribeToWritingHistory: () => () => undefined,
}))

describe('ProgressTracker', () => {
  beforeEach(() => {
    state.entries = []
    clearWritingHistoryMock.mockClear()
  })

  it('renders an empty state when there is no saved history', () => {
    render(<ProgressTracker />)

    expect(
      screen.getByText('No tracked writing sessions yet')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open writing workspace' })
    ).toHaveAttribute('href', '/writing')
  })

  it('shows the selected session detail and lets the user switch between entries', async () => {
    const user = userEvent.setup()

    state.entries = [
      createHistoryEntry({
        id: 'entry-2',
        promptTitle: 'AI tools in school education',
        taskType: 'Task 2',
        estimatedBand: 7.5,
        priorities: ['Refine the final paragraph with a clearer judgement.'],
      }),
      createHistoryEntry({
        id: 'entry-1',
        promptTitle: 'Water recycling process',
        taskType: 'Task 1',
        estimatedBand: 6.5,
        priorities: ['Improve the overview sentence.'],
      }),
    ]

    render(<ProgressTracker />)

    expect(
      screen.getByRole('button', { name: /AI tools in school education/i })
    ).toBeInTheDocument()

    const detailPanel = screen.getByText('Session detail').closest('aside')
    expect(detailPanel).not.toBeNull()
    expect(
      within(detailPanel as HTMLElement).getByText(
        'Refine the final paragraph with a clearer judgement.'
      )
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Water recycling process/i })
    )

    expect(
      within(detailPanel as HTMLElement).getByText('Improve the overview sentence.')
    ).toBeInTheDocument()
  })

  it('filters by task and clears local history from the toolbar', async () => {
    const user = userEvent.setup()

    state.entries = [
      createHistoryEntry({
        id: 'entry-2',
        promptTitle: 'AI tools in school education',
        taskType: 'Task 2',
      }),
      createHistoryEntry({
        id: 'entry-1',
        promptTitle: 'Water recycling process',
        taskType: 'Task 1',
      }),
    ]

    render(<ProgressTracker />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))

    expect(
      screen.getByRole('button', { name: /Water recycling process/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /AI tools in school education/i })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear local history' }))

    expect(clearWritingHistoryMock).toHaveBeenCalledTimes(1)
  })
})
