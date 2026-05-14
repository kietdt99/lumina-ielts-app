import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PracticeSprintWorkspace } from '@/app/(app)/practice-sprint/_components/practice-sprint-workspace'
import { practiceSprints } from '@/lib/ielts/practice-sprint'

describe('PracticeSprintWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders ready-made practice sprints with writing handoff links', () => {
    render(<PracticeSprintWorkspace sprints={practiceSprints} />)

    expect(
      screen.getByRole('heading', { name: 'Start a focused IELTS writing sprint' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Remote work and employee productivity',
      })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Warm up vocabulary').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Start sprint in Writing' })[0]).toHaveAttribute(
      'href',
      '/writing?promptId=task2-remote-work&outline=1'
    )
  })

  it('filters sprints by task, difficulty, topic, and search', async () => {
    const user = userEvent.setup()

    render(<PracticeSprintWorkspace sprints={practiceSprints} />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))
    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Guided')
    await user.selectOptions(screen.getByLabelText('Topic focus'), 'Process diagram')
    await user.type(screen.getByLabelText('Search sprints'), 'water')

    expect(
      screen.getByRole('heading', { name: 'Water recycling process' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Remote work and employee productivity',
      })
    ).not.toBeInTheDocument()
  })

  it('tracks stage completion locally', async () => {
    const user = userEvent.setup()

    render(<PracticeSprintWorkspace sprints={practiceSprints} />)

    await user.type(screen.getByLabelText('Search sprints'), 'remote')
    await user.click(screen.getByLabelText('Mark Warm up vocabulary done'))

    expect(
      screen.getByLabelText('Unmark Warm up vocabulary done')
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Completed stages')).toBeInTheDocument()
    expect(screen.getByText('1/4')).toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<PracticeSprintWorkspace sprints={practiceSprints} />)

    await user.type(screen.getByLabelText('Search sprints'), 'no matching sprint')

    expect(screen.getByText('No practice sprints match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(
      screen.getByRole('heading', {
        name: 'Remote work and employee productivity',
      })
    ).toBeInTheDocument()
  })
})
