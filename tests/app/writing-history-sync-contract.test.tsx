import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultLearnerGoals } from '@/lib/learner/learner-goals'

const syncContract = vi.hoisted(() => {
  return {
    useSyncExternalStoreMock: vi.fn(() => []),
    subscribeToWritingHistory: vi.fn(),
    getWritingHistorySnapshot: vi.fn(() => []),
    getServerWritingHistorySnapshot: vi.fn(() => []),
  }
})

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')

  return {
    ...actual,
    useSyncExternalStore: syncContract.useSyncExternalStoreMock,
  }
})

vi.mock('@/lib/ielts/writing-history', () => ({
  subscribeToWritingHistory: syncContract.subscribeToWritingHistory,
  getWritingHistorySnapshot: syncContract.getWritingHistorySnapshot,
  getServerWritingHistorySnapshot: syncContract.getServerWritingHistorySnapshot,
  clearWritingHistory: vi.fn(),
}))

vi.mock('@/app/auth/actions', () => ({
  signout: vi.fn(),
}))

describe('writing history sync contract', () => {
  beforeEach(() => {
    syncContract.useSyncExternalStoreMock.mockClear()
    syncContract.subscribeToWritingHistory.mockClear()
    syncContract.getWritingHistorySnapshot.mockClear()
    syncContract.getServerWritingHistorySnapshot.mockClear()
  })

  it('wires DashboardOverview to a dedicated server snapshot', async () => {
    const { DashboardOverview } = await import(
      '@/app/(app)/_components/dashboard-overview'
    )

    render(
      <DashboardOverview
        learnerGoals={defaultLearnerGoals}
        learnerName="Demo Learner"
      />
    )

    expect(syncContract.useSyncExternalStoreMock).toHaveBeenCalledTimes(1)
    const [, , getServerSnapshot] =
      syncContract.useSyncExternalStoreMock.mock.calls[0] ?? []
    expect(syncContract.useSyncExternalStoreMock.mock.calls[0]?.[0]).toBe(
      syncContract.subscribeToWritingHistory
    )
    expect(syncContract.useSyncExternalStoreMock.mock.calls[0]?.[1]).toBe(
      syncContract.getWritingHistorySnapshot
    )
    expect(typeof getServerSnapshot).toBe('function')
    expect(getServerSnapshot()).toEqual([])
  })

  it('wires ProgressTracker to a dedicated server snapshot', async () => {
    const { ProgressTracker } = await import(
      '@/app/(app)/tracker/_components/progress-tracker'
    )

    render(<ProgressTracker learnerGoals={defaultLearnerGoals} />)

    expect(syncContract.useSyncExternalStoreMock).toHaveBeenCalledTimes(1)
    const [, , getServerSnapshot] =
      syncContract.useSyncExternalStoreMock.mock.calls[0] ?? []
    expect(syncContract.useSyncExternalStoreMock.mock.calls[0]?.[0]).toBe(
      syncContract.subscribeToWritingHistory
    )
    expect(syncContract.useSyncExternalStoreMock.mock.calls[0]?.[1]).toBe(
      syncContract.getWritingHistorySnapshot
    )
    expect(typeof getServerSnapshot).toBe('function')
    expect(getServerSnapshot()).toEqual([])
  })
})
