import { cookies } from 'next/headers'

export const appLanguageCookieName = 'lumina-app-language'

export const appLanguages = ['vi', 'en'] as const

export type AppLanguage = (typeof appLanguages)[number]

export const defaultAppLanguage: AppLanguage = 'vi'

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return appLanguages.includes(value as AppLanguage)
}

export function resolveAppLanguage(value: string | null | undefined) {
  return isAppLanguage(value) ? value : defaultAppLanguage
}

export async function readAppLanguageCookie() {
  const cookieStore = await cookies()
  return resolveAppLanguage(cookieStore.get(appLanguageCookieName)?.value)
}
