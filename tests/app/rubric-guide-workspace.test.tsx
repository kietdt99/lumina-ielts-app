import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RubricGuideWorkspace } from '@/app/(app)/rubric-guide/_components/rubric-guide-workspace'
import { writingRubricCriteria } from '@/lib/ielts/writing-rubric'

describe('RubricGuideWorkspace', () => {
  it('renders Task 2 rubric guidance by default', () => {
    render(<RubricGuideWorkspace criteria={writingRubricCriteria} />)

    expect(
      screen.getByRole('heading', { name: 'Understand what moves a writing band' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Task Response').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Coherence and Cohesion').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Band 7').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clear position').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
  })

  it('switches to Task 1 rubric guidance', async () => {
    const user = userEvent.setup()

    render(<RubricGuideWorkspace criteria={writingRubricCriteria} />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))

    expect(screen.getAllByText('Task Achievement').length).toBeGreaterThan(0)
    expect(screen.queryByText('Task Response')).not.toBeInTheDocument()
    expect(screen.getByText('Name the main pattern in the overview.')).toBeInTheDocument()
    expect(screen.getByText('No personal opinion')).toBeInTheDocument()
  })
})
