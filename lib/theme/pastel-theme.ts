import { cookies } from 'next/headers'
import { appThemeCookieName } from '@/lib/auth/cookie-names'

export const pastelThemes = [
  'peach',
  'mint',
  'sky',
  'lavender',
  'lemon',
  'blush',
  'seafoam',
  'apricot',
] as const

export const pastelThemeLabels: Record<PastelThemeName, string> = {
  peach: 'Peach Glow',
  mint: 'Mint Breeze',
  sky: 'Sky Whisper',
  lavender: 'Lavender Note',
  lemon: 'Lemon Cream',
  blush: 'Blush Bloom',
  seafoam: 'Seafoam Day',
  apricot: 'Apricot Light',
}

export type PastelThemeName = (typeof pastelThemes)[number]

export const defaultPastelTheme: PastelThemeName = 'peach'

export function isPastelTheme(value: string | null | undefined): value is PastelThemeName {
  return pastelThemes.includes(value as PastelThemeName)
}

export function resolvePastelTheme(value: string | null | undefined) {
  return isPastelTheme(value) ? value : defaultPastelTheme
}

export function pickNextPastelTheme() {
  return defaultPastelTheme
}

export async function readPastelThemeCookie() {
  const cookieStore = await cookies()
  return resolvePastelTheme(cookieStore.get(appThemeCookieName)?.value)
}

export async function assignNextPastelTheme() {
  const cookieStore = await cookies()
  const nextTheme = pickNextPastelTheme()

  cookieStore.set(appThemeCookieName, nextTheme, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })

  return nextTheme
}
