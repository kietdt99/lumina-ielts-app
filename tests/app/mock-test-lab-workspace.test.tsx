import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MockTestLabWorkspace } from '@/app/(app)/mock-test/_components/mock-test-lab-workspace'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'

function words(count: number) {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(' ')
}

describe('MockTestLabWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders mock test pairs with a 60-minute writing workspace', () => {
    render(<MockTestLabWorkspace tests={writingMockTests} />)

    expect(
      screen.getByRole('heading', {
        name: 'Complete a full IELTS Writing mock test',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('60-minute simulation')).toBeInTheDocument()
    expect(screen.getByLabelText('Task 1 draft')).toBeInTheDocument()
    expect(screen.getByLabelText('Task 2 draft')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Task 1 in Writing' })).toHaveAttribute(
      'href',
      '/writing?promptId=task1-cycle-diagram'
    )
  })

  it('filters mock tests by topic and search', async () => {
    const user = userEvent.setup()

    render(<MockTestLabWorkspace tests={writingMockTests} />)

    await user.selectOptions(screen.getByLabelText('Topic pair'), 'Environment and climate')
    await user.type(screen.getByLabelText('Search mock tests'), 'energy')

    expect(
      screen.getAllByText('Household energy use trends + Environmental responsibility')
        .length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText('Water recycling process + Remote work and employee productivity')
    ).not.toBeInTheDocument()
  })

  it('tracks draft word counts and completed checkpoints locally', async () => {
    const user = userEvent.setup()

    render(<MockTestLabWorkspace tests={writingMockTests} />)

    fireEvent.change(screen.getByLabelText('Task 1 draft'), {
      target: { value: words(150) },
    })
    fireEvent.change(screen.getByLabelText('Task 2 draft'), {
      target: { value: words(250) },
    })
    await user.click(screen.getByLabelText('Mark Scan both tasks done'))

    expect(
      screen.getByLabelText('Unmark Scan both tasks done')
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Target met').length).toBe(2)
    expect(screen.getByText('Ready for feedback')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()

    const storedState = JSON.parse(
      window.localStorage.getItem('lumina-mock-test-lab') ?? '{}'
    ) as Record<string, { completedCheckpoints: string[] }>
    expect(storedState[writingMockTests[0].id].completedCheckpoints).toEqual([
      'scan-prompts',
    ])
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<MockTestLabWorkspace tests={writingMockTests} />)

    await user.type(screen.getByLabelText('Search mock tests'), 'no matching mock')

    expect(screen.getByText('No mock tests match this filter')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Reset filters' })[0])

    expect(screen.getByLabelText('Task 1 draft')).toBeInTheDocument()
  })
})
