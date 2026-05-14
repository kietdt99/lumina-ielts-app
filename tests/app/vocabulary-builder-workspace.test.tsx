import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { VocabularyBuilderWorkspace } from '@/app/(app)/vocabulary-builder/_components/vocabulary-builder-workspace'
import { vocabularyBuilderCards } from '@/lib/ielts/vocabulary-builder'

describe('VocabularyBuilderWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders topic vocabulary recall cards', () => {
    render(<VocabularyBuilderWorkspace cards={vocabularyBuilderCards} />)

    expect(
      screen.getByRole('heading', {
        name: 'Turn useful vocabulary into active IELTS recall',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('renewable energy')).toBeInTheDocument()
    expect(screen.getByText('reduce environmental impact')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
  })

  it('filters cards by task, card type, topic, and search', async () => {
    const user = userEvent.setup()

    render(<VocabularyBuilderWorkspace cards={vocabularyBuilderCards} />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))
    await user.selectOptions(screen.getByLabelText('Card type'), 'Collocation')
    await user.selectOptions(
      screen.getByLabelText('Topic focus'),
      'Environment and climate'
    )
    await user.type(screen.getByLabelText('Search vocabulary'), 'impact')

    expect(screen.getByText('reduce environmental impact')).toBeInTheDocument()
    expect(screen.queryByText('renewable energy')).not.toBeInTheDocument()
  })

  it('marks cards as known or needing practice', async () => {
    const user = userEvent.setup()

    render(<VocabularyBuilderWorkspace cards={vocabularyBuilderCards} />)

    await user.click(screen.getAllByRole('button', { name: 'I know this' })[0])

    expect(screen.getByText('1 known cards')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Needs practice' })[1])

    expect(screen.getByText('1 known cards')).toBeInTheDocument()
    expect(screen.getByText('1 practice cards')).toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<VocabularyBuilderWorkspace cards={vocabularyBuilderCards} />)

    await user.type(screen.getByLabelText('Search vocabulary'), 'no matching card')

    expect(screen.getByText('No vocabulary cards match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByText('renewable energy')).toBeInTheDocument()
  })
})
