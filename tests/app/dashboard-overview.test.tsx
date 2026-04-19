import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import { DashboardOverview } from '@/app/(app)/_components/dashboard-overview'
import { createHistoryEntry, createLearnerGoals } from '../helpers/fixtures'

const state = {
  entries: [] as WritingHistoryEntry[],
}

vi.mock('@/app/auth/actions', () => ({
  signout: vi.fn(),
}))

vi.mock('@/lib/ielts/writing-history', () => ({
  getServerWritingHistorySnapshot: () => [],
  getWritingHistorySnapshot: () => state.entries,
  subscribeToWritingHistory: () => () => undefined,
}))

describe('DashboardOverview', () => {
  beforeEach(() => {
    state.entries = []
  })

  it('renders an empty state when no writing history exists', () => {
    render(
      <DashboardOverview
        learnerGoals={createLearnerGoals()}
        learnerName="Demo Learner"
      />
    )

    expect(screen.getByText('Welcome back, Demo Learner')).toBeInTheDocument()
    expect(screen.getByText('No activity saved yet.')).toBeInTheDocument()
    expect(screen.getByText('Target Band')).toBeInTheDocument()
    expect(screen.getByText('Update goals')).toHaveAttribute(
      'href',
      '/settings/profile'
    )
    expect(screen.getByText('Start your writing study loop')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start writing practice' })
    ).toHaveAttribute('href', '/writing')
  })

  it('renders metrics, recent activity, and auth actions when history exists', () => {
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
        learnerName="Ava"
      />
    )

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    expect(screen.getByText('Average Band')).toBeInTheDocument()
    expect(screen.getByText('Best Result')).toBeInTheDocument()
    expect(screen.getByText('8.0')).toBeInTheDocument()
    expect(screen.getByText(/Focus skill: Speaking/)).toBeInTheDocument()
    expect(screen.getByText('Close the gap to Band 8.0')).toBeInTheDocument()
    expect(screen.getByText('Recent average')).toBeInTheDocument()
    expect(screen.getByText('Recurring focus')).toBeInTheDocument()
    expect(
      screen.getAllByText('Develop the second body paragraph with more precise support.')
        .length
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('7.5')).not.toHaveLength(0)
    expect(screen.getAllByText('Entry Four')).not.toHaveLength(0)
    expect(screen.getByText('Entry Three')).toBeInTheDocument()
    expect(screen.getByText('Entry Two')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Open detail' })[0]).toHaveAttribute(
      'href',
      '/tracker/entry-4'
    )
    expect(screen.queryByText('Entry One')).not.toBeInTheDocument()
  })
})
