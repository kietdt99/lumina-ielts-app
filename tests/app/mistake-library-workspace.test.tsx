import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MistakeLibraryWorkspace } from '@/app/(app)/mistake-library/_components/mistake-library-workspace'
import { writingMistakeTaxonomy } from '@/lib/ielts/mistake-taxonomy'

describe('MistakeLibraryWorkspace', () => {
  it('renders mistake patterns with revision guidance', () => {
    render(<MistakeLibraryWorkspace items={writingMistakeTaxonomy} />)

    expect(
      screen.getByRole('heading', {
        name: 'Learn the mistakes before they steal band points',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Missing or vague overview')).toBeInTheDocument()
    expect(screen.getAllByText('Band risk').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Practice drill').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Open mistake journal' })).toHaveAttribute(
      'href',
      '/mistake-journal'
    )
  })

  it('filters patterns by task type, criterion, and search', async () => {
    const user = userEvent.setup()

    render(<MistakeLibraryWorkspace items={writingMistakeTaxonomy} />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))
    await user.selectOptions(
      screen.getByLabelText('Rubric criterion'),
      'Task Achievement'
    )

    expect(screen.getByText('Missing or vague overview')).toBeInTheDocument()
    expect(screen.queryByText('Unclear essay position')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Rubric criterion'), 'All')
    await user.type(screen.getByLabelText('Search mistake patterns'), 'numbers')

    expect(screen.getByText('Detail dump without grouping')).toBeInTheDocument()
    expect(screen.queryByText('Missing or vague overview')).not.toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<MistakeLibraryWorkspace items={writingMistakeTaxonomy} />)

    await user.type(screen.getByLabelText('Search mistake patterns'), 'not a pattern')

    expect(screen.getByText('No mistake patterns match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByText('Missing or vague overview')).toBeInTheDocument()
  })
})
