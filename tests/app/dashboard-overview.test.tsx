import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { DashboardOverview } from '@/app/(app)/_components/dashboard-overview'
import { createHistoryEntry, createLearnerGoals } from '../helpers/fixtures'

const state = {
  authEnabled: false,
  entries: [] as WritingHistoryEntry[],
}

vi.mock('@/app/auth/actions', () => ({
  signout: vi.fn(),
}))

vi.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: () => state.authEnabled,
}))

vi.mock('@/lib/ielts/writing-history', () => ({
  getServerWritingHistorySnapshot: () => [],
  getWritingHistorySnapshot: () => state.entries,
  subscribeToWritingHistory: () => () => undefined,
}))

describe('DashboardOverview', () => {
  beforeEach(() => {
    state.authEnabled = false
    state.entries = []
  })

  it('renders a demo empty state when no writing history exists', () => {
    render(<DashboardOverview learnerGoals={createLearnerGoals()} />)

    expect(screen.getByText('Demo mode')).toBeInTheDocument()
    expect(screen.getByText('No activity saved yet.')).toBeInTheDocument()
    expect(screen.getByText('Target Band')).toBeInTheDocument()
    expect(screen.getByText('Update goals')).toHaveAttribute('href', '/settings')
    expect(
      screen.getByRole('link', { name: 'Start writing practice' })
    ).toHaveAttribute('href', '/writing')
  })

  it('renders metrics, recent activity, and auth actions when history exists', () => {
    state.authEnabled = true
    state.entries = [
      createHistoryEntry({
        id: 'entry-4',
        promptTitle: 'Entry Four',
        estimatedBand: 7.5,
        createdAt: '2026-03-31T13:00:00.000Z',
      }),
      createHistoryEntry({
        id: 'entry-3',
        promptTitle: 'Entry Three',
        estimatedBand: 7,
        createdAt: '2026-03-31T12:00:00.000Z',
      }),
      createHistoryEntry({
        id: 'entry-2',
        promptTitle: 'Entry Two',
        estimatedBand: 6.5,
        createdAt: '2026-03-31T11:00:00.000Z',
      }),
      createHistoryEntry({
        id: 'entry-1',
        promptTitle: 'Entry One',
        estimatedBand: 6,
        createdAt: '2026-03-31T10:00:00.000Z',
      }),
    ]

    render(
      <DashboardOverview
        learnerGoals={createLearnerGoals({
          targetBand: 8,
          focusSkill: 'Speaking',
          studyFrequency: 'Daily',
        })}
      />
    )

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    expect(screen.getByText('Average Band')).toBeInTheDocument()
    expect(screen.getByText('Best Result')).toBeInTheDocument()
    expect(screen.getByText('8.0')).toBeInTheDocument()
    expect(screen.getByText(/Focus skill: Speaking/)).toBeInTheDocument()
    expect(screen.getAllByText('7.5')).not.toHaveLength(0)
    expect(screen.getAllByText('Entry Four')).not.toHaveLength(0)
    expect(screen.getByText('Entry Three')).toBeInTheDocument()
    expect(screen.getByText('Entry Two')).toBeInTheDocument()
    expect(screen.queryByText('Entry One')).not.toBeInTheDocument()
  })
})
