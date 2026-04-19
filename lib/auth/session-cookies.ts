import { cookies } from 'next/headers'
import { appSessionCookieName, appSessionHintCookieName } from './cookie-names'

export type AppSessionCookie = {
  userId: string
  passwordResetDeferred: boolean
}

function encodeCookieValue(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function decodeCookieValue<T>(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

export async function readAppSessionCookie() {
  try {
    const cookieStore = await cookies()
    return decodeCookieValue<AppSessionCookie>(
      cookieStore.get(appSessionCookieName)?.value
    )
  } catch {
    return null
  }
}

export async function writeAppSessionCookies(value: AppSessionCookie) {
  const cookieStore = await cookies()
  cookieStore.set(appSessionCookieName, encodeCookieValue(value), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  cookieStore.set(appSessionHintCookieName, value.userId, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })
}

export async function clearAppSessionCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(appSessionCookieName)
  cookieStore.delete(appSessionHintCookieName)
}
