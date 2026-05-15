import { describe, expect, it, vi } from 'vitest'
import {
  defaultPastelTheme,
  pastelThemes,
  pickNextPastelTheme,
  resolvePastelTheme,
} from '@/lib/theme/pastel-theme'

describe('pastel theme helpers', () => {
  it('resolves unknown values to the default theme', () => {
    expect(resolvePastelTheme('unknown-theme')).toBe(defaultPastelTheme)
    expect(resolvePastelTheme(null)).toBe(defaultPastelTheme)
  })

  it('returns a known pastel theme unchanged', () => {
    expect(resolvePastelTheme('mint')).toBe('mint')
  })

  it('keeps peach as the stable app theme', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(pickNextPastelTheme()).toBe(defaultPastelTheme)
  })

  it('always returns a valid theme name', () => {
    const selectedTheme = pickNextPastelTheme()

    expect(pastelThemes).toContain(selectedTheme)
  })
})
